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
import * as fs from "fs";
import * as path from "path";
import { db } from "../config/firebase";
import { seedProjects } from "../data/seedData";
import { Document, Picture, Project } from "../types";

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
 * Uploaded project data structure from Firebase Storage
 */
interface UploadedProject {
  id: string;
  slug: string;
  name: string;
  category: string;
  photos: {
    url: string;
    category: string;
    filename: string;
    storagePath: string;
    size: number;
    order: number;
  }[];
  documents: {
    url: string;
    category: string;
    filename: string;
    storagePath: string;
    size: number;
    type: string;
  }[];
}

/**
 * Load uploaded projects from JSON file if available
 */
function loadUploadedProjects(): UploadedProject[] | null {
  try {
    const uploadedDataPath = path.join(
      __dirname,
      "output",
      "kitchen-projects.json"
    );

    if (!fs.existsSync(uploadedDataPath)) {
      console.log("ℹ️  No uploaded projects file found, using seed data only");
      return null;
    }

    const jsonData = fs.readFileSync(uploadedDataPath, "utf-8");
    const data = JSON.parse(jsonData);

    console.log(
      `✅ Loaded ${data.projects.length} uploaded projects from Firebase Storage`
    );
    return data.projects;
  } catch (error) {
    console.warn("⚠️  Error loading uploaded projects:", error);
    return null;
  }
}

/**
 * Convert uploaded project data to seed format
 *
 * @param uploadedProject - Project data from Firebase Storage upload
 * @returns Project object ready for Firestore
 */
function convertUploadedProject(
  uploadedProject: UploadedProject
): Omit<Project, "id"> {
  // Map photos from uploaded format to Picture format
  const pictures: Picture[] = uploadedProject.photos.map((photo) => ({
    id: `${uploadedProject.slug}-photo-${photo.order}`,
    url: photo.url,
    type: mapCategoryToType(photo.category),
    category: photo.category,
    order: photo.order,
    filename: photo.filename,
    storagePath: photo.storagePath,
    size: photo.size,
    altText: `${uploadedProject.name} - ${photo.category} photo`,
    createdAt: new Date().toISOString(),
  }));

  // Map documents from uploaded format to Document format
  const documents: Document[] = (uploadedProject.documents || []).map(
    (doc) => ({
      id: `${uploadedProject.slug}-doc-${doc.filename}`,
      name: doc.filename,
      url: doc.url,
      type: doc.type, // Use the type from uploaded JSON (e.g., "3D Rendering", "Floor Plan")
      category: doc.category,
      fileType: "PDF",
      fileSize: doc.size,
      description: `${doc.type} for ${uploadedProject.name}`,
      uploadedAt: new Date().toISOString(),
      storagePath: doc.storagePath,
    })
  );

  return {
    projectNumber: uploadedProject.id,
    name: uploadedProject.name, // Will be updated with descriptive names from boss
    category: uploadedProject.category as "kitchen" | "bathroom" | "outdoor",
    briefDescription: `Professional ${uploadedProject.category} remodeling project`,
    longDescription: `This ${uploadedProject.category} remodeling project showcases our expertise in transforming spaces with quality craftsmanship and attention to detail.`,
    thumbnail:
      pictures.find((p) => p.type === "after")?.url || pictures[0]?.url || "",

    // Location: zip code + neighborhood (not full address)
    location: {
      zipCode: "78701", // Default Austin zip - will update with real data
      neighborhood: "Austin, TX",
    },

    // Duration: typical project timeline
    duration: {
      value: 8,
      unit: "weeks" as const,
    },

    // Scope: description with design aspects (placeholder for now)
    scope: `Professional ${uploadedProject.category} remodeling featuring modern design elements, quality craftsmanship, and attention to detail. This project showcases innovative solutions and timeless aesthetics.`,

    // Testimonial: will be added when boss provides them
    // testimonial: undefined,

    pms: [{ name: "Mike Johnson" }],
    pictures,
    documents,
    logs: [],

    // Internal metadata
    projectDates: {
      startDate: new Date().toISOString(),
      completionDate: new Date().toISOString(),
    },
    status: "completed" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [uploadedProject.category, "remodel", "completed"],
    featured: uploadedProject.id === "117", // Make one project featured
  };
}

/**
 * Map upload category to Picture type
 */
function mapCategoryToType(category: string): Picture["type"] {
  const mapping: Record<string, Picture["type"]> = {
    before: "before",
    after: "after",
    progress: "progress",
    rendering: "rendering",
    materials: "detail",
    other: "other",
  };
  return mapping[category] || "other";
}

// Load uploaded projects at module level
const uploadedProjects = loadUploadedProjects();

/**
 * Validates that a project object has all required fields
 *
 * @param project - The project object to validate
 * @returns True if valid, throws error if invalid
 * @throws Error with descriptive message if validation fails
 */
function validateProject(project: Omit<Project, "id">): boolean {
  const requiredFields = [
    "projectNumber",
    "name",
    "category",
    "briefDescription",
    "longDescription",
    "thumbnail",
    "location",
    "duration",
    "scope",
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
  if (
    typeof project.projectNumber !== "string" ||
    project.projectNumber.trim() === ""
  ) {
    throw new Error("Project number must be a non-empty string");
  }

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

  // Validate location structure
  if (
    typeof project.location !== "object" ||
    !project.location.zipCode ||
    !project.location.neighborhood
  ) {
    throw new Error("Project must have location with zipCode and neighborhood");
  }

  // Validate duration structure
  if (
    typeof project.duration !== "object" ||
    typeof project.duration.value !== "number" ||
    !project.duration.unit
  ) {
    throw new Error("Project must have duration with value and unit");
  }

  // Validate scope
  if (typeof project.scope !== "string" || project.scope.trim() === "") {
    throw new Error("Project scope must be a non-empty string");
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
  // Prepare projects: use uploaded projects if available, otherwise use seed data
  let projectsToSeed: Omit<Project, "id">[] = [];

  if (uploadedProjects && uploadedProjects.length > 0) {
    // Convert uploaded projects to seed format
    projectsToSeed = uploadedProjects.map(convertUploadedProject);
    console.log(
      `\n📦 Adding ${projectsToSeed.length} projects from Firebase Storage...`
    );
    console.log(
      `   (${uploadedProjects.length} uploaded projects with real photos)\n`
    );
  } else {
    // Fallback to seed data
    projectsToSeed = seedProjects;
    console.log(`\n📦 Adding ${seedProjects.length} seed projects...`);
    console.log(`   (Using mock data - no uploaded projects found)\n`);
  }

  const errors: string[] = [];
  let successCount = 0;

  for (const project of projectsToSeed) {
    try {
      // Validate project data before inserting
      validateProject(project);

      // Add to Firestore
      const projectsCollection = collection(db, "projects");
      const docRef = await addDoc(projectsCollection, project);

      successCount++;

      // Show indicator if project has real photos
      const hasRealPhotos = project.pictures.some((p) => p.storagePath);
      const indicator = hasRealPhotos ? "🎨" : "📷";

      // Build details string
      const photoCount = `${project.pictures.length} photo${
        project.pictures.length !== 1 ? "s" : ""
      }`;
      const docCount = project.documents?.length || 0;
      const docString =
        docCount > 0 ? `, ${docCount} doc${docCount !== 1 ? "s" : ""}` : "";

      console.log(
        `   ${indicator} Added: "${project.name}" (${project.category}, ${photoCount}${docString}) - ID: ${docRef.id}`
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

  const projectCount = uploadedProjects?.length || seedProjects.length;
  const dataSource = uploadedProjects
    ? "uploaded from Firebase Storage"
    : "mock seed data";
  console.log(`📊 Projects to seed: ${projectCount} (${dataSource})\n`);

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
