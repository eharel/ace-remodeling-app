#!/usr/bin/env tsx

/**
 * inspectProject.ts
 *
 * Fetches a single project document from Firestore by ID and prints all
 * fields to the console. Also runs ProjectSchema.parse() so you can see
 * immediately whether the document passes Zod validation — and if not,
 * exactly which field is failing.
 *
 * Usage:
 *   npx tsx scripts/utilities/inspectProject.ts --env=prod --id=<documentId>
 *   npx tsx scripts/utilities/inspectProject.ts --env=dev  --id=<documentId>
 *
 * Defaults: --env=prod (since this is typically used to debug production issues)
 */

import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { ZodError } from "zod";
import { ProjectSchema } from "../../shared/types/Project";

// ---------------------------------------------------------------------------
// Firebase configs
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(args: string[]): { env: Environment; id: string } {
  let env: Environment = "prod";
  let id = "";

  for (const arg of args) {
    if (arg.startsWith("--env=")) {
      const val = arg.split("=")[1]?.toLowerCase();
      if (val === "dev" || val === "prod") env = val;
    }
    if (arg.startsWith("--id=")) {
      id = arg.split("=")[1] ?? "";
    }
  }

  if (!id) {
    console.error("❌  Missing required argument: --id=<documentId>");
    console.error("    Example: npx tsx scripts/utilities/inspectProject.ts --env=prod --id=abc123");
    process.exit(1);
  }

  return { env, id };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { env, id } = parseArgs(process.argv.slice(2));

  console.log(`\n🔍  Inspecting project "${id}" on ${env.toUpperCase()} database\n`);

  const config = env === "prod" ? PROD_FIREBASE_CONFIG : DEV_FIREBASE_CONFIG;
  const app = initializeApp(config);
  const db = getFirestore(app);

  const docRef = doc(db, "projects", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    console.error(`❌  No document found with ID "${id}" in the ${env} database.`);
    process.exit(1);
  }

  const rawData = snapshot.data();

  // ---------------------------------------------------------------------------
  // 1. Print raw Firestore data
  // ---------------------------------------------------------------------------
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📄  RAW FIRESTORE DATA");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(JSON.stringify({ id, ...rawData }, null, 2));

  // ---------------------------------------------------------------------------
  // 2. Run Zod validation and report result
  // ---------------------------------------------------------------------------
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪  ZOD VALIDATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    ProjectSchema.parse({ id, ...rawData });
    console.log("✅  ProjectSchema.parse() PASSED — document is valid.");
  } catch (err) {
    if (err instanceof ZodError) {
      console.error("❌  ProjectSchema.parse() FAILED — validation errors:\n");
      for (const issue of err.issues) {
        const path = issue.path.join(".") || "(root)";
        console.error(`  • [${path}]  ${issue.message}  (code: ${issue.code})`);
      }
    } else {
      console.error("❌  Unexpected error during parse:", err);
    }
  }

  console.log("");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
