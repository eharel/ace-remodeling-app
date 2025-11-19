/**
 * Main Upload Script
 *
 * Orchestrates the complete project upload process:
 * 1. Parse CSV
 * 2. Scan filesystem
 * 3. Upload to Firebase Storage
 * 4. Create Firestore documents
 *
 * Usage:
 *   npm run upload
 *   npm run upload -- --dry-run
 *   npm run upload -- --projects 187,148
 *   npm run upload -- --clear --skip-existing
 *
 * @module scripts/uploadProjects
 */

import { parseProjectsCSV } from "./lib/csv/parser";
import { scanProjectFiles } from "./lib/filesystem/scanner";
import { uploadAllFiles, UploadOptions } from "./lib/firebase/storage";
import { buildProjectDocument } from "./lib/firebase/dataBuilder";
import { createProjects, CreateOptions } from "./lib/firebase/firestore";
import { Project } from "../core/types/Project";

// Constants
const ASSETS_ROOT = "/Users/eliharel/Code/Projects/ace-remodeling-assets";
const CSV_PATH = `${ASSETS_ROOT}/projects.csv`;

/**
 * CLI options
 */
interface CliOptions {
  dryRun: boolean;
  projects?: string[];
  clear: boolean;
  skipExisting: boolean;
  verbose: boolean;
}

/**
 * Parse command-line arguments
 *
 * @returns Parsed CLI options
 */
function parseCliArgs(): CliOptions {
  const args = process.argv.slice(2);

  const projectsIndex = args.indexOf("--projects");
  const projects =
    projectsIndex !== -1 && args[projectsIndex + 1]
      ? args[projectsIndex + 1].split(",").map((p) => p.trim())
      : undefined;

  return {
    dryRun: args.includes("--dry-run"),
    projects,
    clear: args.includes("--clear"),
    skipExisting: args.includes("--skip-existing"),
    verbose: args.includes("--verbose"),
  };
}

/**
 * Main function
 */
async function main() {
  const startTime = Date.now();
  const options = parseCliArgs();

  console.log("\n╔════════════════════════════════════════╗");
  console.log("║   ACE Remodeling - Project Upload     ║");
  console.log("╚════════════════════════════════════════╝\n");

  // Show options
  console.log("⚙️  Options:");
  console.log(`   Mode: ${options.dryRun ? "DRY RUN (no writes)" : "LIVE"}`);
  if (options.projects) {
    console.log(`   Projects: ${options.projects.join(", ")}`);
  }
  console.log(`   Clear existing: ${options.clear ? "Yes" : "No"}`);
  console.log(
    `   Skip existing files: ${options.skipExisting ? "Yes" : "No"}`
  );
  console.log(`   Verbose: ${options.verbose ? "Yes" : "No"}\n`);

  try {
    // ===== STEP 1: Parse CSV =====
    console.log("╔════════════════════════════════════════╗");
    console.log("║ STEP 1: Parse CSV                     ║");
    console.log("╚════════════════════════════════════════╝\n");

    const parseResult = await parseProjectsCSV(CSV_PATH);

    if (!parseResult.success) {
      console.error("\n❌ CSV parsing failed. Cannot continue.");
      parseResult.errors.forEach((err) => console.error(`   ${err.message}`));
      process.exit(1);
    }

    console.log(`\n✅ CSV parsed successfully`);
    console.log(`   Projects: ${parseResult.projects.length}`);
    console.log(`   Components: ${parseResult.stats.totalComponents}`);

    // Filter projects if specified
    let projectsToUpload = parseResult.projects;
    if (options.projects) {
      const requestedNumbers = new Set(
        options.projects.map((p) => p.trim())
      );
      projectsToUpload = projectsToUpload.filter((p) =>
        requestedNumbers.has(p.number)
      );

      if (projectsToUpload.length === 0) {
        console.error(
          `\n❌ No projects found matching: ${options.projects.join(", ")}`
        );
        process.exit(1);
      }

      console.log(
        `   Filtered to: ${projectsToUpload.length} project${projectsToUpload.length !== 1 ? "s" : ""}`
      );
    }

    const projectNumbers = projectsToUpload.map((p) => p.number);

    // ===== STEP 2: Scan Filesystem =====
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║ STEP 2: Scan Filesystem               ║");
    console.log("╚════════════════════════════════════════╝\n");

    const scanResult = await scanProjectFiles(ASSETS_ROOT, projectNumbers);

    if (!scanResult.success) {
      console.error("\n❌ Filesystem scan failed.");
      scanResult.errors.forEach((err) => console.error(`   ${err.message}`));

      // Ask if user wants to continue with partial data
      if (!options.dryRun) {
        console.log(
          "\n⚠️  Some files may be missing. Continue anyway? (Ctrl+C to abort)"
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    console.log(`\n✅ Filesystem scan complete`);
    console.log(`   Components: ${scanResult.stats.totalComponents}`);
    console.log(`   Media files: ${scanResult.stats.totalMedia}`);
    console.log(`   Assets: ${scanResult.stats.totalAssets}`);
    console.log(`   Total size: ${formatBytes(scanResult.stats.totalSize)}`);

    if (scanResult.warnings.length > 0 && options.verbose) {
      console.log(`\n⚠️  Scan warnings: ${scanResult.warnings.length}`);
      scanResult.warnings.slice(0, 5).forEach((w) => {
        console.log(`   ${w.message}`);
      });
      if (scanResult.warnings.length > 5) {
        console.log(`   ... and ${scanResult.warnings.length - 5} more`);
      }
    }

    // ===== STEP 3: Upload to Storage =====
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║ STEP 3: Upload to Firebase Storage    ║");
    console.log("╚════════════════════════════════════════╝\n");

    const uploadOptions: UploadOptions = {
      dryRun: options.dryRun,
      skipExisting: options.skipExisting,
      concurrency: 5,
    };

    const uploadResult = await uploadAllFiles(
      scanResult.components,
      uploadOptions
    );

    if (!uploadResult.success) {
      console.error("\n⚠️  Some uploads failed.");
      if (options.verbose) {
        uploadResult.errors.slice(0, 10).forEach((err) => {
          console.error(`   ❌ ${err.localPath}`);
          console.error(`      ${err.error}`);
        });
        if (uploadResult.errors.length > 10) {
          console.error(
            `   ... and ${uploadResult.errors.length - 10} more errors`
          );
        }
      }
    }

    console.log(
      `\n✅ Upload ${options.dryRun ? "preview" : "complete"}`
    );
    console.log(`   Success: ${uploadResult.successCount}`);
    console.log(`   Failed: ${uploadResult.failureCount}`);
    console.log(`   Skipped: ${uploadResult.skippedCount}`);
    console.log(`   Total: ${uploadResult.totalFiles}`);

    if (uploadResult.failureCount > 0 && !options.dryRun) {
      console.log(
        "\n⚠️  Continue with Firestore creation despite upload failures? (Ctrl+C to abort)"
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    // ===== STEP 4: Build & Create Firestore Docs =====
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║ STEP 4: Create Firestore Documents    ║");
    console.log("╚════════════════════════════════════════╝\n");

    // Build projects
    console.log("🔨 Building project documents...\n");

    const builtProjects: Project[] = [];
    const buildErrors: string[] = [];

    for (const csvProject of projectsToUpload) {
      const projectComponents = scanResult.components.filter(
        (c) => c.projectNumber === csvProject.number
      );

      const projectUploads = uploadResult.components.filter(
        (c) => c.projectNumber === csvProject.number
      );

      const buildResult = buildProjectDocument({
        csvData: csvProject,
        componentFiles: projectComponents,
        uploadResults: projectUploads,
      });

      if (buildResult.success && buildResult.project) {
        builtProjects.push(buildResult.project);
        if (options.verbose) {
          console.log(`   ✅ Built: Project ${csvProject.number}`);
        }
      } else {
        const errorMsg = `Project ${csvProject.number}: ${buildResult.errors.join(", ")}`;
        buildErrors.push(errorMsg);
        console.log(`   ❌ Failed: Project ${csvProject.number}`);
        if (options.verbose) {
          buildResult.errors.forEach((err) => {
            console.log(`      ${err}`);
          });
        }
      }
    }

    if (buildErrors.length > 0) {
      console.log(`\n⚠️  Build errors: ${buildErrors.length}`);
      if (options.verbose) {
        buildErrors.forEach((err) => console.log(`   ${err}`));
      }
    }

    if (builtProjects.length === 0) {
      console.error("\n❌ No projects built successfully. Cannot continue.");
      process.exit(1);
    }

    // Create in Firestore
    console.log(`\n📝 Writing to Firestore...\n`);

    const createOptions: CreateOptions = {
      dryRun: options.dryRun,
      clearExisting: options.clear,
    };

    const createResult = await createProjects(builtProjects, createOptions);

    console.log(
      `\n✅ Firestore creation ${options.dryRun ? "preview" : "complete"}`
    );
    console.log(`   Success: ${createResult.successCount}`);
    console.log(`   Failed: ${createResult.failureCount}`);

    // ===== FINAL SUMMARY =====
    const duration = Date.now() - startTime;

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║ FINAL SUMMARY                          ║");
    console.log("╚════════════════════════════════════════╝\n");

    console.log("📊 Upload Pipeline Results:\n");

    console.log(`   1️⃣  CSV Parsing:`);
    console.log(`       ✅ Projects parsed: ${parseResult.projects.length}`);
    console.log(`       ⚠️  Warnings: ${parseResult.warnings.length}`);

    console.log(`\n   2️⃣  Filesystem Scan:`);
    console.log(`       ✅ Components found: ${scanResult.stats.totalComponents}`);
    console.log(`       📷 Media files: ${scanResult.stats.totalMedia}`);
    console.log(`       📄 Assets: ${scanResult.stats.totalAssets}`);
    console.log(`       ⚠️  Warnings: ${scanResult.warnings.length}`);

    console.log(`\n   3️⃣  Storage Upload:`);
    console.log(`       ✅ Uploaded: ${uploadResult.successCount}`);
    console.log(`       ❌ Failed: ${uploadResult.failureCount}`);
    console.log(`       ⏭️  Skipped: ${uploadResult.skippedCount}`);
    console.log(`       💾 Size: ${formatBytes(uploadResult.totalBytes)}`);

    console.log(`\n   4️⃣  Firestore Creation:`);
    console.log(`       ✅ Created: ${createResult.successCount}`);
    console.log(`       ❌ Failed: ${createResult.failureCount}`);

    console.log(`\n   ⏱️  Total time: ${formatDuration(duration)}`);

    const overallSuccess =
      createResult.success &&
      uploadResult.failureCount === 0 &&
      buildErrors.length === 0;

    console.log(
      `   🎯 Status: ${overallSuccess ? "✅ SUCCESS" : "⚠️  PARTIAL SUCCESS"}`
    );

    if (options.dryRun) {
      console.log(
        "\n   ℹ️  This was a DRY RUN - no data was actually written"
      );
    }

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║ Upload Complete!                       ║");
    console.log("╚════════════════════════════════════════╝\n");

    // Exit with appropriate code
    const hasErrors = !overallSuccess;
    process.exit(hasErrors ? 1 : 0);
  } catch (error) {
    console.error("\n❌ Fatal error:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack && options.verbose) {
        console.error(`\n${error.stack}`);
      }
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * Format bytes to human-readable size
 *
 * @param bytes - Size in bytes
 * @returns Formatted string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format duration to human-readable time
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted string
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ${seconds % 60}s`;
  }

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

// Run it!
main();

