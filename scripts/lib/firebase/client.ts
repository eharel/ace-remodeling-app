/**
 * Firebase Client Re-exports
 *
 * Re-exports Firebase client SDK instances from app config.
 * Used by upload scripts to access Firebase services.
 *
 * @module scripts/lib/firebase/client
 */

import { currentEnvironment, db, storage } from "../../../shared/config/firebase";

export { db, storage };

/**
 * Environment detection
 */
export const isDevelopment = currentEnvironment === "development";
export const environment = currentEnvironment;

/**
 * Log which Firebase we're using
 * Only log once when module is imported
 */
