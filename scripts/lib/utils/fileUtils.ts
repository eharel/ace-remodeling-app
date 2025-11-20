/**
 * File Utilities
 *
 * Helper functions for file operations and metadata extraction.
 *
 * @module scripts/lib/utils/fileUtils
 */

import * as fs from "fs/promises";
import * as path from "path";
import { MediaStage, MediaType } from "../filesystem/types";

/**
 * File extension groups
 */
export const FILE_EXTENSIONS = {
  images: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic"],
  videos: [".mp4", ".mov", ".avi", ".m4v"],
  documents: [".pdf", ".doc", ".docx"],
  cad: [".dwg", ".dxf", ".skp"],
  // Images that can be documents (high-res plans, specs, etc.)
  imageDocuments: [".jpg", ".jpeg", ".png", ".heic"],
} as const;

/**
 * Files to ignore during scanning
 */
export const IGNORED_FILES = [
  ".DS_Store",
  "Thumbs.db",
  ".gitkeep",
  ".gitignore",
  "desktop.ini",
];

/**
 * Check if file is an image
 *
 * @param filename - Filename to check
 * @returns True if file is an image type
 */
export function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return FILE_EXTENSIONS.images.includes(ext as any);
}

/**
 * Check if file is a video
 *
 * @param filename - Filename to check
 * @returns True if file is a video type
 */
export function isVideoFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return FILE_EXTENSIONS.videos.includes(ext as any);
}

/**
 * Check if file is an asset (PDF, CAD, images, etc.)
 *
 * Assets include PDFs, CAD files, and high-resolution images (specs, plans, etc.).
 * Images in /assets/ are treated as documents, not gallery photos.
 *
 * @param filename - Filename to check
 * @returns True if file is an asset type
 */
export function isAssetFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  const allAssetExtensions = [
    ...FILE_EXTENSIONS.documents,
    ...FILE_EXTENSIONS.cad,
    ...FILE_EXTENSIONS.imageDocuments,
  ];
  return allAssetExtensions.includes(ext as any);
}

/**
 * Check if file should be ignored
 *
 * @param filename - Filename to check
 * @returns True if file should be ignored
 */
export function shouldIgnoreFile(filename: string): boolean {
  // Check against ignored files list
  if (IGNORED_FILES.includes(filename)) {
    return true;
  }

  // Ignore hidden files (starting with .)
  if (filename.startsWith(".")) {
    return true;
  }

  return false;
}

/**
 * Get media type from filename
 *
 * @param filename - Filename to check
 * @returns MediaType or null if not a media file
 */
export function getMediaType(filename: string): MediaType | null {
  if (isImageFile(filename)) return "image";
  if (isVideoFile(filename)) return "video";
  return null;
}

/**
 * Extract stage from folder path
 *
 * Looks at the deepest folder in the path to determine stage.
 * Handles aliases (e.g., "during" → "in-progress").
 *
 * @param folderPath - Path to folder
 * @returns MediaStage extracted from folder name
 *
 * @example
 * extractStageFromPath('/photos/before/') → 'before'
 * extractStageFromPath('/photos/in-progress/') → 'in-progress'
 * extractStageFromPath('/photos/during/') → 'in-progress'
 */
export function extractStageFromPath(folderPath: string): MediaStage {
  const folderName = path.basename(folderPath).toLowerCase();

  const stageMap: Record<string, MediaStage> = {
    before: "before",
    after: "after",
    "in-progress": "in-progress",
    during: "in-progress", // Alias
    progress: "in-progress", // Alias
    rendering: "rendering",
    renderings: "rendering", // Plural alias
    "3d-rendering": "rendering", // Alternative
  };

  return stageMap[folderName] || "other";
}

/**
 * Extract asset category from folder path
 *
 * @param folderPath - Path to folder
 * @returns Category string (e.g., 'plans', 'materials')
 */
export function extractAssetCategory(folderPath: string): string {
  const folderName = path.basename(folderPath).toLowerCase();

  // Common asset folder names
  const categoryMap: Record<string, string> = {
    plans: "plans",
    "floor-plans": "plans",
    floorplans: "plans",
    materials: "materials",
    renderings: "renderings",
    "3d-renderings": "renderings",
    documents: "documents",
    contracts: "contracts",
    permits: "permits",
  };

  return categoryMap[folderName] || "other";
}

/**
 * Get file size in bytes
 *
 * @param filepath - Absolute path to file
 * @returns File size in bytes, or 0 if error
 */
export async function getFileSize(filepath: string): Promise<number> {
  try {
    const stats = await fs.stat(filepath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Check if path exists
 *
 * @param filepath - Path to check
 * @returns True if path exists
 */
export async function pathExists(filepath: string): Promise<boolean> {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if path is a directory
 *
 * @param filepath - Path to check
 * @returns True if path is a directory
 */
export async function isDirectory(filepath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filepath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Get relative path from root
 *
 * @param filepath - Absolute path
 * @param rootPath - Root path
 * @returns Relative path from root
 */
export function getRelativePath(filepath: string, rootPath: string): string {
  return path.relative(rootPath, filepath);
}

/**
 * Format bytes to human-readable size
 *
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.23 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Get list of files in directory
 *
 * Recursively gets all files in directory and subdirectories.
 * Filters out ignored files and directories.
 *
 * @param dirPath - Directory to scan
 * @returns Array of absolute file paths
 */
export async function getFilesInDirectory(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      // Skip ignored files
      if (shouldIgnoreFile(entry.name)) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await getFilesInDirectory(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
    // Return empty array
  }

  return files;
}

/**
 * Get list of subdirectories
 *
 * @param dirPath - Directory to scan
 * @returns Array of subdirectory names
 */
export async function getSubdirectories(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && !shouldIgnoreFile(entry.name))
      .map((entry) => entry.name);
  } catch (error) {
    return [];
  }
}
