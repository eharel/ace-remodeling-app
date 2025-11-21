import Constants from "expo-constants";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/core/config";
import type { VersionConfig } from "@/core/types/VersionConfig";
import appConfig from "../../app.json";

/**
 * Firestore collection and document paths for version configuration
 */
const FIRESTORE_COLLECTION = "config";
const FIRESTORE_DOCUMENT = "appVersion";

/**
 * Base for parsing decimal numbers
 */
const DECIMAL_BASE = 10;

/**
 * Gets the current build number from the app's native configuration.
 * 
 * Tries Constants.expoConfig first (works in production builds), then falls
 * back to app.json (needed for development builds where Constants may not
 * be populated).
 * 
 * @returns The current build number as a number, or null if unavailable
 * 
 * @example
 * const buildNumber = getCurrentBuildNumber();
 * if (buildNumber !== null) {
 *   console.log(`Running build ${buildNumber}`);
 * }
 */
export function getCurrentBuildNumber(): number | null {
  // Try Constants first (works in production builds)
  let buildNumberString = Constants.expoConfig?.ios?.buildNumber;
  
  // Fallback to app.json for development builds
  if (!buildNumberString) {
    buildNumberString = appConfig.expo.ios.buildNumber;
  }
  
  if (!buildNumberString) {
    return null;
  }

  const buildNumber = parseInt(buildNumberString, DECIMAL_BASE);
  
  // Validate that parsing succeeded and returned a valid number
  if (isNaN(buildNumber)) {
    return null;
  }

  return buildNumber;
}

/**
 * Determines if an app update is required based on build numbers.
 * 
 * Pure function with no side effects - performs simple comparison logic.
 * Handles null current build gracefully by returning false (no update required).
 * 
 * @param currentBuild - The current build number, or null if unavailable
 * @param minimumBuild - The minimum required build number
 * @returns true if current build is less than minimum (update required), false otherwise
 * 
 * @example
 * const updateNeeded = isUpdateRequired(8, 10); // returns true
 * const upToDate = isUpdateRequired(10, 10);    // returns false
 * const buildUnknown = isUpdateRequired(null, 10); // returns false (graceful fallback)
 */
export function isUpdateRequired(
  currentBuild: number | null,
  minimumBuild: number
): boolean {
  // If current build is unknown, don't force update
  if (currentBuild === null) {
    return false;
  }

  return currentBuild < minimumBuild;
}

/**
 * Fetches the version configuration from Firestore.
 * 
 * Retrieves the minimum required build number from the 'config/appVersion' document.
 * Uses proper error handling and returns null on failure.
 * 
 * @returns Promise resolving to VersionConfig object, or null if fetch fails
 * 
 * @example
 * const config = await fetchVersionConfig();
 * if (config) {
 *   console.log(`Minimum build required: ${config.minimumBuildNumber}`);
 * }
 */
export async function fetchVersionConfig(): Promise<VersionConfig | null> {
  try {
    const versionDocRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOCUMENT);
    const versionDoc = await getDoc(versionDocRef);

    if (!versionDoc.exists()) {
      return null;
    }

    const data = versionDoc.data() as VersionConfig;

    // Validate that we got the expected data structure
    if (typeof data.minimumBuildNumber !== "number") {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

