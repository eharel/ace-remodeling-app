/**
 * Firebase Database Seeding Script
 *
 * This script seeds the Firestore database with sample project data.
 * It clears existing projects and adds fresh seed data from seedData.ts.
 *
 * Usage:
 *   npm run seed
 *
 * WARNING: This will DELETE all existing projects in the database.
 * Only use in development environments.
 *
 * @module scripts/seedFirebase
 */

import {
  addDoc,
  collection,
  deleteDoc,
  DocumentData,
  getDocs,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { seedProjects } from "../data/seedData";
import { Project } from "../types";

/**
 * Result summary from seeding operation
 */
interface SeedResult {
  success: boolean;
  projectsDeleted: number;
  projectsAdded: number;
  errors: string[];
  duration: number;
}

/**
 * Validates that a project object has all required fields
 *
 * @param project - The project object to validate
 * @returns True if valid, throws error if invalid
 * @throws Error with descriptive message if validation fails
 */
function validateProject(project: Omit<Project, "id">): boolean {
  const requiredFields = [
    "name",
    "category",
    "briefDescription",
    "longDescription",
    "thumbnail",
    "pictures",
    "documents",
    "logs",
    "status",
    "createdAt",
    "updatedAt",
  ];

  for (const field of requiredFields) {
    if (!(field in project)) {
      throw new Error(
        `Project "${
          project.name || "Unknown"
        }" is missing required field: ${field}`
      );
    }
  }

  // Validate field types
  if (typeof project.name !== "string" || project.name.trim() === "") {
    throw new Error("Project name must be a non-empty string");
  }

  if (!Array.isArray(project.pictures)) {
    throw new Error("Project pictures must be an array");
  }

  if (!Array.isArray(project.documents)) {
    throw new Error("Project documents must be an array");
  }

  if (!Array.isArray(project.logs)) {
    throw new Error("Project logs must be an array");
  }

  // Validate dates are ISO strings
  const dateFields = ["createdAt", "updatedAt"];
  for (const field of dateFields) {
    const value = project[field as keyof typeof project];
    if (typeof value === "string") {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`Project ${field} must be a valid ISO date string`);
      }
    }
  }

  return true;
}

/**
 * Clears all existing projects from the Firestore database
 *
 * @returns Promise resolving to number of projects deleted
 * @throws Error if deletion fails
 */
async function clearProjects(): Promise<number> {
  console.log("🗑️  Clearing existing projects...");

  try {
    const projectsCollection = collection(db, "projects");
    const snapshot = await getDocs(projectsCollection);

    if (snapshot.empty) {
      console.log("   No existing projects to delete");
      return 0;
    }

    const deletePromises: Promise<void>[] = [];

    snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);

    const count = snapshot.size;
    console.log(`✅ Deleted ${count} existing project(s)`);

    return count;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error clearing projects:", errorMessage);
    throw new Error(`Failed to clear projects: ${errorMessage}`);
  }
}

/**
 * Adds seed projects to the Firestore database
 *
 * @returns Promise resolving to object with success count and errors
 * @throws Error if seeding fails completely
 */
async function addSeedProjects(): Promise<{
  successCount: number;
  errors: string[];
}> {
  console.log(`\n📦 Adding ${seedProjects.length} seed projects...`);

  const errors: string[] = [];
  let successCount = 0;

  for (const project of seedProjects) {
    try {
      // Validate project data before inserting
      validateProject(project);

      // Add to Firestore
      const projectsCollection = collection(db, "projects");
      const docRef = await addDoc(projectsCollection, project);

      successCount++;
      console.log(
        `   ✓ Added: "${project.name}" (${project.category}) - ID: ${docRef.id}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorDetail = `Failed to add "${project.name}": ${errorMessage}`;

      errors.push(errorDetail);
      console.error(`   ✗ ${errorDetail}`);
    }
  }

  return { successCount, errors };
}

/**
 * Main function that orchestrates the database seeding process
 *
 * Performs the following steps:
 * 1. Clears all existing projects
 * 2. Validates seed data
 * 3. Adds new seed projects
 * 4. Reports results
 *
 * @returns Promise resolving to SeedResult object
 */
async function main(): Promise<SeedResult> {
  const startTime = Date.now();

  console.log("\n🌱 Starting Firebase Database Seeding");
  console.log("=====================================\n");
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log(`📊 Projects to seed: ${seedProjects.length}\n`);

  const result: SeedResult = {
    success: false,
    projectsDeleted: 0,
    projectsAdded: 0,
    errors: [],
    duration: 0,
  };

  try {
    // Step 1: Clear existing projects
    result.projectsDeleted = await clearProjects();

    // Step 2: Add seed projects
    const { successCount, errors } = await addSeedProjects();
    result.projectsAdded = successCount;
    result.errors = errors;

    // Determine overall success
    result.success = errors.length === 0;
    result.duration = Date.now() - startTime;

    // Print summary
    console.log("\n=====================================");
    console.log("📊 Seeding Summary");
    console.log("=====================================");
    console.log(`✅ Projects deleted: ${result.projectsDeleted}`);
    console.log(`✅ Projects added: ${result.projectsAdded}`);
    console.log(`❌ Errors: ${result.errors.length}`);
    console.log(`⏱️  Duration: ${result.duration}ms`);

    if (result.errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (result.success) {
      console.log("\n🎉 Database seeding completed successfully!\n");
    } else {
      console.log(
        "\n⚠️  Database seeding completed with errors. Check logs above.\n"
      );
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    result.success = false;
    result.errors.push(errorMessage);
    result.duration = Date.now() - startTime;

    console.error("\n❌ Fatal error during seeding:");
    console.error(`   ${errorMessage}\n`);

    return result;
  }
}

// Execute the seeding script
main()
  .then((result) => {
    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  });
