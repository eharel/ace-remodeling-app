/**
 * Media Service
 *
 * Handles uploading and deleting media files in Firebase Storage,
 * and creating/updating MediaAsset records for use in the app.
 *
 * @module services/media/mediaService
 */

import { nanoid } from "nanoid/non-secure";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "@/shared/config";
import { MediaAsset, MediaStage, MediaType } from "@/shared/types";

/**
 * Options for uploading media
 */
export interface UploadMediaOptions {
  /** Project ID for storage path */
  projectId: string;
  /** Component category for storage path */
  componentCategory: string;
  /** Optional subcategory */
  subcategory?: string;
  /** Media stage (before, after, in-progress, etc.) */
  stage: MediaStage;
  /** Media type (image or video) */
  mediaType: MediaType;
  /** Optional description/caption */
  caption?: string;
  /** Order in the media list */
  order?: number;
}

/**
 * Result of a media upload operation
 */
export interface UploadMediaResult {
  success: boolean;
  asset?: MediaAsset;
  error?: string;
}

/**
 * Get MIME type for file extension
 */
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();

  const mimeTypes: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    // Videos
    mp4: "video/mp4",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    m4v: "video/x-m4v",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}

/**
 * Build storage path for a media file
 *
 * Path format: projects/{projectId}/{category}/{subcategory?}/photos|videos/{stage}/{filename}
 */
function buildStoragePath(
  filename: string,
  options: UploadMediaOptions
): string {
  const { projectId, componentCategory, subcategory, stage, mediaType } =
    options;

  let basePath = `projects/${projectId}/${componentCategory}`;

  if (subcategory) {
    basePath += `/${subcategory}`;
  }

  const typeFolder = mediaType === "image" ? "photos" : "videos";
  basePath += `/${typeFolder}/${stage}`;

  return `${basePath}/${filename}`;
}

/**
 * Upload a media file to Firebase Storage and create a MediaAsset
 *
 * @param fileUri - Local file URI (from device gallery)
 * @param filename - Original filename
 * @param options - Upload options including project/component info and stage
 * @returns Promise<UploadMediaResult>
 */
export async function uploadMedia(
  fileUri: string,
  filename: string,
  options: UploadMediaOptions
): Promise<UploadMediaResult> {
  try {
    // Generate unique ID for this asset
    const id = nanoid(12);
    const storagePath = buildStoragePath(filename, options);

    // Fetch the file as a blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Upload the file
    await uploadBytes(storageRef, blob, {
      contentType: getContentType(filename),
    });

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Create MediaAsset
    const asset: MediaAsset = {
      id,
      filename,
      url: downloadURL,
      storagePath,
      mediaType: options.mediaType,
      stage: options.stage,
      caption: options.caption,
      order: options.order ?? 0,
      uploadedAt: new Date().toISOString(),
    };

    return { success: true, asset };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Upload failed";
    return { success: false, error: errorMessage };
  }
}

/**
 * Upload multiple media files
 *
 * @param files - Array of file URIs and filenames
 * @param options - Upload options (same for all files, order will be incremented)
 * @returns Promise<UploadMediaResult[]>
 */
export async function uploadMultipleMedia(
  files: Array<{ uri: string; filename: string }>,
  options: UploadMediaOptions
): Promise<UploadMediaResult[]> {
  const results: UploadMediaResult[] = [];
  const baseOrder = options.order ?? 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadMedia(file.uri, file.filename, {
      ...options,
      order: baseOrder + i,
    });
    results.push(result);
  }

  return results;
}

/**
 * Delete a media file from Firebase Storage
 *
 * @param storagePath - The storage path of the file to delete
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function deleteMedia(
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    // If file doesn't exist, consider it a success (idempotent delete)
    if ((error as any)?.code === "storage/object-not-found") {
      return { success: true };
    }
    const errorMessage =
      error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete multiple media files from Firebase Storage
 *
 * @param storagePaths - Array of storage paths to delete
 * @returns Promise<{ success: boolean; errors: string[] }>
 */
export async function deleteMultipleMedia(
  storagePaths: string[]
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  await Promise.all(
    storagePaths.map(async (path) => {
      const result = await deleteMedia(path);
      if (!result.success && result.error) {
        errors.push(`${path}: ${result.error}`);
      }
    })
  );

  return {
    success: errors.length === 0,
    errors,
  };
}
