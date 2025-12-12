import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Load environment variables from .env file (Node.js scripts only)
 * This allows developers to set EXPO_PUBLIC_FIREBASE_ENV or NODE_ENV in .env
 *
 * Only loads in Node.js environment (scripts), not in React Native.
 * Metro bundler is configured to exclude dotenv from the React Native bundle.
 */
if (
  typeof __DEV__ === "undefined" &&
  typeof process !== "undefined" &&
  process.versions?.node
) {
  // Only load dotenv in Node.js context (scripts), not in React Native
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("dotenv").config();
  } catch {
    // dotenv is optional - scripts can still work without it
    // (using npm script environment variables or system env vars)
  }
}

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
 * Priority:
 * 1. EXPO_PUBLIC_FIREBASE_ENV environment variable (if set to "production" or "dev")
 * 2. In React Native (__DEV__ is defined): Use __DEV__ flag
 * 3. In Node.js scripts (__DEV__ is undefined): Use NODE_ENV, default to dev
 */
function getFirebaseConfig() {
  // Check for explicit environment override (useful for testing production in simulator)
  const envOverride = process.env.EXPO_PUBLIC_FIREBASE_ENV;
  if (envOverride === "production") {
    return PROD_FIREBASE_CONFIG;
  }
  if (envOverride === "dev" || envOverride === "development") {
    return DEV_FIREBASE_CONFIG;
  }

  // React Native context - use __DEV__
  if (typeof __DEV__ !== "undefined") {
    return __DEV__ ? DEV_FIREBASE_CONFIG : PROD_FIREBASE_CONFIG;
  }

  // Node.js script context - use NODE_ENV, default to dev for safety
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
  console.error("Failed to initialize Firebase:", error);
  throw new Error("Firebase initialization failed");
}

export { db, storage };
export default app;

function getCurrentEnvironment(): "development" | "production" {
  // Check for explicit environment override
  const envOverride = process.env.EXPO_PUBLIC_FIREBASE_ENV;
  if (envOverride === "production") {
    return "production";
  }
  if (envOverride === "dev" || envOverride === "development") {
    return "development";
  }

  if (typeof __DEV__ !== "undefined") {
    return __DEV__ ? "development" : "production";
  }
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

export const currentEnvironment = getCurrentEnvironment();
export const currentProjectId = firebaseConfig.projectId;
