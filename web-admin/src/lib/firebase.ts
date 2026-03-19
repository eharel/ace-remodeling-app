import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * Firebase configuration for the web admin panel.
 * Standalone initialization — does not import from the shared config
 * since that file contains React Native–specific logic (__DEV__, process.env).
 *
 * Set VITE_FIREBASE_ENV=production in .env.local to point at the prod database.
 * Defaults to development.
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

const env = import.meta.env.VITE_FIREBASE_ENV ?? "development";
const isProduction = env === "production";

const firebaseConfig = isProduction ? PROD_FIREBASE_CONFIG : DEV_FIREBASE_CONFIG;

export const currentEnvironment: "development" | "production" = isProduction
  ? "production"
  : "development";

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
