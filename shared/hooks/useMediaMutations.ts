import { MediaAsset } from "@/core/types";
import {
  addMediaToComponent,
  removeMediaFromComponent,
  reorderComponentMedia,
} from "@/services/data";
import { useCallback, useState } from "react";
import { useProjects } from "../contexts/ProjectsContext";

/**
 * Return type for the useMediaMutations hook
 */
export interface UseMediaMutationsReturn {
  /**
   * Add a media asset to a component's media array.
   * Handles the read-modify-write pattern internally.
   *
   * @param projectId - The ID of the project containing the component
   * @param componentId - The ID of the component to add media to
   * @param media - The MediaAsset to add
   * @throws Error if the mutation fails
   */
  addMedia: (
    projectId: string,
    componentId: string,
    media: MediaAsset
  ) => Promise<void>;

  /**
   * Remove a media asset from a component's media array.
   * Handles the read-modify-write pattern internally.
   *
   * @param projectId - The ID of the project containing the component
   * @param componentId - The ID of the component to remove media from
   * @param mediaId - The ID of the media asset to remove
   * @throws Error if the mutation fails
   */
  removeMedia: (
    projectId: string,
    componentId: string,
    mediaId: string
  ) => Promise<void>;

  /**
   * Reorder media assets in a component's media array.
   * Handles the read-modify-write pattern internally.
   *
   * @param projectId - The ID of the project containing the component
   * @param componentId - The ID of the component to reorder media for
   * @param newOrder - Array of MediaAsset objects in the desired order
   * @throws Error if the mutation fails
   */
  reorderMedia: (
    projectId: string,
    componentId: string,
    newOrder: MediaAsset[]
  ) => Promise<void>;

  /** Whether a mutation is currently in progress */
  isUpdating: boolean;

  /** Error from the last mutation, if any */
  error: Error | null;

  /** Clear the current error state */
  clearError: () => void;
}

/**
 * Hook for mutating media data on components.
 *
 * Provides a clean API for managing component media arrays with built-in
 * loading states and error handling. Automatically refetches projects
 * from the ProjectsContext after successful mutations.
 *
 * @returns Object containing mutation functions and state
 *
 * @example
 * function MediaManager() {
 *   const { addMedia, removeMedia, isUpdating, error } = useMediaMutations();
 *
 *   const handleAddPhoto = async () => {
 *     try {
 *       await addMedia("project-123", "component-456", newMediaAsset);
 *       // Projects context will automatically refetch
 *     } catch (e) {
 *       // Error is captured in error state
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleAddPhoto} disabled={isUpdating}>
 *       {isUpdating ? "Adding..." : "Add Photo"}
 *     </button>
 *   );
 * }
 */
export function useMediaMutations(): UseMediaMutationsReturn {
  const { refetchProjects } = useProjects();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAddMedia = useCallback(
    async (projectId: string, componentId: string, media: MediaAsset) => {
      try {
        setIsUpdating(true);
        setError(null);

        await addMediaToComponent(projectId, componentId, media);

        // Refetch projects to reflect changes in UI
        await refetchProjects();
      } catch (e) {
        const caughtError =
          e instanceof Error ? e : new Error("Unknown error occurred");
        setError(caughtError);
        // Re-throw so caller can handle if needed
        throw caughtError;
      } finally {
        setIsUpdating(false);
      }
    },
    [refetchProjects]
  );

  const handleRemoveMedia = useCallback(
    async (projectId: string, componentId: string, mediaId: string) => {
      try {
        setIsUpdating(true);
        setError(null);

        await removeMediaFromComponent(projectId, componentId, mediaId);

        // Refetch projects to reflect changes in UI
        await refetchProjects();
      } catch (e) {
        const caughtError =
          e instanceof Error ? e : new Error("Unknown error occurred");
        setError(caughtError);
        // Re-throw so caller can handle if needed
        throw caughtError;
      } finally {
        setIsUpdating(false);
      }
    },
    [refetchProjects]
  );

  const handleReorderMedia = useCallback(
    async (projectId: string, componentId: string, newOrder: MediaAsset[]) => {
      try {
        setIsUpdating(true);
        setError(null);

        await reorderComponentMedia(projectId, componentId, newOrder);

        // Refetch projects to reflect changes in UI
        await refetchProjects();
      } catch (e) {
        const caughtError =
          e instanceof Error ? e : new Error("Unknown error occurred");
        setError(caughtError);
        // Re-throw so caller can handle if needed
        throw caughtError;
      } finally {
        setIsUpdating(false);
      }
    },
    [refetchProjects]
  );

  return {
    addMedia: handleAddMedia,
    removeMedia: handleRemoveMedia,
    reorderMedia: handleReorderMedia,
    isUpdating,
    error,
    clearError,
  };
}
