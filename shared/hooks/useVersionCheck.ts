import { useEffect, useState } from "react";
import {
  fetchVersionConfig,
  getCurrentBuildNumber,
  isUpdateRequired,
} from "@/shared/utils";

/**
 * Return type for the useVersionCheck hook
 */
interface UseVersionCheckResult {
  /** Whether the current build requires an update */
  updateRequired: boolean;
  /** Whether the version check is still in progress */
  isLoading: boolean;
}

/**
 * Custom hook to check if the current app build needs to be updated.
 *
 * Fetches the minimum required build number from Firestore on mount
 * and compares it with the current build number. Only fetches once
 * per app session - does not poll for updates.
 *
 * Handles errors gracefully by failing silently and assuming no update
 * is required if the check fails.
 *
 * @returns Object containing updateRequired flag and isLoading state
 *
 * @example
 * function MyComponent() {
 *   const { updateRequired, isLoading } = useVersionCheck();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (updateRequired) return <UpdateBanner />;
 *   return <AppContent />;
 * }
 */
export function useVersionCheck(): UseVersionCheckResult {
  const [updateRequired, setUpdateRequired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function checkVersion() {
      try {
        // Get current build number
        const currentBuild = getCurrentBuildNumber();

        // Fetch minimum required build from Firestore
        const versionConfig = await fetchVersionConfig();

        // Only update state if component is still mounted
        if (!isMounted) return;

        // If we successfully got the config, check if update is needed
        if (versionConfig !== null) {
          const needsUpdate = isUpdateRequired(
            currentBuild,
            versionConfig.minimumBuildNumber
          );
          setUpdateRequired(needsUpdate);
        }
        // If config fetch failed, fail gracefully (updateRequired remains false)
      } catch (error) {
        // Fail gracefully (updateRequired remains false)
      } finally {
        // Always set loading to false, even if fetch failed
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkVersion();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array = only run once on mount

  return { updateRequired, isLoading };
}

