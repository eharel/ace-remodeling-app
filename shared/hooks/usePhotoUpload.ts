import { MEDIA_TYPES, MediaAsset, MediaStage } from "@/core/types";
import {
  buildMediaPath,
  generateFilename,
  uploadPhoto as uploadPhotoToStorage,
  UploadProgress,
} from "@/services/storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaMutations } from "./useMediaMutations";

/**
 * Options for uploading a photo
 */
export interface PhotoUploadOptions {
  /** Project ID */
  projectId: string;
  /** Component ID */
  componentId: string;
  /** Media stage (before, after, in-progress, renderings, other) */
  stage: MediaStage;
  /** Optional caption for the photo */
  caption?: string;
}

/**
 * Represents a photo currently being uploaded
 */
export interface UploadingPhoto {
  /** Temporary ID for tracking this upload */
  id: string;
  /** Local file URI for preview */
  localUri: string;
  /** Upload progress (0-100) */
  progress: number;
  /** Current upload status */
  status: "uploading" | "processing" | "complete" | "error";
  /** Error message if upload failed */
  error?: string;
}

/**
 * Return type for the usePhotoUpload hook
 */
export interface UsePhotoUploadReturn {
  /**
   * Upload a single photo.
   * Handles the complete flow: upload to Storage → add to Firestore.
   *
   * @param localUri - Local file URI from image picker
   * @param options - Upload options (projectId, componentId, stage, caption)
   * @returns Promise resolving to the created MediaAsset
   * @throws Error if upload fails
   */
  uploadPhoto: (
    localUri: string,
    options: PhotoUploadOptions
  ) => Promise<MediaAsset>;

  /**
   * Upload multiple photos in parallel (with concurrency limit of 3).
   * Handles the complete flow for each photo.
   *
   * @param localUris - Array of local file URIs
   * @param options - Upload options (applied to all photos)
   * @returns Promise resolving to array of created MediaAssets (only successful ones)
   */
  uploadPhotos: (
    localUris: string[],
    options: PhotoUploadOptions
  ) => Promise<MediaAsset[]>;

  /**
   * Currently uploading photos (for progress UI).
   * Each photo tracks its own progress and status.
   */
  uploadingPhotos: UploadingPhoto[];

  /**
   * Cancel an in-progress upload.
   * Note: This only removes it from tracking; the upload may continue in background.
   *
   * @param uploadId - The temporary ID of the upload to cancel
   */
  cancelUpload: (uploadId: string) => void;

  /** Whether any uploads are currently in progress */
  isUploading: boolean;

  /** Overall error state (from the most recent operation) */
  error: Error | null;

  /** Clear the error state */
  clearError: () => void;
}

/**
 * Generate a UUID for MediaAsset IDs
 * Uses crypto.randomUUID() which is available in modern React Native/Expo
 */
function generateUUID(): string {
  // Use crypto.randomUUID() if available (React Native 0.70+, Expo SDK 49+)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older environments
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Detect media type from MIME type
 */
function getMediaTypeFromMimeType(mimeType: string): "image" | "video" {
  if (mimeType.startsWith("image/")) {
    return MEDIA_TYPES.IMAGE;
  }
  if (mimeType.startsWith("video/")) {
    return MEDIA_TYPES.VIDEO;
  }
  // Default to image for unknown types
  return MEDIA_TYPES.IMAGE;
}

/**
 * Get MIME type from filename extension
 * Simplified version for use in MediaAsset creation
 */
function getMimeTypeFromFilename(filename: string): string {
  const extension = filename.toLowerCase().split(".").pop() || "";
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
    mp4: "video/mp4",
    mov: "video/quicktime",
  };
  return mimeTypes[extension] || "image/jpeg";
}

/**
 * Hook for uploading photos to Firebase Storage and adding them to Firestore.
 *
 * Provides a complete photo upload workflow:
 * 1. Upload file to Firebase Storage with progress tracking
 * 2. Create MediaAsset object with download URL
 * 3. Add to Firestore via useMediaMutations (with optimistic updates)
 *
 * @returns Object containing upload functions and state
 *
 * @example
 * function PhotoUploader() {
 *   const { uploadPhoto, uploadingPhotos, isUploading } = usePhotoUpload();
 *
 *   const handlePickAndUpload = async () => {
 *     const result = await ImagePicker.pickImage();
 *     if (result.uri) {
 *       await uploadPhoto(result.uri, {
 *         projectId: "project-123",
 *         componentId: "component-456",
 *         stage: "after",
 *         caption: "Beautiful finished bathroom"
 *       });
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       <Button onPress={handlePickAndUpload} disabled={isUploading}>
 *         Upload Photo
 *       </Button>
 *       {uploadingPhotos.map(photo => (
 *         <ProgressBar key={photo.id} progress={photo.progress} />
 *       ))}
 *     </View>
 *   );
 * }
 */
export function usePhotoUpload(): UsePhotoUploadReturn {
  const { addMedia } = useMediaMutations();
  const [uploadingPhotos, setUploadingPhotos] = useState<UploadingPhoto[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const cleanupTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      cleanupTimersRef.current.forEach((timer) => clearTimeout(timer));
      cleanupTimersRef.current.clear();
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const removeUploadingPhoto = useCallback((uploadId: string) => {
    setUploadingPhotos((prev) => prev.filter((p) => p.id !== uploadId));
    // Clear cleanup timer if exists
    const timer = cleanupTimersRef.current.get(uploadId);
    if (timer) {
      clearTimeout(timer);
      cleanupTimersRef.current.delete(uploadId);
    }
  }, []);

  const updateUploadingPhoto = useCallback(
    (uploadId: string, updates: Partial<Omit<UploadingPhoto, "id">>) => {
      setUploadingPhotos((prev) =>
        prev.map((p) => (p.id === uploadId ? { ...p, ...updates } : p))
      );
    },
    []
  );

  const cancelUpload = useCallback(
    (uploadId: string) => {
      removeUploadingPhoto(uploadId);
    },
    [removeUploadingPhoto]
  );

  const uploadPhoto = useCallback(
    async (
      localUri: string,
      options: PhotoUploadOptions
    ): Promise<MediaAsset> => {
      const uploadId = generateUUID();

      try {
        setError(null);

        // 1. Add to uploadingPhotos state
        setUploadingPhotos((prev) => [
          ...prev,
          {
            id: uploadId,
            localUri,
            progress: 0,
            status: "uploading",
          },
        ]);

        // 2. Generate unique filename
        const originalFilename = localUri.split("/").pop() || "photo.jpg";
        const filename = generateFilename(originalFilename);

        // 3. Build storage path
        const storagePath = buildMediaPath(
          options.projectId,
          options.componentId,
          filename
        );

        // 4. Upload to Firebase Storage with progress tracking
        const uploadResult = await uploadPhotoToStorage(
          localUri,
          storagePath,
          (progress: UploadProgress) => {
            updateUploadingPhoto(uploadId, {
              progress: progress.percentage,
            });
          }
        );

        // 5. Update status to processing
        updateUploadingPhoto(uploadId, {
          status: "processing",
          progress: 100,
        });

        // 6. Create MediaAsset object
        const mimeType = getMimeTypeFromFilename(filename);
        const mediaType = getMediaTypeFromMimeType(mimeType);

        // Get current order (find max order in component's media + 1)
        // For now, use a simple increment based on timestamp
        const order = Date.now();

        const mediaAsset: MediaAsset = {
          id: generateUUID(),
          filename,
          url: uploadResult.downloadUrl,
          storagePath: uploadResult.storagePath,
          size: uploadResult.size,
          order,
          uploadedAt: new Date().toISOString(),
          mediaType,
          stage: options.stage,
          caption: options.caption,
        };

        // 7. Add to Firestore via useMediaMutations (handles optimistic updates)
        await addMedia(options.projectId, options.componentId, mediaAsset);

        // 8. Update status to complete
        updateUploadingPhoto(uploadId, {
          status: "complete",
        });

        // 9. Remove from uploadingPhotos after 2 seconds
        const cleanupTimer = setTimeout(() => {
          removeUploadingPhoto(uploadId);
        }, 2000);
        cleanupTimersRef.current.set(uploadId, cleanupTimer);

        return mediaAsset;
      } catch (e) {
        // Handle error
        const caughtError =
          e instanceof Error ? e : new Error("Unknown error occurred");
        setError(caughtError);

        updateUploadingPhoto(uploadId, {
          status: "error",
          error: caughtError.message,
        });

        // Remove error uploads after 5 seconds
        const cleanupTimer = setTimeout(() => {
          removeUploadingPhoto(uploadId);
        }, 5000);
        cleanupTimersRef.current.set(uploadId, cleanupTimer);

        throw caughtError;
      }
    },
    [addMedia, updateUploadingPhoto, removeUploadingPhoto]
  );

  const uploadPhotos = useCallback(
    async (
      localUris: string[],
      options: PhotoUploadOptions
    ): Promise<MediaAsset[]> => {
      setError(null);

      // Upload with concurrency limit of 3
      const concurrency = 3;
      const results: MediaAsset[] = [];
      const errors: Error[] = [];

      // Process uploads in batches
      for (let i = 0; i < localUris.length; i += concurrency) {
        const batch = localUris.slice(i, i + concurrency);
        const batchPromises = batch.map((uri) =>
          uploadPhoto(uri, options)
            .then((result) => {
              results.push(result);
              return result;
            })
            .catch((error) => {
              errors.push(error);
              return null;
            })
        );

        await Promise.all(batchPromises);
      }

      // Set overall error if any failed (but don't throw - return successful ones)
      if (errors.length > 0) {
        setError(
          new Error(
            `${errors.length} of ${localUris.length} uploads failed. See individual uploads for details.`
          )
        );
      }

      return results;
    },
    [uploadPhoto]
  );

  const isUploading = uploadingPhotos.some(
    (p) => p.status === "uploading" || p.status === "processing"
  );

  return {
    uploadPhoto,
    uploadPhotos,
    uploadingPhotos,
    cancelUpload,
    isUploading,
    error,
    clearError,
  };
}
