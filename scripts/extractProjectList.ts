/**
 * Extract Project List Script
 *
 * Scans the assets folder and extracts project information (number, name, category)
 * in a format that's easy to copy-paste into Google Sheets.
 *
 * Output is tab-separated values (TSV) which can be directly pasted into
 * Google Sheets to populate three columns.
 *
 * Usage:
 *   npm run extract-projects
 *   or
 *   ts-node scripts/extractProjectList.ts
 *
 * @module scripts/extractProjectList
 */

import * as fs from "fs";
import * as path from "path";
import { BASE_ASSETS_PATH, VALID_CATEGORIES } from "./config/uploadConfig";

/**
 * Parsed project information
 */
interface ProjectInfo {
  projectNumber: string;
  projectName: string;
  category: string;
  subcategory?: string;
}

/**
 * Parse project folder name to extract project information
 *
 * Handles patterns like:
 * - "104 - Luxe Revival - Kitchen"
 * - "117 - Quiet Elegance - Kitchen"
 *
 * @param folderName - The folder name to parse
 * @param category - The category this project belongs to
 * @returns Structured project information or null if invalid
 */
function parseProjectFolder(
  folderName: string,
  category: string
): ProjectInfo | null {
  try {
    // Split on " - " delimiter
    const parts = folderName.split(" - ").map((p) => p.trim());

    if (parts.length < 2) {
      console.warn(`⚠️  Invalid folder name format: "${folderName}"`);
      return null;
    }

    const projectNumber = parts[0];
    const projectName = parts[1];

    return {
      projectNumber,
      projectName,
      category,
    };
  } catch (error) {
    console.error(`❌ Error parsing folder name "${folderName}":`, error);
    return null;
  }
}

/**
 * Scan all projects in the assets folder
 *
 * @returns Array of project information
 */
function scanAllProjects(): ProjectInfo[] {
  const projects: ProjectInfo[] = [];

  console.log(`📁 Scanning assets folder: ${BASE_ASSETS_PATH}\n`);

  // Skip 'pools' category if not yet in use
  const activeCategories = VALID_CATEGORIES.filter((cat) => cat !== "pools");

  for (const category of activeCategories) {
    const categoryPath = path.join(BASE_ASSETS_PATH, category);

    // Check if category folder exists
    if (!fs.existsSync(categoryPath)) {
      console.log(`⏭️  Skipping ${category} (folder not found)`);
      continue;
    }

    console.log(`📂 Scanning ${category}...`);

    // Special handling for adu-addition which has subcategories
    if (category === "adu-addition") {
      // Two-level nesting: adu-addition/subcategory/project
      const subcategoryDirs = fs
        .readdirSync(categoryPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .filter((dirent) => !dirent.name.startsWith("."));

      for (const subcatDir of subcategoryDirs) {
        const subcatPath = path.join(categoryPath, subcatDir.name);
        const subcategoryName = subcatDir.name.toLowerCase();

        console.log(`   📂 ${subcategoryName}/`);

        // Get project folders within subcategory
        const projectDirs = fs
          .readdirSync(subcatPath, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .filter((dirent) => !dirent.name.startsWith("."));

        for (const projDir of projectDirs) {
          const projectInfo = parseProjectFolder(projDir.name, category);

          if (projectInfo) {
            projectInfo.subcategory = subcategoryName;
            projects.push(projectInfo);
            console.log(
              `      ✓ ${projectInfo.projectNumber} - ${projectInfo.projectName}`
            );
          }
        }
      }
    } else {
      // Single-level: category/project
      const projectDirs = fs
        .readdirSync(categoryPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .filter((dirent) => !dirent.name.startsWith("."));

      for (const projDir of projectDirs) {
        const projectInfo = parseProjectFolder(projDir.name, category);

        if (projectInfo) {
          projects.push(projectInfo);
          console.log(
            `   ✓ ${projectInfo.projectNumber} - ${projectInfo.projectName}`
          );
        }
      }
    }

    console.log(""); // Empty line between categories
  }

  return projects;
}

/**
 * Format projects as three separate columns for easy copy-pasting
 * Each column can be copied and pasted into Google Sheets separately
 *
 * @param projects - Array of project information
 * @returns Formatted string with three separate sections
 */
function formatAsColumns(projects: ProjectInfo[]): string {
  // Sort projects by project number (numerically)
  const sortedProjects = [...projects].sort((a, b) => {
    const aNum = parseInt(a.projectNumber);
    const bNum = parseInt(b.projectNumber);
    return aNum - bNum;
  });

  let output = "";

  // Column 1: Project Numbers
  output += "========== COLUMN 1: PROJECT NUMBERS ==========\n";
  output += "Project Number\n"; // Header
  for (const project of sortedProjects) {
    output += `${project.projectNumber}\n`;
  }
  output += "\n";

  // Column 2: Project Names
  output += "========== COLUMN 2: PROJECT NAMES ==========\n";
  output += "Project Name\n"; // Header
  for (const project of sortedProjects) {
    output += `${project.projectName}\n`;
  }
  output += "\n";

  // Column 3: Categories
  output += "========== COLUMN 3: CATEGORIES ==========\n";
  output += "Category\n"; // Header
  for (const project of sortedProjects) {
    // Include subcategory in category if present (for adu-addition)
    const categoryDisplay = project.subcategory
      ? `${project.category} (${project.subcategory})`
      : project.category;
    output += `${categoryDisplay}\n`;
  }

  return output;
}

/**
 * Main function
 */
function main(): void {
  console.log("\n📋 Extract Project List for Google Sheets");
  console.log("==========================================\n");

  try {
    // Check if assets folder exists
    if (!fs.existsSync(BASE_ASSETS_PATH)) {
      console.error(`❌ Assets folder not found: ${BASE_ASSETS_PATH}`);
      console.error(
        `   Update BASE_ASSETS_PATH in scripts/config/uploadConfig.ts`
      );
      process.exit(1);
    }

    // Scan all projects
    const projects = scanAllProjects();

    if (projects.length === 0) {
      console.log("❌ No projects found\n");
      process.exit(0);
    }

    // Format as columns
    const columnOutput = formatAsColumns(projects);

    // Print summary
    console.log("==========================================");
    console.log("📊 Summary");
    console.log("==========================================");
    console.log(`✅ Total projects found: ${projects.length}`);

    // Show breakdown by category
    const categoryCounts = new Map<string, number>();
    for (const project of projects) {
      const categoryKey = project.subcategory
        ? `${project.category} (${project.subcategory})`
        : project.category;
      categoryCounts.set(categoryKey, (categoryCounts.get(categoryKey) || 0) + 1);
    }

    console.log("\n📂 By Category:");
    for (const [category, count] of categoryCounts) {
      console.log(`   ${category}: ${count}`);
    }

    // Print the column output
    console.log("\n\n==========================================");
    console.log("📋 COPY & PASTE INTO GOOGLE SHEETS:");
    console.log("==========================================\n");
    console.log(columnOutput);
    console.log("==========================================");
    console.log("💡 INSTRUCTIONS:");
    console.log("   1. Copy Column 1 (including header) and paste into column A");
    console.log("   2. Copy Column 2 (including header) and paste into column B");
    console.log("   3. Copy Column 3 (including header) and paste into column C");
    console.log("   (Don't include the '=====' separator lines)\n");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("\n❌ Fatal error:", errorMessage);
    process.exit(1);
  }
}

// Execute the script
main();


