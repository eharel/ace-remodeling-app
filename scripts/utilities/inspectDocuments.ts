/**
 * Script to inspect document data in Firebase
 * Run with: npx tsx scripts/utilities/inspectDocuments.ts
 */

import { db } from "../lib/firebase/client";
import { collection, getDocs } from "firebase/firestore";

async function inspectAllDocuments() {
  console.log("Fetching all projects to analyze document type vs category...\n");

  const projectsRef = collection(db, "projects");
  const snapshot = await getDocs(projectsRef);

  const combinations: Record<string, number> = {};
  let totalDocs = 0;

  for (const projectDoc of snapshot.docs) {
    const project = projectDoc.data();

    for (const component of project.components || []) {
      for (const doc of component.documents || []) {
        totalDocs++;
        const key = `type="${doc.type}" | category=${doc.category ? `"${doc.category}"` : "undefined"}`;
        combinations[key] = (combinations[key] || 0) + 1;
      }
    }
  }

  console.log(`Total documents across all projects: ${totalDocs}\n`);
  console.log("Type vs Category combinations:");
  console.log("=".repeat(60));

  // Sort by count descending
  const sorted = Object.entries(combinations).sort((a, b) => b[1] - a[1]);
  for (const [combo, count] of sorted) {
    console.log(`  ${count.toString().padStart(4)} x ${combo}`);
  }
}

inspectAllDocuments()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
