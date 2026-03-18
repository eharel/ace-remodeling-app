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
  /** Callback when media is successfully uploaded */
  onUploadSuccess?: (count: number) => void;
}

interface UseMediaActionsResult {
  /** Whether an operation is in progress */
  isLoading: boolean;
  /** Current operation type for more specific loading states */
  loadingOperation: "add" | "delete" | "thumbnail" | "reorder" | null;
  /** Error message if last operation failed */
  error: string | null;
  /** Add photos/videos - shows action sheet to choose source */
  addPhotos: () => Promise<void>;
  /** Delete selected media */
  deletePhotos: (photoIds: string[]) => Promise<void>;
  /** Set a photo as the component thumbnail */
  setThumbnail: (photoId: string) => Promise<void>;
  /** Reorder media after drag-and-drop */
  reorderPhotos: (reorderedPhotos: MediaAsset[]) => Promise<void>;
}

/** A file prepared for upload, including its resolved media type */
type UploadFile = {
  uri: string;
  filename: string;
  mediaType: "image" | "video";
};

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
 * Determine media type from MIME type or file extension
 */
function resolveMediaType(
  mimeType?: string,
  filename?: string
): "image" | "video" | null {
  if (mimeType?.startsWith("image/")) return "image";
  if (mimeType?.startsWith("video/")) return "video";
  if (filename) {
    const ext = filename.toLowerCase().split(".").pop() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"].includes(ext))
      return "image";
    if (["mp4", "mov", "m4v", "avi", "mkv"].includes(ext)) return "video";
  }
  return null;
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
   * Upload files and update the component.
   * Files may be a mix of images and videos — they're grouped by type and
   * uploaded in separate batches so each gets the correct mediaType in Firestore.
   */
  const uploadFiles = useCallback(
    async (files: UploadFile[], stageOverride?: MediaStage) => {
      if (files.length === 0) return;

      setLoadingOperation("add");
      setIsLoading(true);

      try {
        const currentMedia = component?.media || [];
        const maxOrder = currentMedia.reduce(
          (max, m) => Math.max(max, m.order),
          -1
        );

        // Group files by media type and upload each group separately
        const imageFiles = files.filter((f) => f.mediaType === "image");
        const videoFiles = files.filter((f) => f.mediaType === "video");

        const baseOptions: Omit<UploadMediaOptions, "mediaType" | "order"> = {
          projectId,
          componentCategory: component?.category || "unknown",
          subcategory: component?.subcategory,
          stage: stageOverride ?? getUploadStage(currentCategory),
        };

        const allResults = await Promise.all([
          imageFiles.length > 0
            ? uploadMultipleMedia(imageFiles, {
                ...baseOptions,
                mediaType: MEDIA_TYPES.IMAGE,
                order: maxOrder + 1,
              })
            : [],
          videoFiles.length > 0
            ? uploadMultipleMedia(videoFiles, {
                ...baseOptions,
                mediaType: MEDIA_TYPES.VIDEO,
                order: maxOrder + 1 + imageFiles.length,
              })
            : [],
        ]);

        const results = allResults.flat();
        const successfulAssets = results
          .filter((r) => r.success && r.asset)
          .map((r) => r.asset as MediaAsset);

        const failedCount = results.filter((r) => !r.success).length;

        if (failedCount > 0) {
          const message =
            failedCount === results.length
              ? "Failed to upload media. Please try again."
              : `${failedCount} of ${results.length} files failed to upload.`;
          setError(message);
        }

        if (successfulAssets.length > 0) {
          const updatedMedia = [...currentMedia, ...successfulAssets];
          await updateComponent(projectId, componentId, {
            media: updatedMedia,
          });
          onUploadSuccess?.(successfulAssets.length);
        }

        if (failedCount > 0 && successfulAssets.length > 0) {
          Alert.alert(
            "Partial Success",
            `${successfulAssets.length} file(s) added. ${failedCount} failed to upload.`
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add media";
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
   * Pick photos and videos from the device photo library
   */
  const pickFromPhotoLibrary = useCallback(
    async (stageOverride?: MediaStage) => {
      try {
        setError(null);

        const permissionResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
          Alert.alert(
            "Permission Required",
            "Please allow access to your photo library to add media."
          );
          return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images", "videos"],
          allowsMultipleSelection: true,
          quality: 0.8,
          exif: false,
        });

        if (pickerResult.canceled || pickerResult.assets.length === 0) {
          return;
        }

        const files: UploadFile[] = pickerResult.assets.map((asset) => ({
          uri: asset.uri,
          filename: asset.fileName || getFilenameFromUri(asset.uri),
          mediaType: asset.type === "video" ? "video" : "image",
        }));

        await uploadFiles(files, stageOverride);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to pick media";
        setError(message);
        Alert.alert("Error", message);
      }
    },
    [uploadFiles]
  );

  /**
   * Pick photos and videos from the Files app (Google Drive, Downloads, etc.)
   */
  const pickFromFiles = useCallback(
    async (stageOverride?: MediaStage) => {
      try {
        setError(null);

        const result = await DocumentPicker.getDocumentAsync({
          type: ["image/*", "video/*"],
          multiple: true,
          copyToCacheDirectory: true,
        });

        if (result.canceled || !result.assets || result.assets.length === 0) {
          return;
        }

        const files: UploadFile[] = result.assets
          .map((asset) => {
            const mediaType = resolveMediaType(asset.mimeType, asset.name);
            if (!mediaType) return null;
            return {
              uri: asset.uri,
              filename: asset.name || getFilenameFromUri(asset.uri),
              mediaType,
            };
          })
          .filter((f): f is UploadFile => f !== null);

        if (files.length === 0) {
          Alert.alert(
            "No Media Selected",
            "Please select image or video files."
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
    },
    [uploadFiles]
  );

  /**
   * Show the source picker (Photo Library / Files).
   */
  const showSourcePicker = useCallback(
    (stageOverride?: MediaStage) => {
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancel", "Photo Library", "Files"],
            cancelButtonIndex: 0,
            title: "Add Media From",
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
        Alert.alert("Add Media From", undefined, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Photo Library",
            onPress: () => pickFromPhotoLibrary(stageOverride),
          },
          { text: "Files", onPress: () => pickFromFiles(stageOverride) },
        ]);
      }
    },
    [pickFromPhotoLibrary, pickFromFiles]
  );

  /**
   * Add media - shows action sheet to choose source.
   *
   * When viewing "all" photos, first asks which phase the media belongs to,
   * then proceeds to the source picker.
   * When viewing a specific phase tab, goes straight to the source picker.
   */
  const addPhotos = useCallback(async () => {
    if (currentCategory === "all") {
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Cancel", "Before", "In Progress", "After"],
            cancelButtonIndex: 0,
            title: "Add media to which phase?",
          },
          (buttonIndex) => {
            const stageMap: Partial<Record<number, MediaStage>> = {
              1: MEDIA_STAGES.BEFORE,
              2: MEDIA_STAGES.IN_PROGRESS,
              3: MEDIA_STAGES.AFTER,
            };
            const stage = stageMap[buttonIndex];
            if (stage) {
              showSourcePicker(stage);
            }
          }
        );
      } else {
        Alert.alert("Add media to which phase?", undefined, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Before",
            onPress: () => showSourcePicker(MEDIA_STAGES.BEFORE),
          },
          {
            text: "In Progress",
            onPress: () => showSourcePicker(MEDIA_STAGES.IN_PROGRESS),
          },
          {
            text: "After",
            onPress: () => showSourcePicker(MEDIA_STAGES.AFTER),
          },
        ]);
      }
      return;
    }

    showSourcePicker();
  }, [currentCategory, showSourcePicker]);

  /**
   * Delete selected media
   */
  const deletePhotos = useCallback(
    async (photoIds: string[]) => {
      if (photoIds.length === 0) return;

      try {
        setError(null);
        setLoadingOperation("delete");
        setIsLoading(true);

        const currentMedia = component?.media || [];
        const photosToDelete = currentMedia.filter((m) =>
          photoIds.includes(m.id)
        );
        const storagePaths = photosToDelete.map((p) => p.storagePath);

        const deleteResult = await deleteMultipleMedia(storagePaths);

        if (!deleteResult.success) {
          console.warn("Some files failed to delete:", deleteResult.errors);
        }

        const updatedMedia = currentMedia.filter(
          (m) => !photoIds.includes(m.id)
        );
        await updateComponent(projectId, componentId, {
          media: updatedMedia,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete media";
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
   */
  const setThumbnail = useCallback(
    async (photoId: string) => {
      try {
        setError(null);
        setLoadingOperation("thumbnail");
        setIsLoading(true);

        const currentMedia = component?.media || [];
        const photo = currentMedia.find((m) => m.id === photoId);
        if (!photo) {
          throw new Error("Photo not found");
        }

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
   * Reorder media after drag-and-drop
   */
  const reorderPhotos = useCallback(
    async (reorderedPhotos: MediaAsset[]) => {
      try {
        setError(null);
        const updatedMedia = reorderedPhotos.map((photo, index) => ({
          ...photo,
          order: index,
        }));
        await updateComponent(projectId, componentId, {
          media: updatedMedia,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to reorder media";
        setError(message);
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
