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
 * - In React Native (__DEV__ is defined): Use __DEV__ flag
 * - In Node.js scripts (__DEV__ is undefined): Use NODE_ENV, default to dev
 */
function getFirebaseConfig() {
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

// Export for debugging which environment is active
export const currentEnvironment = __DEV__ ? "development" : "production";
export const currentProjectId = firebaseConfig.projectId;
