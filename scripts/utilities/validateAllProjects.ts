#!/usr/bin/env tsx

/**
 * validateAllProjects.ts
 *
 * Fetches every project document from Firestore and runs ProjectSchema.parse()
 * on each one. Prints a summary of which documents pass and which fail, with
 * exact Zod error paths for failures.
 *
 * Useful for diagnosing why fetchAllProjects() throws and returns no projects —
 * one bad document in the collection causes the entire fetch to fail.
 *
 * Usage:
 *   npx tsx scripts/utilities/validateAllProjects.ts --env=prod
 *   npx tsx scripts/utilities/validateAllProjects.ts --env=dev
 *
 * Defaults: --env=prod
 */

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
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

function parseArgs(args: string[]): { env: Environment } {
  let env: Environment = "prod";
  for (const arg of args) {
    if (arg.startsWith("--env=")) {
      const val = arg.split("=")[1]?.toLowerCase();
      if (val === "dev" || val === "prod") env = val;
    }
  }
  return { env };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { env } = parseArgs(process.argv.slice(2));

  console.log(`\n🔍  Validating all projects on ${env.toUpperCase()} database\n`);

  const config = env === "prod" ? PROD_FIREBASE_CONFIG : DEV_FIREBASE_CONFIG;
  const app = initializeApp(config);
  const db = getFirestore(app);

  const snapshot = await getDocs(collection(db, "projects"));

  console.log(`📦  Found ${snapshot.docs.length} documents\n`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  let passCount = 0;
  let failCount = 0;
  const failures: { id: string; name?: string; errors: string[] }[] = [];

  for (const docSnap of snapshot.docs) {
    const id = docSnap.id;
    const data = docSnap.data();

    // Mimic what fetchAllProjects does: ensure component IDs, then parse
    const components = (data.components || []).map((c: any) =>
      c.id ? c : { ...c, id: `generated-${Math.random().toString(36).slice(2)}` }
    );

    try {
      ProjectSchema.parse({ id, ...data, components });
      passCount++;
      process.stdout.write(".");
    } catch (err) {
      failCount++;
      process.stdout.write("✗");

      const errorMessages: string[] = [];
      if (err instanceof ZodError) {
        for (const issue of err.issues) {
          const path = issue.path.join(".") || "(root)";
          errorMessages.push(`[${path}] ${issue.message} (code: ${issue.code})`);
        }
      } else {
        errorMessages.push(String(err));
      }

      failures.push({ id, name: data.name, errors: errorMessages });
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Summary
  console.log(`✅  Passed: ${passCount}`);
  console.log(`❌  Failed: ${failCount}`);

  if (failures.length > 0) {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("FAILING DOCUMENTS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    for (const { id, name, errors } of failures) {
      console.error(`📄  ${name ?? "(no name)"} — ID: ${id}`);
      for (const msg of errors) {
        console.error(`    • ${msg}`);
      }
      console.error("");
    }

    console.log("⚠️   These documents cause fetchAllProjects() to throw,");
    console.log("    which means the app loads ZERO projects for all users.");
  } else {
    console.log("\n🎉  All documents are valid — schema is not the issue.");
  }

  console.log("");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
