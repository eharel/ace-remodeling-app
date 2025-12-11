import { MediaAsset } from "@/core/types";
import { deleteFile } from "@/services/storage";
import { useCallback, useState } from "react";
import { useMediaMutations } from "./useMediaMutations";

/**
 * Return type for the usePhotoDelete hook
 */
export interface UsePhotoDeleteReturn {
  /**
   * Delete a photo from both Storage and Firestore.
   * Handles optimistic updates and error recovery.
   *
   * @param projectId - The ID of the project containing the photo
   * @param componentId - The ID of the component containing the photo
   * @param photo - The MediaAsset to delete
   * @throws Error if deletion fails
   */
  deletePhoto: (
    projectId: string,
    componentId: string,
    photo: MediaAsset
  ) => Promise<void>;

  /** Whether a deletion is currently in progress */
  isDeleting: boolean;

  /** ID of the photo currently being deleted */
  deletingPhotoId: string | null;

  /** Error from the last deletion, if any */
  error: Error | null;

  /** Clear the current error state */
  clearError: () => void;
}

/**
 * Hook for deleting photos from both Firebase Storage and Firestore.
 *
 * Provides a clean API for photo deletion with built-in loading states
 * and error handling. Uses optimistic updates for instant UI feedback.
 * If Storage deletion fails, the photo is still removed from Firestore
 * (orphaned files can be cleaned up later).
 *
 * @returns Object containing deletion function and state
 *
 * @example
 * function PhotoCard({ photo }) {
 *   const { deletePhoto, isDeleting, deletingPhotoId } = usePhotoDelete();
 *
 *   const handleDelete = async () => {
 *     try {
 *       await deletePhoto("project-123", "component-456", photo);
 *       // Photo removed from UI immediately via optimistic update
 *     } catch (e) {
 *       // Error is captured in error state
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleDelete} disabled={isDeleting}>
 *       {isDeleting && deletingPhotoId === photo.id ? "Deleting..." : "Delete"}
 *     </button>
 *   );
 * }
 */
export function usePhotoDelete(): UsePhotoDeleteReturn {
  const { removeMedia } = useMediaMutations();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const deletePhoto = useCallback(
    async (
      projectId: string,
      componentId: string,
      photo: MediaAsset
    ): Promise<void> => {
      try {
        setIsDeleting(true);
        setDeletingPhotoId(photo.id);
        setError(null);

        // 1. Optimistically remove from UI (via removeMedia)
        // This handles the Firestore deletion and optimistic update
        await removeMedia(projectId, componentId, photo.id);

        // 2. Delete from Firebase Storage
        // If this fails, we log a warning but don't rollback
        // (Firestore is the source of truth, orphaned files can be cleaned up later)
        if (photo.storagePath) {
          try {
            await deleteFile(photo.storagePath);
          } catch (storageError) {
            // Log warning but don't throw - Firestore deletion succeeded
            console.warn(
              `Failed to delete file from Storage: ${photo.storagePath}`,
              storageError
            );
            // Optionally, you could track orphaned files for cleanup
          }
        }
      } catch (e) {
        const caughtError =
          e instanceof Error ? e : new Error("Failed to delete photo");
        setError(caughtError);
        // Re-throw so caller can handle if needed
        throw caughtError;
      } finally {
        setIsDeleting(false);
        setDeletingPhotoId(null);
      }
    },
    [removeMedia]
  );

  return {
    deletePhoto,
    isDeleting,
    deletingPhotoId,
    error,
    clearError,
  };
}
