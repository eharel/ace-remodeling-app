/**
 * Migration: Consolidate document fields to use only `category`
 *
 * Problem: Documents have both `type` and `category` fields with inconsistent data.
 * - `type` often has wrong values (e.g., "Other" for floor plans)
 * - `category` has correct values but in kebab-case (e.g., "plans", "materials")
 *
 * This script:
 * 1. Converts `category` to proper display format (e.g., "plans" → "Floor Plan")
 * 2. Removes the redundant `type` field
 *
 * Run with: npx tsx scripts/migrations/syncDocumentTypeWithCategory.ts
 * Add --dry-run to preview changes without writing to database
 */

import { db } from "../lib/firebase/client";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  DocumentData,
} from "firebase/firestore";

// Map old category values to new display-friendly category values
const categoryMapping: Record<string, string> = {
  // From kebab-case category field
  plans: "Floor Plan",
  "floor-plan": "Floor Plan",
  materials: "Materials",
  "rendering-3d": "3D Rendering",
  "3d-rendering": "3D Rendering",
  contract: "Contract",
  contracts: "Contract",
  permit: "Permit",
  permits: "Permit",
  invoice: "Invoice",
  invoices: "Invoice",
  other: "Other",
  // From type field (in case category is missing)
  "Floor Plan": "Floor Plan",
  Materials: "Materials",
  "3D Rendering": "3D Rendering",
  Contract: "Contract",
  Permit: "Permit",
  Invoice: "Invoice",
  Other: "Other",
};

interface MigrationChange {
  projectId: string;
  projectName: string;
  componentCategory: string;
  documentName: string;
  oldType: string | undefined;
  oldCategory: string | undefined;
  newCategory: string;
}

async function migrateDocuments(dryRun: boolean) {
  console.log(
    dryRun
      ? "🔍 DRY RUN - No changes will be made\n"
      : "🚀 LIVE RUN - Changes will be written to database\n"
  );

  const projectsRef = collection(db, "projects");
  const snapshot = await getDocs(projectsRef);

  const changes: MigrationChange[] = [];
  let totalDocs = 0;
  let unchangedDocs = 0;

  // First pass: collect all changes
  for (const projectDoc of snapshot.docs) {
    const project = projectDoc.data();

    for (const component of project.components || []) {
      for (const document of component.documents || []) {
        totalDocs++;

        // Determine the correct category value
        // Priority: category field (if valid) > type field
        let sourceValue = document.category || document.type;
        if (!sourceValue) {
          console.warn(
            `⚠️  Document "${document.name}" in project ${project.number} has no category or type`
          );
          sourceValue = "Other";
        }

        const normalizedSource = sourceValue.toLowerCase().trim();
        const newCategory =
          categoryMapping[normalizedSource] || categoryMapping[sourceValue];

        if (!newCategory) {
          console.warn(
            `⚠️  Unknown value "${sourceValue}" in project ${project.number} - ${project.name}, defaulting to "Other"`
          );
        }

        const finalCategory = newCategory || "Other";

        // Check if anything needs to change
        const needsChange =
          document.type !== undefined || // Has type field to remove
          document.category !== finalCategory; // Category needs updating

        if (!needsChange) {
          unchangedDocs++;
          continue;
        }

        changes.push({
          projectId: projectDoc.id,
          projectName: `${project.number} - ${project.name}`,
          componentCategory: component.category,
          documentName: document.name,
          oldType: document.type,
          oldCategory: document.category,
          newCategory: finalCategory,
        });
      }
    }
  }

  // Report changes
  console.log(`Total documents scanned: ${totalDocs}`);
  console.log(`Documents already correct: ${unchangedDocs}`);
  console.log(`Documents to update: ${changes.length}\n`);

  if (changes.length === 0) {
    console.log("✅ No changes needed!");
    return;
  }

  console.log("Changes to be made:");
  console.log("=".repeat(80));

  for (const change of changes) {
    console.log(`\n📄 "${change.documentName}"`);
    console.log(`   Project: ${change.projectName}`);
    console.log(`   Component: ${change.componentCategory}`);
    if (change.oldType !== undefined) {
      console.log(`   type: "${change.oldType}" → (removed)`);
    }
    console.log(
      `   category: ${change.oldCategory ? `"${change.oldCategory}"` : "undefined"} → "${change.newCategory}"`
    );
  }

  if (dryRun) {
    console.log("\n" + "=".repeat(80));
    console.log("🔍 DRY RUN COMPLETE - No changes were made");
    console.log("Run without --dry-run to apply these changes");
    return;
  }

  // Second pass: apply changes
  console.log("\n" + "=".repeat(80));
  console.log("Applying changes...\n");

  // Group changes by project for batch updates
  const changesByProject = new Map<string, MigrationChange[]>();
  for (const change of changes) {
    const existing = changesByProject.get(change.projectId) || [];
    existing.push(change);
    changesByProject.set(change.projectId, existing);
  }

  let updatedProjects = 0;
  let updatedDocs = 0;

  for (const [projectId, projectChanges] of changesByProject) {
    // Get the full project data
    const projectRef = doc(db, "projects", projectId);
    const projectSnapshot = await getDocs(collection(db, "projects"));
    const projectDoc = projectSnapshot.docs.find((d) => d.id === projectId);

    if (!projectDoc) {
      console.error(`❌ Could not find project ${projectId}`);
      continue;
    }

    const projectData = projectDoc.data() as DocumentData;
    const updatedComponents = [...(projectData.components || [])];

    // Update documents in components
    for (const component of updatedComponents) {
      if (!component.documents) continue;

      component.documents = component.documents.map(
        (document: DocumentData) => {
          const change = projectChanges.find(
            (c) =>
              c.componentCategory === component.category &&
              c.documentName === document.name
          );

          if (change) {
            updatedDocs++;
            // Remove type field, set category to new value
            const { type, ...rest } = document;
            return {
              ...rest,
              category: change.newCategory,
            };
          }

          // Even if no change needed, ensure type is removed if present
          if (document.type !== undefined) {
            const { type, ...rest } = document;
            return rest;
          }

          return document;
        }
      );
    }

    // Write the updated project
    const batch = writeBatch(db);
    batch.update(projectRef, { components: updatedComponents });
    await batch.commit();

    updatedProjects++;
    console.log(`✅ Updated project: ${projectChanges[0].projectName}`);
  }

  console.log("\n" + "=".repeat(80));
  console.log(`✅ Migration complete!`);
  console.log(`   Projects updated: ${updatedProjects}`);
  console.log(`   Documents updated: ${updatedDocs}`);
}

// Parse command line args
const dryRun = process.argv.includes("--dry-run");

migrateDocuments(dryRun)
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
