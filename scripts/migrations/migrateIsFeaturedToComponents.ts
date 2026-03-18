/**
 * Migrate isFeatured from Project to Components
 *
 * This script migrates the `isFeatured` field from project-level to component-level.
 * For projects with `isFeatured: true`, all their components will be updated to
 * have `isFeatured: true`.
 *
 * This is a one-time migration to support the new per-component featuring model.
 *
 * Usage:
 *   npx tsx scripts/migrations/migrateIsFeaturedToComponents.ts --env=dev --dry-run
 *   npx tsx scripts/migrations/migrateIsFeaturedToComponents.ts --env=prod
 *
 * Safety Features:
 * - Defaults to 'dev' environment if not specified
 * - Requires explicit confirmation before making changes
 * - Supports --dry-run flag for safe testing
 * - Logs environment clearly and prominently
 *
 * @module scripts/migrations/migrateIsFeaturedToComponents
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

type Environment = "dev" | "prod";

interface ScriptOptions {
  environment: Environment;
  dryRun: boolean;
}

interface MigrationResult {
  totalProjects: number;
  featuredProjects: number;
  componentsUpdated: number;
  alreadyFeaturedComponents: number;
  errorCount: number;
  errors: string[];
  duration: number;
}

function parseArguments(args: string[]): ScriptOptions {
  const options: ScriptOptions = {
    environment: "dev",
    dryRun: false,
  };

  for (const arg of args) {
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

    if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

function initializeFirebase(environment: Environment) {
  const config =
    environment === "prod" ? PROD_FIREBASE_CONFIG : DEV_FIREBASE_CONFIG;

  const app = initializeApp(config);
  return getFirestore(app);
}

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

async function migrateProjects(
  db: ReturnType<typeof getFirestore>,
  dryRun: boolean
): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    totalProjects: 0,
    featuredProjects: 0,
    componentsUpdated: 0,
    alreadyFeaturedComponents: 0,
    errorCount: 0,
    errors: [],
    duration: 0,
  };

  try {
    console.log("\n📋 Fetching all projects from Firestore...");

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
      const projectNumber = data.number || "unknown";
      const projectName = data.name || "Unknown Project";

      try {
        // Check if project has isFeatured: true
        if (data.isFeatured !== true) {
          continue;
        }

        result.featuredProjects++;
        console.log(
          `\n📍 Project ${projectNumber}: "${projectName}" (isFeatured: true)`
        );

        // Get components and update each one
        const components = data.components || [];
        let updatedComponents = 0;
        let alreadyFeatured = 0;

        for (let i = 0; i < components.length; i++) {
          const component = components[i];
          const componentId = component.id || `index-${i}`;
          const componentCategory = component.category || "unknown";

          if (component.isFeatured === true) {
            alreadyFeatured++;
            console.log(
              `   ✓  Component "${componentCategory}" (${componentId}) - already featured`
            );
            continue;
          }

          // Mark component as featured
          components[i] = {
            ...component,
            isFeatured: true,
          };
          updatedComponents++;
          console.log(
            `   ✅ ${dryRun ? "[DRY RUN] Would mark" : "Marking"} component "${componentCategory}" (${componentId}) as featured`
          );
        }

        result.componentsUpdated += updatedComponents;
        result.alreadyFeaturedComponents += alreadyFeatured;

        // Update the project document with modified components
        if (!dryRun && updatedComponents > 0) {
          const projectRef = doc(db, "projects", projectId);
          await updateDoc(projectRef, {
            components: components,
          });
          console.log(
            `   💾 Saved ${updatedComponents} component update(s) to Firestore`
          );
        }
      } catch (error) {
        result.errorCount++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        const errorDetail = `Project ${projectNumber} ("${projectName}"): ${errorMessage}`;
        result.errors.push(errorDetail);
        console.error(`   ❌ Error: ${errorDetail}`);
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

async function main(): Promise<MigrationResult> {
  const args = process.argv.slice(2);
  const options = parseArguments(args);

  console.log("\n" + "=".repeat(60));
  console.log("🔄 Migrate isFeatured from Project to Components");
  console.log("=".repeat(60));
  console.log(
    `\n📍 Running against ${options.environment.toUpperCase()} database`
  );
  console.log(
    `🗄️  Target Database: ${
      options.environment === "prod" ? "ace-remodeling" : "ace-remodeling-dev"
    }`
  );

  if (options.dryRun) {
    console.log("\n🔍 DRY RUN MODE - No changes will be made");
  }

  if (options.environment === "prod") {
    console.log("\n⚠️  WARNING: You are targeting PRODUCTION database!");
  }

  console.log(`\n⏰ Started at: ${new Date().toLocaleString()}`);

  console.log("\n📝 Migration Plan:");
  console.log("   1. Find all projects with isFeatured: true");
  console.log("   2. For each such project, mark ALL its components as featured");
  console.log("   3. Project-level isFeatured will be deprecated (not removed)\n");

  const confirmationMessage = `Proceed with migration on ${options.environment.toUpperCase()}${
    options.dryRun ? " (dry run)" : ""
  }? (y/n): `;

  const confirmed = await askConfirmation(confirmationMessage);

  if (!confirmed) {
    console.log("\n❌ Operation cancelled by user\n");
    process.exit(0);
  }

  let db: ReturnType<typeof getFirestore>;
  try {
    db = initializeFirebase(options.environment);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`\n❌ Failed to initialize Firebase: ${errorMessage}\n`);
    process.exit(1);
  }

  try {
    const result = await migrateProjects(db, options.dryRun);

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary");
    console.log("=".repeat(60));
    console.log(`📋 Total projects scanned: ${result.totalProjects}`);
    console.log(`⭐ Projects with isFeatured=true: ${result.featuredProjects}`);
    console.log(
      `✅ Components ${options.dryRun ? "would be " : ""}updated: ${result.componentsUpdated}`
    );
    console.log(
      `✓  Components already featured: ${result.alreadyFeaturedComponents}`
    );
    console.log(`❌ Errors: ${result.errorCount}`);
    console.log(`⏱️  Duration: ${result.duration}ms`);

    if (result.errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (result.errorCount === 0) {
      console.log(
        `\n🎉 ${options.dryRun ? "Dry run completed" : "Migration completed"} successfully!`
      );
      if (!options.dryRun && result.componentsUpdated > 0) {
        console.log(
          "\n💡 Next steps:"
        );
        console.log(
          "   - The app now uses component.isFeatured for featuring"
        );
        console.log(
          "   - project.isFeatured is deprecated but still present in data"
        );
        console.log(
          "   - You can optionally clean up project.isFeatured later\n"
        );
      }
    } else {
      console.log(
        `\n⚠️  Migration completed with ${result.errorCount} error(s).\n`
      );
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("\n❌ Fatal error during migration:");
    console.error(`   ${errorMessage}\n`);
    process.exit(1);
  }
}

main()
  .then((result) => {
    process.exit(result.errorCount > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
