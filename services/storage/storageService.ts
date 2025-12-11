import { storage } from "@/core/config";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

/**
 * Upload progress information
 */
export interface UploadProgress {
  /** Bytes transferred so far */
  bytesTransferred: number;
  /** Total bytes to transfer */
  totalBytes: number;
  /** Progress percentage (0-100) */
  percentage: number;
}

/**
 * Result of a successful file upload
 */
export interface UploadResult {
  /** Public download URL from Firebase Storage */
  downloadUrl: string;
  /** Path in Firebase Storage (for potential deletion) */
  storagePath: string;
  /** Original filename */
  filename: string;
  /** File size in bytes */
  size: number;
  /** MIME type of the file */
  mimeType: string;
}

/**
 * Custom error class for storage operations
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "StorageError";
  }
}

/**
 * Convert a React Native file URI to a Blob
 *
 * Handles various URI formats:
 * - file:// (local files)
 * - ph:// (Photos library)
 * - content:// (Android content URIs)
 *
 * @param uri - File URI from image picker or file system
 * @returns Promise resolving to Blob
 * @throws StorageError if conversion fails
 */
async function uriToBlob(uri: string): Promise<Blob> {
  try {
    // Use fetch to convert URI to blob
    // This works for file://, ph://, content://, and http:// URIs
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    return await response.blob();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to convert URI to blob";
    throw new StorageError(
      `Error converting file URI to blob: ${errorMessage}`,
      "storage/uri-conversion-failed",
      error
    );
  }
}

/**
 * Get MIME type from filename or blob
 *
 * @param filename - File name with extension
 * @param blob - File blob (fallback)
 * @returns MIME type string
 */
function getMimeType(filename: string, blob?: Blob): string {
  // Try blob type first (more accurate)
  if (blob?.type) {
    return blob.type;
  }

  // Fallback to extension-based detection
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
    pdf: "application/pdf",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

/**
 * Sanitize filename by removing special characters
 *
 * @param filename - Original filename
 * @returns Sanitized filename
 */
function sanitizeFilename(filename: string): string {
  // Remove path separators and special characters
  // Keep alphanumeric, dots, hyphens, underscores
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Generate a unique filename for uploads
 *
 * Preserves original extension, adds timestamp for uniqueness.
 *
 * @param originalFilename - Original filename from picker
 * @returns Unique filename with timestamp prefix
 *
 * @example
 * generateFilename("photo.jpg") // "1704067200000_photo.jpg"
 */
export function generateFilename(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename);
  const timestamp = Date.now();
  const parts = sanitized.split(".");
  const extension = parts.length > 1 ? parts.pop() : "";
  const nameWithoutExt = parts.join(".");

  if (extension) {
    return `${timestamp}_${nameWithoutExt}.${extension}`;
  }
  return `${timestamp}_${sanitized}`;
}

/**
 * Build the storage path for a component's media
 *
 * @param projectId - Project ID
 * @param componentId - Component ID
 * @param filename - Filename (should be generated with generateFilename)
 * @returns Storage path string
 *
 * @example
 * buildMediaPath("project-123", "component-456", "1704067200000_photo.jpg")
 * // "projects/project-123/components/component-456/1704067200000_photo.jpg"
 */
export function buildMediaPath(
  projectId: string,
  componentId: string,
  filename: string
): string {
  // Sanitize IDs to prevent path injection
  const safeProjectId = projectId.replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeComponentId = componentId.replace(/[^a-zA-Z0-9._-]/g, "_");
  const safeFilename = sanitizeFilename(filename);

  return `projects/${safeProjectId}/components/${safeComponentId}/${safeFilename}`;
}

/**
 * Upload a photo to Firebase Storage
 *
 * Handles React Native file URIs (file://, ph://, content://) and provides
 * progress tracking during upload.
 *
 * @param uri - Local file URI (from image picker or file system)
 * @param path - Storage path (use buildMediaPath to generate)
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to upload result with download URL
 * @throws StorageError if upload fails
 *
 * @example
 * const path = buildMediaPath("project-123", "component-456", generateFilename("photo.jpg"));
 * const result = await uploadPhoto("file:///path/to/photo.jpg", path, (progress) => {
 *   console.log(`Upload: ${progress.percentage}%`);
 * });
 */
export async function uploadPhoto(
  uri: string,
  path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Convert URI to blob
    const blob = await uriToBlob(uri);
    const size = blob.size;

    if (size === 0) {
      throw new StorageError("File is empty", "storage/empty-file");
    }

    // Get MIME type
    const filename = path.split("/").pop() || "unknown";
    const mimeType = getMimeType(filename, blob);

    // Create storage reference
    const storageRef = ref(storage, path);

    // Upload with progress tracking
    return new Promise<UploadResult>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: mimeType,
      });

      // Track upload progress
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage:
              snapshot.totalBytes > 0
                ? Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                  )
                : 0,
          };

          // Call progress callback if provided
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          // Handle upload error
          const errorCode = (error as any)?.code || "storage/unknown-error";
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Upload failed with unknown error";

          // Map Firebase error codes to user-friendly messages
          let message = errorMessage;
          switch (errorCode) {
            case "storage/unauthorized":
              message = "Permission denied. Check Firebase Storage rules.";
              break;
            case "storage/quota-exceeded":
              message = "Storage quota exceeded. Please contact support.";
              break;
            case "storage/canceled":
              message = "Upload was canceled.";
              break;
            case "storage/unknown":
              message = "Unknown error occurred during upload.";
              break;
          }

          reject(
            new StorageError(
              `Failed to upload file: ${message}`,
              errorCode,
              error
            )
          );
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              downloadUrl,
              storagePath: path,
              filename,
              size,
              mimeType,
            });
          } catch (error) {
            reject(
              new StorageError(
                "Upload succeeded but failed to get download URL",
                "storage/download-url-failed",
                error
              )
            );
          }
        }
      );
    });
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new StorageError(
      `Failed to upload photo: ${errorMessage}`,
      "storage/upload-failed",
      error
    );
  }
}

/**
 * Delete a file from Firebase Storage
 *
 * @param storagePath - The storage path returned from uploadPhoto
 * @throws StorageError if deletion fails
 *
 * @example
 * await deleteFile("projects/project-123/components/component-456/photo.jpg");
 */
export async function deleteFile(storagePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    const errorCode = (error as any)?.code || "storage/unknown-error";
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete file";

    // Map Firebase error codes
    let message = errorMessage;
    switch (errorCode) {
      case "storage/object-not-found":
        message = "File not found in storage";
        break;
      case "storage/unauthorized":
        message = "Permission denied. Check Firebase Storage rules.";
        break;
      case "storage/unknown":
        message = "Unknown error occurred during deletion.";
        break;
    }

    throw new StorageError(
      `Failed to delete file: ${message}`,
      errorCode,
      error
    );
  }
}
