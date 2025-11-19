/**
 * CSV Parser Module
 *
 * Parses projects.csv into Project objects matching the existing TypeScript interfaces.
 * Handles multiple rows per project (components), validates data, and provides
 * comprehensive error reporting.
 *
 * @module scripts/lib/csv/parser
 */

import * as fs from "fs/promises";
import * as Papa from "papaparse";
import {
  ComponentCategory,
  ComponentSubcategory,
} from "../../../core/types/ComponentCategory";
import { Project } from "../../../core/types/Project";
import { ProjectComponent } from "../../../core/types/ProjectComponent";
import { ProjectManager } from "../../../core/types/ProjectManager";
import {
  PROJECT_STATUSES,
  ProjectStatus,
  isValidProjectStatus,
} from "../../../core/types/Status";

/**
 * Raw CSV row structure (matches CSV columns exactly)
 */
interface CSVRow {
  number: string;
  name: string;
  category: string;
  subcategory?: string;
  componentName?: string;
  isFeatured?: string;
  projectManagers?: string;
  summary: string;
  description: string;
  "location.zipCode"?: string;
  "location.neighborhood"?: string;
  "timeline.duration"?: string;
  status: string;
  tags?: string;
}

/**
 * Validation result for a single row
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Overall parse result
 */
export interface ParseResult {
  success: boolean;
  projects: Project[];
  errors: ParseError[];
  warnings: ParseWarning[];
  stats: ParseStats;
}

/**
 * Error information for a specific parsing issue
 */
export interface ParseError {
  row?: number;
  projectNumber?: string;
  field?: string;
  message: string;
}

/**
 * Warning information for non-critical issues
 */
export interface ParseWarning {
  row?: number;
  projectNumber?: string;
  message: string;
}

/**
 * Statistics about the parsing operation
 */
export interface ParseStats {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalProjects: number;
  totalComponents: number;
  processingTime: number;
}

/**
 * Parses semicolon-separated string into array
 *
 * Helper for tags, projectManagers, etc.
 * Handles empty strings, whitespace, and multiple separators.
 *
 * @param value - String like "tag1;tag2;tag3" or undefined
 * @returns Array like ["tag1", "tag2", "tag3"] or empty array
 */
function parseMultiValue(value: string | undefined): string[] {
  if (!value || value.trim() === "") {
    return [];
  }

  return value
    .split(";")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Validates a single CSV row has required fields
 *
 * Checks for required fields, valid status values, and data consistency.
 * Returns validation result with errors and warnings.
 *
 * @param row - Raw CSV row data
 * @param rowNumber - Row number for error reporting (1-indexed)
 * @returns ValidationResult with errors if any
 */
function validateRow(row: CSVRow, rowNumber: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field: number
  if (!row.number || row.number.trim() === "") {
    errors.push(`Missing required field "number"`);
  }

  // Required field: name
  if (!row.name || row.name.trim() === "") {
    errors.push(`Missing required field "name"`);
  }

  // Required field: category
  if (!row.category || row.category.trim() === "") {
    errors.push(`Missing required field "category"`);
  }

  // Required field: status
  if (!row.status || row.status.trim() === "") {
    errors.push(`Missing required field "status"`);
  } else if (!isValidProjectStatus(row.status.trim())) {
    errors.push(
      `Invalid status "${row.status}". Must be one of: ${Object.values(
        PROJECT_STATUSES
      ).join(", ")}`
    );
  }

  // Warning: missing summary
  if (!row.summary || row.summary.trim() === "") {
    warnings.push(`Missing "summary" field (recommended)`);
  }

  // Warning: missing description
  if (!row.description || row.description.trim() === "") {
    warnings.push(`Missing "description" field (recommended)`);
  }

  // Warning: outdoor project without subcategory
  const categoryLower = row.category?.toLowerCase().trim();
  if (categoryLower === "outdoor-living" || categoryLower === "outdoor") {
    if (!row.subcategory || row.subcategory.trim() === "") {
      warnings.push(
        `Outdoor project missing "subcategory" (pool, deck, patio, etc.)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Groups CSV rows by project number
 *
 * Multiple rows with the same number represent components of the same project.
 *
 * @param rows - Array of validated CSV rows
 * @returns Map<projectNumber, rows[]>
 */
function groupRowsByProject(rows: CSVRow[]): Map<string, CSVRow[]> {
  const grouped = new Map<string, CSVRow[]>();

  for (const row of rows) {
    const projectNumber = row.number.trim();
    if (!grouped.has(projectNumber)) {
      grouped.set(projectNumber, []);
    }
    grouped.get(projectNumber)!.push(row);
  }

  return grouped;
}

/**
 * Checks if project-level fields are consistent across rows
 *
 * Fields like name, summary, description should be the same for all rows
 * with the same project number. Warns if inconsistencies are found.
 *
 * @param rows - All CSV rows for a project
 * @param projectNumber - Project number for error reporting
 * @returns Array of warning messages
 */
function checkProjectFieldConsistency(
  rows: CSVRow[],
  projectNumber: string
): string[] {
  const warnings: string[] = [];

  if (rows.length <= 1) {
    return warnings; // No consistency check needed for single row
  }

  // Check name consistency
  const names = new Set(rows.map((r) => r.name?.trim()).filter(Boolean));
  if (names.size > 1) {
    warnings.push(
      `Inconsistent "name" field across rows: ${Array.from(names).join(", ")}`
    );
  }

  // Check summary consistency
  const summaries = new Set(rows.map((r) => r.summary?.trim()).filter(Boolean));
  if (summaries.size > 1) {
    warnings.push(`Inconsistent "summary" field across rows`);
  }

  // Check description consistency
  const descriptions = new Set(
    rows.map((r) => r.description?.trim()).filter(Boolean)
  );
  if (descriptions.size > 1) {
    warnings.push(`Inconsistent "description" field across rows`);
  }

  // Check status consistency
  const statuses = new Set(rows.map((r) => r.status?.trim()).filter(Boolean));
  if (statuses.size > 1) {
    warnings.push(
      `Inconsistent "status" field across rows: ${Array.from(statuses).join(
        ", "
      )}`
    );
  }

  return warnings;
}

/**
 * Converts grouped rows into a Project object
 *
 * Takes all CSV rows for a project and creates a Project with multiple components.
 * Uses the first row for project-level fields, creates components from all rows.
 *
 * @param projectNumber - Project number (e.g., "187")
 * @param rows - All CSV rows for this project
 * @returns Project object matching types/Project.ts interface
 */
function convertRowsToProject(projectNumber: string, rows: CSVRow[]): Project {
  // Use first row for project-level fields
  const firstRow = rows[0];

  // Parse project managers
  const projectManagers: ProjectManager[] = parseMultiValue(
    firstRow.projectManagers
  ).map((name) => ({ name }));

  // Parse tags
  const tags = parseMultiValue(firstRow.tags);

  // Parse isFeatured (handle string "true"/"false" or empty)
  const isFeatured =
    firstRow.isFeatured?.toLowerCase().trim() === "true" ||
    firstRow.isFeatured?.toLowerCase().trim() === "1";

  // Build location object
  const location: Project["location"] = {};
  if (firstRow["location.zipCode"]?.trim()) {
    location.zipCode = firstRow["location.zipCode"].trim();
  }
  if (firstRow["location.neighborhood"]?.trim()) {
    location.neighborhood = firstRow["location.neighborhood"].trim();
  }

  // Build timeline object
  const timeline: Project["timeline"] = {};
  if (firstRow["timeline.duration"]?.trim()) {
    timeline.duration = firstRow["timeline.duration"].trim();
  }

  // Create components from all rows
  // Track category usage to ensure unique IDs
  const categoryCounts = new Map<string, number>();
  const components: ProjectComponent[] = rows.map((row) => {
    const categoryKey = row.category.trim();
    const count = categoryCounts.get(categoryKey) || 0;
    categoryCounts.set(categoryKey, count + 1);

    // Generate unique component ID
    // Format: {number}-{category}[-{subcategory}][-{index}]
    let componentId = `${projectNumber}-${categoryKey}`;
    if (row.subcategory?.trim()) {
      componentId += `-${row.subcategory.trim()}`;
    }
    // Add index if multiple components share same category/subcategory
    if (count > 0) {
      componentId += `-${count}`;
    }

    const component: ProjectComponent = {
      // Identity
      id: componentId,
      category: categoryKey as ComponentCategory,
      ...(row.subcategory?.trim() && {
        subcategory: row.subcategory.trim() as ComponentSubcategory,
      }),

      // Display overrides (optional - will fall back to project values)
      ...(row.componentName?.trim() && { name: row.componentName.trim() }),

      // Content (required, can be empty)
      media: [],

      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return component;
  });

  // Create project object
  const project: Project = {
    // Identity
    id: projectNumber, // Use project number as ID
    number: projectNumber,
    name: firstRow.name.trim(),

    // Display defaults
    summary: firstRow.summary?.trim() || "",
    description: firstRow.description?.trim() || "",
    scope: "", // Not in CSV, will need to be set separately
    thumbnail: "", // Not in CSV, will need to be set separately

    // Location
    ...(Object.keys(location).length > 0 && { location }),

    // Timeline
    ...(Object.keys(timeline).length > 0 && { timeline }),

    // Project team
    ...(projectManagers.length > 0 && { projectManagers }),

    // Components (required)
    components,

    // Metadata
    status: firstRow.status.trim() as ProjectStatus,
    ...(tags.length > 0 && { tags }),
    ...(isFeatured && { isFeatured }),

    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return project;
}

/**
 * Main entry point - parses CSV file into Project objects
 *
 * Reads the CSV file, validates all rows, groups by project number,
 * converts to Project objects, and returns comprehensive results.
 *
 * @param csvPath - Absolute path to projects.csv
 * @returns Promise<ParseResult> with projects, errors, warnings, and stats
 */
export async function parseProjectsCSV(csvPath: string): Promise<ParseResult> {
  const startTime = Date.now();
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];
  const projects: Project[] = [];

  console.log(`📄 Parsing CSV: ${csvPath}`);

  try {
    // Read CSV file
    const csvContent = await fs.readFile(csvPath, "utf-8");

    if (!csvContent || csvContent.trim().length === 0) {
      warnings.push({
        message: "CSV file is empty",
      });
      return {
        success: true,
        projects: [],
        errors: [],
        warnings,
        stats: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          totalProjects: 0,
          totalComponents: 0,
          processingTime: Date.now() - startTime,
        },
      };
    }

    // Parse CSV with papaparse
    const parseResult = Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => (value ? value.trim() : ""),
    });

    if (parseResult.errors.length > 0) {
      for (const parseError of parseResult.errors) {
        errors.push({
          row: parseError.row !== undefined ? parseError.row + 1 : undefined,
          message: `CSV parse error: ${parseError.message}`,
        });
      }
    }

    const rawRows = parseResult.data;
    console.log(`✅ Read ${rawRows.length} rows from CSV`);

    if (rawRows.length === 0) {
      warnings.push({
        message: "CSV contains no data rows (only headers)",
      });
      return {
        success: true,
        projects: [],
        errors: [],
        warnings,
        stats: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          totalProjects: 0,
          totalComponents: 0,
          processingTime: Date.now() - startTime,
        },
      };
    }

    // Validate rows
    console.log(`🔍 Validating rows...`);
    const validRows: CSVRow[] = [];
    const invalidRowNumbers: number[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNumber = i + 1; // 1-indexed for user-friendly reporting

      const validation = validateRow(row, rowNumber);

      if (!validation.valid) {
        invalidRowNumbers.push(rowNumber);
        for (const errorMsg of validation.errors) {
          errors.push({
            row: rowNumber,
            projectNumber: row.number?.trim(),
            message: errorMsg,
          });
        }
      } else {
        validRows.push(row);
      }

      // Add warnings even for valid rows
      for (const warningMsg of validation.warnings) {
        warnings.push({
          row: rowNumber,
          projectNumber: row.number?.trim(),
          message: warningMsg,
        });
      }
    }

    const validCount = validRows.length;
    const invalidCount = invalidRowNumbers.length;
    console.log(`   ✓ ${validCount} valid rows`);
    if (invalidCount > 0) {
      console.log(`   ✗ ${invalidCount} invalid rows`);
    }
    if (warnings.length > 0) {
      console.log(`   ⚠️  ${warnings.length} warnings`);
    }

    // Group by project
    console.log(`📦 Grouping by project...`);
    const projectGroups = groupRowsByProject(validRows);
    const uniqueProjects = projectGroups.size;
    const totalComponents = validRows.length;

    console.log(`   → Found ${uniqueProjects} unique projects`);
    console.log(`   → Total components: ${totalComponents}`);

    // Convert to Project objects
    console.log(`🔨 Converting to Project objects...`);
    for (const [projectNumber, projectRows] of Array.from(
      projectGroups.entries()
    )) {
      // Check consistency
      const consistencyWarnings = checkProjectFieldConsistency(
        projectRows,
        projectNumber
      );
      for (const warningMsg of consistencyWarnings) {
        warnings.push({
          projectNumber,
          message: warningMsg,
        });
      }

      try {
        const project = convertRowsToProject(projectNumber, projectRows);
        projects.push(project);

        // Log project details
        const componentCategories = project.components
          .map((c) => c.category)
          .join(", ");
        console.log(
          `   ✓ Project ${projectNumber}: ${
            project.components.length
          } component${
            project.components.length !== 1 ? "s" : ""
          } (${componentCategories})`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        errors.push({
          projectNumber,
          message: `Failed to convert project: ${errorMessage}`,
        });
        console.error(
          `   ✗ Project ${projectNumber}: Failed to convert - ${errorMessage}`
        );
      }
    }

    // Print errors if any
    if (errors.length > 0) {
      console.log(`\n⚠️  Errors found:`);
      for (const error of errors) {
        const rowInfo = error.row ? `Row ${error.row}` : "";
        const projectInfo = error.projectNumber
          ? `Project ${error.projectNumber}`
          : "";
        const context = [rowInfo, projectInfo].filter(Boolean).join(", ");
        console.log(`   ✗ ${context}: ${error.message}`);
      }
    }

    // Print warnings if any
    if (warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`);
      for (const warning of warnings) {
        const rowInfo = warning.row ? `Row ${warning.row}` : "";
        const projectInfo = warning.projectNumber
          ? `Project ${warning.projectNumber}`
          : "";
        const context = [rowInfo, projectInfo].filter(Boolean).join(", ");
        console.log(`   ⚠️  ${context}: ${warning.message}`);
      }
    }

    // Summary
    const processingTime = Date.now() - startTime;
    console.log(`\n📊 Parse Summary:`);
    console.log(`   • Total rows: ${rawRows.length}`);
    console.log(`   • Valid rows: ${validCount}`);
    console.log(`   • Projects: ${uniqueProjects}`);
    console.log(`   • Components: ${totalComponents}`);
    console.log(`   • Errors: ${errors.length}`);
    console.log(`   • Warnings: ${warnings.length}`);
    console.log(`   ⏱️  Time: ${processingTime}ms`);

    const success = errors.length === 0;

    return {
      success,
      projects,
      errors,
      warnings,
      stats: {
        totalRows: rawRows.length,
        validRows: validCount,
        invalidRows: invalidCount,
        totalProjects: uniqueProjects,
        totalComponents,
        processingTime,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Handle file not found
    if (errorMessage.includes("ENOENT") || errorMessage.includes("not found")) {
      errors.push({
        message: `CSV file not found: ${csvPath}`,
      });
    } else {
      errors.push({
        message: `Unexpected error: ${errorMessage}`,
      });
    }

    console.error(`\n❌ Fatal error: ${errorMessage}`);

    return {
      success: false,
      projects: [],
      errors,
      warnings,
      stats: {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        totalProjects: 0,
        totalComponents: 0,
        processingTime: Date.now() - startTime,
      },
    };
  }
}

// All types are exported above via export interface

// Test harness for quick verification
if (require.main === module) {
  const csvPath =
    "/Users/eliharel/Code/Projects/ace-remodeling-assets/projects.csv";

  parseProjectsCSV(csvPath)
    .then((result) => {
      if (result.success) {
        console.log(
          `\n✅ Successfully parsed ${result.projects.length} projects`
        );
        process.exit(0);
      } else {
        console.error(
          `\n❌ Parsing failed with ${result.errors.length} errors`
        );
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error(`\n❌ Unhandled error:`, error);
      process.exit(1);
    });
}
