/**
 * Migration script to remove redundant 'id' field from project documents
 * The Firestore document ID is the source of truth for project IDs
 *
 * Usage:
 *   npm run migrate:remove-id                    # Dry run on dev (preview changes)
 *   npm run migrate:remove-id -- --env=dev       # Dry run on dev
 *   npm run migrate:remove-id -- --env=prod      # Dry run on prod
 *   npm run migrate:remove-id -- --execute       # Execute on dev
 *   npm run migrate:remove-id -- --env=prod --execute  # Execute on prod
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteField,
} from "firebase/firestore";

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
 * Get Firebase config based on environment
 */
function getFirebaseConfig(environment: Environment = "dev") {
  return environment === "prod" ? PROD_FIREBASE_CONFIG : DEV_FIREBASE_CONFIG;
}

const PROJECTS_COLLECTION = "projects";

async function removeIdFields() {
  // Parse command-line arguments
  const args = process.argv.slice(2);
  const isDryRun = !args.includes("--execute");
  
  // Parse environment (default to dev for safety)
  let environment: Environment = "dev";
  const envArg = args.find((arg) => arg.startsWith("--env="));
  if (envArg) {
    const envValue = envArg.split("=")[1]?.toLowerCase();
    if (envValue === "dev" || envValue === "prod") {
      environment = envValue;
    }
  }

  console.log("🔧 Migration: Remove redundant id fields from projects");
  console.log("=".repeat(50));
  console.log(
    `📍 Running against ${environment.toUpperCase()} database`
  );
  console.log(
    `🗄️  Target Database: ${
      environment === "prod" ? "ace-remodeling" : "ace-remodeling-dev"
    }`
  );
  console.log(
    `📋 Mode: ${
      isDryRun ? "DRY RUN (preview only)" : "EXECUTE (will modify data)"
    }`
  );
  
  if (environment === "prod") {
    console.log("\n⚠️  WARNING: You are targeting PRODUCTION database!");
  }
  
  console.log("");

  // Initialize Firebase with the specified environment
  const firebaseConfig = getFirebaseConfig(environment);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // Fetch all projects
    console.log("📥 Fetching all projects...");
    const projectsRef = collection(db, PROJECTS_COLLECTION);
    const snapshot = await getDocs(projectsRef);

    console.log(`✅ Found ${snapshot.docs.length} projects\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Process each project
    for (const projectDoc of snapshot.docs) {
      const data = projectDoc.data();
      const docId = projectDoc.id;
      const dataId = data.id;

      // Check if document has an 'id' field
      if (dataId === undefined) {
        console.log(`⏭️  Skipping ${docId} - no 'id' field to remove`);
        skippedCount++;
        continue;
      }

      console.log(`🔍 Document ID: ${docId}`);
      console.log(`   Field 'id': ${dataId}`);
      console.log(`   Match: ${docId === dataId ? "✅" : "❌ MISMATCH!"}`);

      if (isDryRun) {
        console.log(`   [DRY RUN] Would remove 'id' field\n`);
        updatedCount++;
      } else {
        // Actually remove the field
        const projectRef = doc(db, PROJECTS_COLLECTION, docId);
        await updateDoc(projectRef, {
          id: deleteField(),
        });
        console.log(`   ✅ Removed 'id' field\n`);
        updatedCount++;
      }
    }

    // Summary
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 Migration Summary:");
    console.log(`   Total documents: ${snapshot.docs.length}`);
    console.log(`   ${isDryRun ? "Would update" : "Updated"}: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (isDryRun) {
      console.log("\n💡 To actually execute the migration, run:");
      console.log("   npm run migrate:remove-id -- --execute");
    } else {
      console.log("\n✅ Migration completed successfully!");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
removeIdFields();
