/**
 * Firestore Operations Module
 *
 * Handles creating Project documents in Firestore with validation,
 * error handling, and dry-run support.
 *
 * @module scripts/lib/firebase/firestore
 */

import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "./client";
import { Project } from "../../../core/types/Project";

/**
 * Options for creating projects
 */
export interface CreateOptions {
  /** Preview mode - don't actually write */
  dryRun?: boolean;

  /** Clear all existing projects before creating */
  clearExisting?: boolean;
}

/**
 * Result of creating a single project
 */
export interface CreateResult {
  /** Whether creation succeeded */
  success: boolean;
  /** Firestore document ID (if successful) */
  firestoreId?: string;
  /** Project number */
  projectNumber: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Summary of creating multiple projects
 */
export interface CreateSummary {
  /** Whether all creations succeeded */
  success: boolean;
  /** Results for each project */
  results: CreateResult[];
  /** Number of successful creations */
  successCount: number;
  /** Number of failed creations */
  failureCount: number;
}

/**
 * Create a project document in Firestore
 *
 * @param project - Project document to create
 * @returns Promise<CreateResult>
 */
export async function createProject(
  project: Project
): Promise<CreateResult> {
  try {
    const projectsCollection = collection(db, "projects");
    const docRef = await addDoc(projectsCollection, project);

    return {
      success: true,
      firestoreId: docRef.id,
      projectNumber: project.number,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      success: false,
      projectNumber: project.number,
      error: errorMessage,
    };
  }
}

/**
 * Create multiple projects in Firestore
 *
 * Handles batch creation with progress logging, error collection,
 * and optional clearing of existing data.
 *
 * @param projects - Array of Project documents to create
 * @param options - Creation options
 * @returns Promise<CreateSummary>
 */
export async function createProjects(
  projects: Project[],
  options: CreateOptions = {}
): Promise<CreateSummary> {
  const { dryRun = false, clearExisting = false } = options;

  console.log(`\n📝 Creating ${projects.length} projects in Firestore...`);
  if (dryRun) {
    console.log("   [DRY RUN MODE - No actual writes]\n");
  }

  // Clear existing if requested
  if (clearExisting && !dryRun) {
    await clearAllProjects();
  }

  const results: CreateResult[] = [];

  for (const project of projects) {
    if (dryRun) {
      const totalMedia = project.components.reduce(
        (sum, c) => sum + c.media.length,
        0
      );
      const totalAssets = project.components.reduce(
        (sum, c) => sum + (c.documents?.length || 0),
        0
      );

      console.log(
        `   [DRY RUN] Would create: Project ${project.number} (${project.components.length} components, ${totalMedia} media, ${totalAssets} assets)`
      );
      results.push({
        success: true,
        firestoreId: "dry-run-id",
        projectNumber: project.number,
      });
    } else {
      const result = await createProject(project);
      results.push(result);

      if (result.success) {
        const totalMedia = project.components.reduce(
          (sum, c) => sum + c.media.length,
          0
        );
        const totalAssets = project.components.reduce(
          (sum, c) => sum + (c.documents?.length || 0),
          0
        );

        console.log(
          `   ✅ Created: Project ${project.number} - ${project.name}`
        );
        console.log(`      Components: ${project.components.length}`);
        console.log(`      Total media: ${totalMedia}`);
        console.log(`      Total assets: ${totalAssets}`);
      } else {
        console.log(
          `   ❌ Failed: Project ${project.number} - ${result.error}`
        );
      }
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  // Print summary
  console.log(`\n📊 Firestore Creation Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📦 Total: ${projects.length}`);

  return {
    success: failureCount === 0,
    results,
    successCount,
    failureCount,
  };
}

/**
 * Clear all projects from Firestore
 *
 * WARNING: This deletes all project documents. Use with caution.
 *
 * @returns Promise<number> Number of projects deleted
 */
export async function clearAllProjects(): Promise<number> {
  console.log("🗑️  Clearing existing projects...");

  try {
    const projectsCollection = collection(db, "projects");
    const snapshot = await getDocs(projectsCollection);

    if (snapshot.empty) {
      console.log("   No existing projects to delete");
      return 0;
    }

    const deletePromises = snapshot.docs.map((docSnapshot: QueryDocumentSnapshot<DocumentData>) =>
      deleteDoc(docSnapshot.ref)
    );
    await Promise.all(deletePromises);

    console.log(`   ✅ Deleted ${snapshot.size} existing projects\n`);
    return snapshot.size;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(`   ❌ Error clearing projects: ${errorMessage}`);
    throw error;
  }
}

/**
 * Get count of existing projects
 *
 * @returns Promise<number> Number of projects in Firestore
 */
export async function getProjectCount(): Promise<number> {
  try {
    const projectsCollection = collection(db, "projects");
    const snapshot = await getDocs(projectsCollection);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting project count:", error);
    return 0;
  }
}

// Test harness for quick verification
if (require.main === module) {
  (async () => {
    const count = await getProjectCount();
    console.log(`Current projects in Firestore: ${count}`);
  })();
}

