/**
 * Firebase Storage Uploader
 *
 * Handles uploading files to Firebase Storage with progress tracking,
 * error handling, and resumability.
 *
 * @module scripts/lib/firebase/storage
 */

import * as fs from "fs/promises";
import * as path from "path";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "./client";
import { ProgressTracker } from "../utils/progressTracker";
import {
  ComponentFiles,
  DiscoveredAsset,
  DiscoveredMedia,
} from "../filesystem/types";
import { getFileSize } from "../utils/fileUtils";

/**
 * Upload options
 */
export interface UploadOptions {
  /** Preview mode - don't actually upload */
  dryRun?: boolean;

  /** Number of retry attempts for failed uploads */
  retries?: number;

  /** Skip files that already exist in Storage */
  skipExisting?: boolean;

  /** Maximum concurrent uploads */
  concurrency?: number;
}

/**
 * Result of uploading a single file
 */
export interface UploadResult {
  /** Whether upload succeeded */
  success: boolean;
  /** Local file path */
  localPath: string;
  /** Storage path in Firebase */
  storagePath: string;
  /** Download URL (if successful) */
  downloadURL?: string;
  /** File size in bytes */
  size: number;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Result of uploading all files for a component
 */
export interface ComponentUploadResult {
  /** Project number */
  projectNumber: string;
  /** Component category */
  category: string;
  /** Optional subcategory */
  subcategory?: string;

  /** Results for media files */
  mediaResults: UploadResult[];
  /** Results for asset files */
  assetResults: UploadResult[];

  /** Total files attempted */
  totalFiles: number;
  /** Number of successful uploads */
  successCount: number;
  /** Number of failed uploads */
  failureCount: number;
  /** Number of skipped files */
  skippedCount: number;
  /** Total bytes uploaded */
  totalBytes: number;
}

/**
 * Complete upload summary
 */
export interface UploadSummary {
  /** Whether all uploads succeeded */
  success: boolean;
  /** Results for each component */
  components: ComponentUploadResult[];

  /** Total files attempted */
  totalFiles: number;
  /** Total successful uploads */
  successCount: number;
  /** Total failed uploads */
  failureCount: number;
  /** Total skipped files */
  skippedCount: number;
  /** Total bytes uploaded */
  totalBytes: number;

  /** Total upload time in milliseconds */
  uploadTime: number;
  /** All errors encountered */
  errors: UploadError[];
}

/**
 * Upload error information
 */
export interface UploadError {
  /** Local file path */
  localPath: string;
  /** Storage path */
  storagePath: string;
  /** Error message */
  error: string;
}

/**
 * Build Firebase Storage path for a file
 *
 * Constructs path preserving folder structure:
 * projects/{number}/{category}/{subcategory?}/{type}/{stage|category}/{filename}
 *
 * @param componentFiles - Component containing the file
 * @param file - Discovered media or asset file
 * @returns Storage path string
 */
function buildStoragePath(
  componentFiles: ComponentFiles,
  file: DiscoveredMedia | DiscoveredAsset
): string {
  const { projectNumber, category, subcategory } = componentFiles;

  // Base: projects/{number}/{category}
  let basePath = `projects/${projectNumber}/${category}`;

  // Add subcategory if present
  if (subcategory) {
    basePath += `/${subcategory}`;
  }

  // Add type folder and stage/category
  if ("mediaType" in file) {
    // Media file (photo or video)
    const mediaFile = file as DiscoveredMedia;
    basePath += mediaFile.mediaType === "image" ? "/photos" : "/videos";
    basePath += `/${mediaFile.stage}`; // before, after, in-progress, etc.
  } else {
    // Asset file
    const assetFile = file as DiscoveredAsset;
    basePath += "/assets";
    basePath += `/${assetFile.category}`; // plans, materials, etc.
  }

  // Add filename
  return `${basePath}/${file.filename}`;
}

/**
 * Check if file exists in Firebase Storage
 *
 * @param storagePath - Storage path to check
 * @returns True if file exists
 */
async function fileExistsInStorage(storagePath: string): Promise<boolean> {
  try {
    const storageRef = ref(storage, storagePath);
    await getDownloadURL(storageRef);
    return true;
  } catch (error: any) {
    // File doesn't exist if we can't get download URL
    if (error?.code === "storage/object-not-found") {
      return false;
    }
    // Other errors (permissions, etc.) - assume doesn't exist
    return false;
  }
}

/**
 * Upload a single file to Firebase Storage
 *
 * Handles retries, dry-run mode, and existing file checks.
 *
 * @param localPath - Absolute path to local file
 * @param storagePath - Path in Firebase Storage
 * @param options - Upload options
 * @returns Promise<UploadResult>
 */
export async function uploadFile(
  localPath: string,
  storagePath: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    dryRun = false,
    retries = 3,
    skipExisting = true,
  } = options;

  // Get file size
  const size = await getFileSize(localPath);
  if (size === 0) {
    return {
      success: false,
      localPath,
      storagePath,
      size: 0,
      error: "File not found or empty",
    };
  }

  // Dry run - don't actually upload
  if (dryRun) {
    return {
      success: true,
      localPath,
      storagePath,
      downloadURL: "[DRY RUN]",
      size,
    };
  }

  // Check if file exists (if skipExisting)
  if (skipExisting) {
    const exists = await fileExistsInStorage(storagePath);
    if (exists) {
      try {
        const storageRef = ref(storage, storagePath);
        const downloadURL = await getDownloadURL(storageRef);
        return {
          success: true,
          localPath,
          storagePath,
          downloadURL,
          size,
        };
      } catch (error) {
        // If we can't get URL, continue with upload
      }
    }
  }

  // Upload with retries
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Read file
      const fileBuffer = await fs.readFile(localPath);

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Upload file
      await uploadBytes(storageRef, fileBuffer, {
        contentType: getContentType(localPath),
      });

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      return {
        success: true,
        localPath,
        storagePath,
        downloadURL,
        size: fileBuffer.length,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check for fatal errors (permissions, quota, etc.)
      const errorCode = (error as any)?.code;
      if (
        errorCode === "storage/unauthorized" ||
        errorCode === "storage/quota-exceeded"
      ) {
        // Fatal error - don't retry
        return {
          success: false,
          localPath,
          storagePath,
          size,
          error: `Fatal error: ${lastError.message}`,
        };
      }

      // Retry after delay (exponential backoff)
      if (attempt < retries) {
        const delay = 1000 * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  return {
    success: false,
    localPath,
    storagePath,
    size,
    error: lastError?.message || "Upload failed after retries",
  };
}

/**
 * Get MIME type for file extension
 *
 * @param filepath - File path
 * @returns MIME type string
 */
function getContentType(filepath: string): string {
  const ext = filepath.toLowerCase().split(".").pop();

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
    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // CAD
    dwg: "application/acad",
    dxf: "application/dxf",
    skp: "application/vnd.sketchup.skp",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}

/**
 * Upload files with concurrency limit
 *
 * Processes files in batches to avoid overwhelming Firebase Storage.
 *
 * @param items - Items to upload
 * @param uploadFn - Upload function to call for each item
 * @param concurrency - Maximum concurrent uploads
 * @returns Array of upload results
 */
async function uploadWithConcurrency<T>(
  items: T[],
  uploadFn: (item: T) => Promise<UploadResult>,
  concurrency: number = 5
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(uploadFn));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Upload all files for a component
 *
 * Uploads both media and asset files for a single component.
 *
 * @param componentFiles - Files discovered by scanner
 * @param options - Upload options
 * @param progressTracker - Optional progress tracker
 * @returns Promise<ComponentUploadResult>
 */
export async function uploadComponentFiles(
  componentFiles: ComponentFiles,
  options: UploadOptions = {},
  progressTracker?: ProgressTracker
): Promise<ComponentUploadResult> {
  const { media, assets } = componentFiles;
  const concurrency = options.concurrency || 5;

  // Prepare upload tasks
  const mediaTasks = media.map((file) => ({
    localPath: file.filepath,
    storagePath: buildStoragePath(componentFiles, file),
    size: file.size,
  }));

  const assetTasks = assets.map((file) => ({
    localPath: file.filepath,
    storagePath: buildStoragePath(componentFiles, file),
    size: file.size,
  }));

  // Upload media files
  const mediaResults = await uploadWithConcurrency(
    mediaTasks,
    async (task) => {
      const result = await uploadFile(task.localPath, task.storagePath, options);
      if (progressTracker) {
        if (result.success) {
          progressTracker.fileCompleted(path.basename(task.localPath), task.size);
        } else if (result.error?.includes("already exists")) {
          progressTracker.fileSkipped(path.basename(task.localPath));
        } else {
          progressTracker.fileFailed(path.basename(task.localPath));
        }
      }
      return result;
    },
    concurrency
  );

  // Upload asset files
  const assetResults = await uploadWithConcurrency(
    assetTasks,
    async (task) => {
      const result = await uploadFile(task.localPath, task.storagePath, options);
      if (progressTracker) {
        if (result.success) {
          progressTracker.fileCompleted(path.basename(task.localPath), task.size);
        } else if (result.error?.includes("already exists")) {
          progressTracker.fileSkipped(path.basename(task.localPath));
        } else {
          progressTracker.fileFailed(path.basename(task.localPath));
        }
      }
      return result;
    },
    concurrency
  );

  // Calculate statistics
  const allResults = [...mediaResults, ...assetResults];
  const successCount = allResults.filter((r) => r.success).length;
  const failureCount = allResults.filter((r) => !r.success).length;
  const skippedCount = allResults.filter(
    (r) => r.success && r.downloadURL === "[DRY RUN]"
  ).length;
  const totalBytes = allResults
    .filter((r) => r.success)
    .reduce((sum, r) => sum + r.size, 0);

  return {
    projectNumber: componentFiles.projectNumber,
    category: componentFiles.category,
    subcategory: componentFiles.subcategory,
    mediaResults,
    assetResults,
    totalFiles: allResults.length,
    successCount,
    failureCount,
    skippedCount,
    totalBytes,
  };
}

/**
 * Upload all files for all components
 *
 * Main entry point for bulk uploads. Handles progress tracking,
 * error collection, and summary generation.
 *
 * @param allComponents - All component files from scanner
 * @param options - Upload options
 * @returns Promise<UploadSummary>
 */
export async function uploadAllFiles(
  allComponents: ComponentFiles[],
  options: UploadOptions = {}
): Promise<UploadSummary> {
  const startTime = Date.now();

  // Calculate totals for progress tracking
  let totalFiles = 0;
  let totalBytes = 0;

  for (const component of allComponents) {
    totalFiles += component.media.length + component.assets.length;
    totalBytes += component.totalSize;
  }

  // Log start
  const imageCount = allComponents.reduce(
    (sum, c) => sum + c.media.filter((m) => m.mediaType === "image").length,
    0
  );
  const videoCount = allComponents.reduce(
    (sum, c) => sum + c.media.filter((m) => m.mediaType === "video").length,
    0
  );
  const assetCount = allComponents.reduce((sum, c) => sum + c.assets.length, 0);

  console.log("📤 Starting file upload to Firebase Storage...");
  console.log(`🌍 Environment: ${options.dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(
    `📦 Total files: ${totalFiles} (${imageCount} photos, ${videoCount} videos, ${assetCount} assets)`
  );
  console.log(`💾 Total size: ${formatBytes(totalBytes)}\n`);

  // Create progress tracker
  const progressTracker = new ProgressTracker(totalFiles, totalBytes);

  // Upload each component
  const componentResults: ComponentUploadResult[] = [];
  const errors: UploadError[] = [];

  for (const component of allComponents) {
    try {
      const result = await uploadComponentFiles(
        component,
        options,
        progressTracker
      );
      componentResults.push(result);

      // Log component completion
      if (result.successCount > 0) {
        const mediaCount = result.mediaResults.filter((r) => r.success).length;
        const assetCount = result.assetResults.filter((r) => r.success).length;
        const componentLabel = component.subcategory
          ? `${component.category}/${component.subcategory}`
          : component.category;

        console.log(`\n✅ Component uploaded: ${component.projectNumber}/${componentLabel}`);
        if (mediaCount > 0) {
          console.log(`   📷 Media: ${mediaCount}/${component.media.length} uploaded`);
        }
        if (assetCount > 0) {
          console.log(`   📄 Assets: ${assetCount}/${component.assets.length} uploaded`);
        }
        console.log(`   💾 Size: ${formatBytes(result.totalBytes)}`);
      }

      // Collect errors
      for (const mediaResult of result.mediaResults) {
        if (!mediaResult.success) {
          errors.push({
            localPath: mediaResult.localPath,
            storagePath: mediaResult.storagePath,
            error: mediaResult.error || "Unknown error",
          });
        }
      }
      for (const assetResult of result.assetResults) {
        if (!assetResult.success) {
          errors.push({
            localPath: assetResult.localPath,
            storagePath: assetResult.storagePath,
            error: assetResult.error || "Unknown error",
          });
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push({
        localPath: component.category,
        storagePath: `projects/${component.projectNumber}/${component.category}`,
        error: `Component upload failed: ${errorMessage}`,
      });
    }
  }

  // Print errors if any
  if (errors.length > 0) {
    console.log("\n⚠️  Upload Failures:");
    for (const error of errors.slice(0, 10)) {
      // Show first 10 errors
      const filename = error.localPath.split("/").pop();
      console.log(`   ❌ ${error.storagePath}/${filename} - ${error.error}`);
    }
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }

  // Calculate summary statistics
  const successCount = componentResults.reduce(
    (sum, r) => sum + r.successCount,
    0
  );
  const failureCount = componentResults.reduce(
    (sum, r) => sum + r.failureCount,
    0
  );
  const skippedCount = componentResults.reduce(
    (sum, r) => sum + r.skippedCount,
    0
  );
  const totalUploadedBytes = componentResults.reduce(
    (sum, r) => sum + r.totalBytes,
    0
  );

  // Print final summary
  progressTracker.printSummary();

  const uploadTime = Date.now() - startTime;

  return {
    success: errors.length === 0,
    components: componentResults,
    totalFiles,
    successCount,
    failureCount,
    skippedCount,
    totalBytes: totalUploadedBytes,
    uploadTime,
    errors,
  };
}

/**
 * Format bytes to human-readable size
 *
 * @param bytes - Size in bytes
 * @returns Formatted string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// Test harness for quick verification
if (require.main === module) {
  (async () => {
    // Test single file upload (dry run)
    const result = await uploadFile(
      "/path/to/local/photo.jpg",
      "projects/test/bathroom/photos/after/photo.jpg",
      { dryRun: true }
    );

    console.log("Upload result:", result);
  })();
}

