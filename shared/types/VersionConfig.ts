/**
 * Type definition for the Firestore version config document
 * 
 * This configuration is stored in Firestore at: config/appVersion
 * and is used to determine if users need to update to a newer build.
 */
export interface VersionConfig {
  /**
   * The minimum build number required to use the app.
   * Users with a build number lower than this will be prompted to update.
   */
  minimumBuildNumber: number;
}

