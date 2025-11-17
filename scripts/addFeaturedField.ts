/**
 * Add Featured Field to Firestore Projects Script
 *
 * This script adds the `featured` field (default: false) to all existing
 * projects in Firestore that don't already have this field.
 *
 * Usage:
 *   npm run add-featured:dev        # Update dev database
 *   npm run add-featured:prod       # Update prod database
 *   tsx scripts/addFeaturedField.ts --env=dev --dry-run  # Dry run
 *
 * Safety Features:
 * - Defaults to 'dev' environment if not specified
 * - Requires explicit confirmation before making changes
 * - Supports --dry-run flag for safe testing
 * - Logs environment clearly and prominently
 *
 * @module scripts/addFeaturedField
 */

import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import * as readline from "readline";

/**
 * Firebase configuration constants
 */
const PROD_FIREBASE_CONFIG = {
  apiKey: "AIzaSyChT79bqGCihMp5fOlbidZR89CgAeaFuaU",
  authDomain: "ace-remodeling.firebaseapp.com",
  projectId: "ace-remodeling",
  storageBucket: "ace-remodeling.firebasestorage.app",
  messagingSenderId: "134005454171",
  appId: "1:134005454171:web:9fa6967272f73d6cc7967e",
  measurementId: "G-9W8N02F06S",
};

const DEV_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDAZ4stoeMEW_mzxM2rZcWfh1-KF0uFgeI",
  authDomain: "ace-remodeling-dev.firebaseapp.com",
  projectId: "ace-remodeling-dev",
  storageBucket: "ace-remodeling-dev.firebasestorage.app",
  messagingSenderId: "506379714845",
  appId: "1:506379714845:web:613b07ec0a9c75aac721f4",
  measurementId: "G-W208PZY3W5",
};

/**
 * Environment type
 */
type Environment = "dev" | "prod";

/**
 * Script options parsed from CLI arguments
 */
interface ScriptOptions {
  environment: Environment;
  dryRun: boolean;
}

/**
 * Result summary from update operation
 */
interface UpdateResult {
  totalProjects: number;
  updatedCount: number;
  alreadyHadField: number;
  errorCount: number;
  errors: string[];
  duration: number;
}

/**
 * Parse command-line arguments
 *
 * @param args - Command-line arguments array
 * @returns Parsed script options
 */
function parseArguments(args: string[]): ScriptOptions {
  const options: ScriptOptions = {
    environment: "dev", // Default to dev for safety
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Parse --env=dev or --env=prod
    if (arg.startsWith("--env=")) {
      const envValue = arg.split("=")[1]?.toLowerCase();
      if (envValue === "dev" || envValue === "prod") {
        options.environment = envValue;
      } else {
        console.error(
          `❌ Invalid environment: ${envValue}. Use --env=dev or --env=prod`
        );
        process.exit(1);
      }
    }

    // Parse --dry-run flag
    if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

/**
 * Initialize Firebase with the specified environment
 *
 * @param environment - Target environment (dev or prod)
 * @returns Initialized Firestore instance
 */
function initializeFirebase(environment: Environment) {
  const config =
    environment === "prod" ? PROD_FIREBASE_CONFIG : DEV_FIREBASE_CONFIG;

  const app = initializeApp(config);
  const db = getFirestore(app);

  return db;
}

/**
 * Prompt user for confirmation using readline
 *
 * @param question - Question to ask the user
 * @returns Promise resolving to true if user confirms, false otherwise
 */
function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === "y" || normalized === "yes");
    });
  });
}

/**
 * Update all projects in Firestore to add featured field if missing
 *
 * @param db - Firestore database instance
 * @param dryRun - If true, only log what would be updated without making changes
 * @returns Promise resolving to update result summary
 */
async function updateProjects(
  db: ReturnType<typeof getFirestore>,
  dryRun: boolean
): Promise<UpdateResult> {
  const startTime = Date.now();
  const result: UpdateResult = {
    totalProjects: 0,
    updatedCount: 0,
    alreadyHadField: 0,
    errorCount: 0,
    errors: [],
    duration: 0,
  };

  try {
    console.log("\n📋 Fetching all projects from Firestore...");

    // Fetch all projects
    const projectsCollection = collection(db, "projects");
    const snapshot = await getDocs(projectsCollection);

    result.totalProjects = snapshot.size;

    if (snapshot.empty) {
      console.log("   ℹ️  No projects found in database");
      result.duration = Date.now() - startTime;
      return result;
    }

    console.log(`   ✅ Found ${result.totalProjects} project(s)\n`);

    if (dryRun) {
      console.log("🔍 DRY RUN MODE - No changes will be made\n");
    }

    // Process each project
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const projectId = docSnapshot.id;
      const projectNumber = data.projectNumber || "unknown";
      const projectName = data.name || "Unknown Project";

      try {
        // Check if featured field already exists
        if (data.featured !== undefined) {
          result.alreadyHadField++;
          if (!dryRun) {
            console.log(
              `   ✓  Project ${projectNumber}: "${projectName}" (already has featured field)`
            );
          }
          continue;
        }

        // Update project to add featured: false
        if (!dryRun) {
          const projectRef = doc(db, "projects", projectId);
          await updateDoc(projectRef, {
            featured: false,
          });
        }

        result.updatedCount++;
        console.log(
          `   ✅ ${dryRun ? "[DRY RUN] Would update" : "Updated"} project ${projectNumber}: "${projectName}"`
        );
      } catch (error) {
        result.errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const errorDetail = `Project ${projectNumber} ("${projectName}"): ${errorMessage}`;
        result.errors.push(errorDetail);
        console.error(`   ❌ Error updating ${errorDetail}`);
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    result.errors.push(`Fatal error: ${errorMessage}`);
    result.duration = Date.now() - startTime;
    throw error;
  }
}

/**
 * Main function that orchestrates the update process
 *
 * @returns Promise resolving to update result
 */
async function main(): Promise<UpdateResult> {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  const options = parseArguments(args);

  // Display environment information prominently
  console.log("\n" + "=".repeat(50));
  console.log("🔧 Add Featured Field to Projects");
  console.log("=".repeat(50));
  console.log(`\n📍 Running against ${options.environment.toUpperCase()} database`);
  console.log(
    `🗄️  Target Database: ${
      options.environment === "prod"
        ? "ace-remodeling"
        : "ace-remodeling-dev"
    }`
  );

  if (options.dryRun) {
    console.log("\n🔍 DRY RUN MODE - No changes will be made");
  }

  if (options.environment === "prod") {
    console.log("\n⚠️  WARNING: You are targeting PRODUCTION database!");
  }

  console.log(`\n⏰ Started at: ${new Date().toLocaleString()}\n`);

  // Request confirmation before proceeding
  const confirmationMessage = `This will ${
    options.dryRun ? "check" : "update"
  } all projects in ${options.environment.toUpperCase()} Firestore${
    options.dryRun ? " (dry run)" : ""
  }. Continue? (y/n): `;

  const confirmed = await askConfirmation(confirmationMessage);

  if (!confirmed) {
    console.log("\n❌ Operation cancelled by user\n");
    process.exit(0);
  }

  // Initialize Firebase with the specified environment
  let db: ReturnType<typeof getFirestore>;
  try {
    db = initializeFirebase(options.environment);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`\n❌ Failed to initialize Firebase: ${errorMessage}\n`);
    process.exit(1);
  }

  // Update projects
  try {
    const result = await updateProjects(db, options.dryRun);

    // Print summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Update Summary");
    console.log("=".repeat(50));
    console.log(`📋 Total projects: ${result.totalProjects}`);
    console.log(
      `✅ ${options.dryRun ? "Would update" : "Updated"}: ${result.updatedCount}`
    );
    console.log(`✓  Already had featured field: ${result.alreadyHadField}`);
    console.log(`❌ Errors: ${result.errorCount}`);
    console.log(`⏱️  Duration: ${result.duration}ms`);

    if (result.errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (result.errorCount === 0 && result.updatedCount > 0) {
      console.log(
        `\n🎉 ${options.dryRun ? "Dry run completed" : "Update completed"} successfully!\n`
      );
    } else if (result.updatedCount === 0 && result.alreadyHadField > 0) {
      console.log(
        `\n✅ All projects already have the featured field. No updates needed.\n`
      );
    } else {
      console.log(
        `\n⚠️  Update completed with ${result.errorCount} error(s). Check logs above.\n`
      );
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("\n❌ Fatal error during update:");
    console.error(`   ${errorMessage}\n`);
    process.exit(1);
  }
}

// Execute the script
main()
  .then((result) => {
    // Exit with appropriate code
    process.exit(result.errorCount > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });

