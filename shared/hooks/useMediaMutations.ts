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
 * loading states and error handling. Uses optimistic updates for instant
 * UI feedback, with automatic rollback on error.
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
 *       // UI updates immediately via optimistic update
 *     } catch (e) {
 *       // Error is captured in error state, UI automatically rolls back
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
  const { projects, updateProjectOptimistically, rollbackProject } =
    useProjects();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAddMedia = useCallback(
    async (projectId: string, componentId: string, media: MediaAsset) => {
      // 1. Find current project for rollback
      const originalProject = projects.find((p) => p.id === projectId);
      if (!originalProject) {
        const notFoundError = new Error(
          `Project with ID "${projectId}" not found`
        );
        setError(notFoundError);
        throw notFoundError;
      }

      try {
        setIsUpdating(true);
        setError(null);

        // 2. Optimistically update UI
        updateProjectOptimistically(projectId, (project) => ({
          ...project,
          components: project.components.map((c) =>
            c.id === componentId
              ? {
                  ...c,
                  media: [...(c.media || []), media],
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
          updatedAt: new Date().toISOString(),
        }));

        // 3. Persist to Firestore
        await addMediaToComponent(projectId, componentId, media);
      } catch (e) {
        // 4. Rollback on failure
        rollbackProject(projectId, originalProject);
        const caughtError =
          e instanceof Error ? e : new Error("Unknown error occurred");
        setError(caughtError);
        // Re-throw so caller can handle if needed
        throw caughtError;
      } finally {
        setIsUpdating(false);
      }
    },
    [projects, updateProjectOptimistically, rollbackProject]
  );

  const handleRemoveMedia = useCallback(
    async (projectId: string, componentId: string, mediaId: string) => {
      // 1. Find current project for rollback
      const originalProject = projects.find((p) => p.id === projectId);
      if (!originalProject) {
        const notFoundError = new Error(
          `Project with ID "${projectId}" not found`
        );
        setError(notFoundError);
        throw notFoundError;
      }

      try {
        setIsUpdating(true);
        setError(null);

        // 2. Optimistically update UI
        updateProjectOptimistically(projectId, (project) => ({
          ...project,
          components: project.components.map((c) =>
            c.id === componentId
              ? {
                  ...c,
                  media: (c.media || []).filter((m) => m.id !== mediaId),
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
          updatedAt: new Date().toISOString(),
        }));

        // 3. Persist to Firestore
        await removeMediaFromComponent(projectId, componentId, mediaId);
      } catch (e) {
        // 4. Rollback on failure
        rollbackProject(projectId, originalProject);
        const caughtError =
          e instanceof Error ? e : new Error("Unknown error occurred");
        setError(caughtError);
        // Re-throw so caller can handle if needed
        throw caughtError;
      } finally {
        setIsUpdating(false);
      }
    },
    [projects, updateProjectOptimistically, rollbackProject]
  );

  const handleReorderMedia = useCallback(
    async (projectId: string, componentId: string, newOrder: MediaAsset[]) => {
      // 1. Find current project for rollback
      const originalProject = projects.find((p) => p.id === projectId);
      if (!originalProject) {
        const notFoundError = new Error(
          `Project with ID "${projectId}" not found`
        );
        setError(notFoundError);
        throw notFoundError;
      }

      try {
        setIsUpdating(true);
        setError(null);

        // 2. Optimistically update UI
        updateProjectOptimistically(projectId, (project) => ({
          ...project,
          components: project.components.map((c) =>
            c.id === componentId
              ? {
                  ...c,
                  media: newOrder,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
          updatedAt: new Date().toISOString(),
        }));

        // 3. Persist to Firestore
        await reorderComponentMedia(projectId, componentId, newOrder);
      } catch (e) {
        // 4. Rollback on failure
        rollbackProject(projectId, originalProject);
        const caughtError =
          e instanceof Error ? e : new Error("Unknown error occurred");
        setError(caughtError);
        // Re-throw so caller can handle if needed
        throw caughtError;
      } finally {
        setIsUpdating(false);
      }
    },
    [projects, updateProjectOptimistically, rollbackProject]
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
