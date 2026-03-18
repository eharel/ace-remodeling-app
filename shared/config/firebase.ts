import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase configuration
 * API keys are safe to be public in client applications
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
 * Determine which Firebase config to use
 *
 * React Native (app):
 *   - Production builds (__DEV__ = false): always use PROD. The env override is
 *     intentionally ignored so a stale .env value can never point a production
 *     bundle at the wrong database.
 *   - Dev builds (__DEV__ = true): EXPO_PUBLIC_FIREBASE_ENV can override to
 *     "production" (useful for testing prod data in the simulator).
 *
 * Node.js scripts (__DEV__ is undefined):
 *   - EXPO_PUBLIC_FIREBASE_ENV or NODE_ENV controls the target; defaults to dev.
 */
function getFirebaseConfig() {
  // React Native context
  if (typeof __DEV__ !== "undefined") {
    if (!__DEV__) {
      // Production build — always use prod, ignore any baked-in env override
      return PROD_FIREBASE_CONFIG;
    }
    // Dev build (simulator) — allow override to test against prod data
    const envOverride = process.env.EXPO_PUBLIC_FIREBASE_ENV;
    if (envOverride === "production") return PROD_FIREBASE_CONFIG;
    if (envOverride === "dev" || envOverride === "development") return DEV_FIREBASE_CONFIG;
    return DEV_FIREBASE_CONFIG; // default for dev builds
  }

  // Node.js script context - use EXPO_PUBLIC_FIREBASE_ENV or NODE_ENV, default to dev
  const envOverride = process.env.EXPO_PUBLIC_FIREBASE_ENV;
  if (envOverride === "production") return PROD_FIREBASE_CONFIG;
  if (envOverride === "dev" || envOverride === "development") return DEV_FIREBASE_CONFIG;
  const isProduction = process.env.NODE_ENV === "production";
  return isProduction ? PROD_FIREBASE_CONFIG : DEV_FIREBASE_CONFIG;
}

const firebaseConfig = getFirebaseConfig();

/**
 * Initialize Firebase with error handling
 */
let app: any;
let db: any;
let storage: any;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  throw new Error("Firebase initialization failed");
}

export { db, storage };
export default app;

function getCurrentEnvironment(): "development" | "production" {
  if (typeof __DEV__ !== "undefined") {
    if (!__DEV__) return "production";
    const envOverride = process.env.EXPO_PUBLIC_FIREBASE_ENV;
    if (envOverride === "production") return "production";
    return "development";
  }
  const envOverride = process.env.EXPO_PUBLIC_FIREBASE_ENV;
  if (envOverride === "production") return "production";
  if (envOverride === "dev" || envOverride === "development") return "development";
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export const currentEnvironment = getCurrentEnvironment();
export const currentProjectId = firebaseConfig.projectId;
