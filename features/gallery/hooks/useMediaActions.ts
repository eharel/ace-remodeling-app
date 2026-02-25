/**
 * useMediaActions Hook
 *
 * Provides media CRUD operations (add, delete, set thumbnail) for a project component.
 * Uses the media service for Firebase Storage operations and ProjectsContext for
 * state updates with optimistic UI patterns.
 *
 * @module features/gallery/hooks/useMediaActions
 */

import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ActionSheetIOS, Alert, Platform } from "react-native";

import { useProjects } from "@/shared/contexts";
import {
  uploadMultipleMedia,
  deleteMultipleMedia,
  UploadMediaOptions,
} from "@/services/media";
import type { MediaAsset, MediaStage, ProjectComponent } from "@/shared/types";
import { MEDIA_STAGES, MEDIA_TYPES } from "@/shared/types";
import type { PhotoCategory } from "@/shared/constants";
import { PHOTO_CATEGORY_TO_STAGE } from "@/shared/constants";

interface UseMediaActionsParams {
  projectId: string;
  componentId: string;
  component?: ProjectComponent;
  currentCategory: PhotoCategory;
  /** Callback when photos are successfully uploaded */
  onUploadSuccess?: (count: number) => void;
}

interface UseMediaActionsResult {
  /** Whether an operation is in progress */
  isLoading: boolean;
  /** Current operation type for more specific loading states */
  loadingOperation: "add" | "delete" | "thumbnail" | "reorder" | null;
  /** Error message if last operation failed */
  error: string | null;
  /** Add photos - shows action sheet to choose source */
  addPhotos: () => Promise<void>;
  /** Delete selected photos */
  deletePhotos: (photoIds: string[]) => Promise<void>;
  /** Set a photo as the component thumbnail */
  setThumbnail: (photoId: string) => Promise<void>;
  /** Reorder photos after drag-and-drop */
  reorderPhotos: (reorderedPhotos: MediaAsset[]) => Promise<void>;
}

/**
 * Convert PhotoCategory to MediaStage for new uploads.
 * Should not be called with "all" — callers must resolve the stage first.
 */
function getUploadStage(category: PhotoCategory): MediaStage {
  const stage = PHOTO_CATEGORY_TO_STAGE[category];
  return (stage as MediaStage) || MEDIA_STAGES.OTHER;
}

/**
 * Extract filename from URI
 */
function getFilenameFromUri(uri: string): string {
  const parts = uri.split("/");
  const filename = parts[parts.length - 1];
  // Add timestamp to ensure uniqueness
  const ext = filename.split(".").pop() || "jpg";
  const nameWithoutExt = filename.replace(`.${ext}`, "");
  return `${nameWithoutExt}_${Date.now()}.${ext}`;
}

/**
 * Check if a file is an image based on MIME type or extension
 */
function isImageFile(mimeType?: string, filename?: string): boolean {
  if (mimeType?.startsWith("image/")) {
    return true;
  }
  if (filename) {
    const ext = filename.toLowerCase().split(".").pop();
    return ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"].includes(
      ext || ""
    );
  }
  return false;
}

export function useMediaActions({
  projectId,
  componentId,
  component,
  currentCategory,
  onUploadSuccess,
}: UseMediaActionsParams): UseMediaActionsResult {
  const { updateComponent } = useProjects();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperation, setLoadingOperation] = useState<
    "add" | "delete" | "thumbnail" | "reorder" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload files and update the component
   * Shared logic for both photo library and document picker.
   *
   * @param stageOverride - When provided (e.g. chosen from the stage picker on the
   *   "all" tab), use this stage instead of deriving it from currentCategory.
   */
  const uploadFiles = useCallback(
    async (
      files: Array<{ uri: string; filename: string }>,
      stageOverride?: MediaStage
    ) => {
      if (files.length === 0) return;

      setLoadingOperation("add");
      setIsLoading(true);

      try {
        // Get current media to determine order for new items
        const currentMedia = component?.media || [];
        const maxOrder = currentMedia.reduce(
          (max, m) => Math.max(max, m.order),
          -1
        );

        // Upload options
        const uploadOptions: UploadMediaOptions = {
          projectId,
          componentCategory: component?.category || "unknown",
          subcategory: component?.subcategory,
          stage: stageOverride ?? getUploadStage(currentCategory),
          mediaType: MEDIA_TYPES.IMAGE,
          order: maxOrder + 1,
        };

        // Upload files to Firebase Storage
        const results = await uploadMultipleMedia(files, uploadOptions);

        // Check for errors
        const successfulAssets = results
          .filter((r) => r.success && r.asset)
          .map((r) => r.asset as MediaAsset);

        const failedCount = results.filter((r) => !r.success).length;

        if (failedCount > 0) {
          const message =
            failedCount === results.length
              ? "Failed to upload photos. Please try again."
              : `${failedCount} of ${results.length} photos failed to upload.`;
          setError(message);
        }

        if (successfulAssets.length > 0) {
          // Update component with new media
          const updatedMedia = [...currentMedia, ...successfulAssets];
          await updateComponent(projectId, componentId, {
            media: updatedMedia,
          });

          // Call success callback if provided
          onUploadSuccess?.(successfulAssets.length);
        }

        if (failedCount > 0 && successfulAssets.length > 0) {
          Alert.alert(
            "Partial Success",
            `${successfulAssets.length} photos added. ${failedCount} failed to upload.`
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add photos";
        setError(message);
        Alert.alert("Error", message);
      } finally {
        setIsLoading(false);
        setLoadingOperation(null);
      }
    },
    [projectId, componentId, component, currentCategory, updateComponent, onUploadSuccess]
  );

  /**
   * Pick photos from the device photo library
   */
  const pickFromPhotoLibrary = useCallback(async (stageOverride?: MediaStage) => {
    try {
      setError(null);

      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to add photos."
        );
        return;
      }

      // Launch image picker
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        exif: false,
      });

      if (pickerResult.canceled || pickerResult.assets.length === 0) {
        return;
      }

      // Prepare files for upload
      const files = pickerResult.assets.map((asset) => ({
        uri: asset.uri,
        filename: asset.fileName || getFilenameFromUri(asset.uri),
      }));

      await uploadFiles(files, stageOverride);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to pick photos";
      setError(message);
      Alert.alert("Error", message);
    }
  }, [uploadFiles]);

  /**
   * Pick photos from the Files app (for Google Drive, Downloads, etc.)
   */
  const pickFromFiles = useCallback(async (stageOverride?: MediaStage) => {
    try {
      setError(null);

      // Launch document picker for images
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        multiple: true,
        copyToCacheDirectory: true, // Ensures we have access to the file
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      // Filter to only image files and prepare for upload
      const files = result.assets
        .filter((asset) => isImageFile(asset.mimeType, asset.name))
        .map((asset) => ({
          uri: asset.uri,
          filename: asset.name || getFilenameFromUri(asset.uri),
        }));

      if (files.length === 0) {
        Alert.alert(
          "No Images Selected",
          "Please select image files (JPG, PNG, etc.)"
        );
        return;
      }

      await uploadFiles(files, stageOverride);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to pick files";
      setError(message);
      Alert.alert("Error", message);
    }
  }, [uploadFiles]);

  /**
   * Show the source picker (Photo Library / Files).
   * Extracted so it can be called either directly (specific-category tabs)
   * or after the stage picker resolves (all-photos tab).
   */
  const showSourcePicker = useCallback(
    (stageOverride?: MediaStage) => {
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancel", "Photo Library", "Files"],
            cancelButtonIndex: 0,
            title: "Add Photos From",
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              pickFromPhotoLibrary(stageOverride);
            } else if (buttonIndex === 2) {
              pickFromFiles(stageOverride);
            }
          }
        );
      } else {
        Alert.alert("Add Photos From", undefined, [
          { text: "Cancel", style: "cancel" },
          { text: "Photo Library", onPress: () => pickFromPhotoLibrary(stageOverride) },
          { text: "Files", onPress: () => pickFromFiles(stageOverride) },
        ]);
      }
    },
    [pickFromPhotoLibrary, pickFromFiles]
  );

  /**
   * Add photos - shows action sheet to choose source.
   *
   * When viewing "all" photos, first asks which phase (Before / In Progress /
   * After) the photos belong to, then proceeds to the source picker.
   * When viewing a specific phase tab, goes straight to the source picker.
   */
  const addPhotos = useCallback(async () => {
    if (currentCategory === "all") {
      // Step 1: pick a phase
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancel", "Before", "In Progress", "After"],
            cancelButtonIndex: 0,
            title: "Add photos to which phase?",
          },
          (buttonIndex) => {
            const stageMap: Partial<Record<number, MediaStage>> = {
              1: MEDIA_STAGES.BEFORE,
              2: MEDIA_STAGES.IN_PROGRESS,
              3: MEDIA_STAGES.AFTER,
            };
            const stage = stageMap[buttonIndex];
            if (stage) {
              // Step 2: pick source with chosen stage
              showSourcePicker(stage);
            }
          }
        );
      } else {
        Alert.alert("Add photos to which phase?", undefined, [
          { text: "Cancel", style: "cancel" },
          { text: "Before", onPress: () => showSourcePicker(MEDIA_STAGES.BEFORE) },
          { text: "In Progress", onPress: () => showSourcePicker(MEDIA_STAGES.IN_PROGRESS) },
          { text: "After", onPress: () => showSourcePicker(MEDIA_STAGES.AFTER) },
        ]);
      }
      return;
    }

    // Specific phase tab: go straight to source picker
    showSourcePicker();
  }, [currentCategory, showSourcePicker]);

  /**
   * Delete selected photos
   *
   * Removes photos from Firebase Storage and updates the component's media array.
   */
  const deletePhotos = useCallback(
    async (photoIds: string[]) => {
      if (photoIds.length === 0) return;

      try {
        setError(null);
        setLoadingOperation("delete");
        setIsLoading(true);

        const currentMedia = component?.media || [];

        // Find the photos to delete
        const photosToDelete = currentMedia.filter((m) =>
          photoIds.includes(m.id)
        );
        const storagePaths = photosToDelete.map((p) => p.storagePath);

        // Delete from Firebase Storage
        const deleteResult = await deleteMultipleMedia(storagePaths);

        if (!deleteResult.success) {
          console.warn("Some files failed to delete:", deleteResult.errors);
          // Continue anyway - we'll remove from the array even if storage delete fails
        }

        // Update component with remaining media
        const updatedMedia = currentMedia.filter(
          (m) => !photoIds.includes(m.id)
        );
        await updateComponent(projectId, componentId, {
          media: updatedMedia,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete photos";
        setError(message);
        Alert.alert("Error", message);
      } finally {
        setIsLoading(false);
        setLoadingOperation(null);
      }
    },
    [projectId, componentId, component, updateComponent]
  );

  /**
   * Set a photo as the component thumbnail
   *
   * Updates the component's thumbnail field with the selected photo's URL.
   */
  const setThumbnail = useCallback(
    async (photoId: string) => {
      try {
        setError(null);
        setLoadingOperation("thumbnail");
        setIsLoading(true);

        const currentMedia = component?.media || [];

        // Find the photo
        const photo = currentMedia.find((m) => m.id === photoId);
        if (!photo) {
          throw new Error("Photo not found");
        }

        // Update component thumbnail
        await updateComponent(projectId, componentId, {
          thumbnail: photo.url,
        });

        Alert.alert("Success", "Thumbnail updated successfully");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to set thumbnail";
        setError(message);
        Alert.alert("Error", message);
      } finally {
        setIsLoading(false);
        setLoadingOperation(null);
      }
    },
    [projectId, componentId, component, updateComponent]
  );

  /**
   * Reorder photos after drag-and-drop
   *
   * Updates the order field on each MediaAsset to reflect the new order.
   */
  const reorderPhotos = useCallback(
    async (reorderedPhotos: MediaAsset[]) => {
      try {
        setError(null);
        // Don't show loading state for reorder - it should feel instant
        // The optimistic update handles UI, we just persist in background

        // Update order field for each photo based on new position
        const updatedMedia = reorderedPhotos.map((photo, index) => ({
          ...photo,
          order: index,
        }));

        // Update component with reordered media
        await updateComponent(projectId, componentId, {
          media: updatedMedia,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to reorder photos";
        setError(message);
        // Don't show alert for reorder failures - too disruptive
        console.error("[useMediaActions] Reorder failed:", message);
      }
    },
    [projectId, componentId, updateComponent]
  );

  return {
    isLoading,
    loadingOperation,
    error,
    addPhotos,
    deletePhotos,
    setThumbnail,
    reorderPhotos,
  };
}
