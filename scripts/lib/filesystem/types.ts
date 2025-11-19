/**
 * Filesystem Scanner Type Definitions
 *
 * Types for discovered files during filesystem scanning.
 *
 * @module scripts/lib/filesystem/types
 */

/**
 * Supported media stages (from folder names)
 *
 * Maps to MediaStage from core types
 */
export type MediaStage =
  | "before"
  | "after"
  | "in-progress"
  | "rendering"
  | "other";

/**
 * Supported media types
 */
export type MediaType = "image" | "video";

/**
 * Supported asset types
 */
export type AssetType =
  | "document"
  | "plan"
  | "material"
  | "rendering"
  | "other";

/**
 * Discovered media file (photo or video)
 */
export interface DiscoveredMedia {
  // File info
  /** Base filename with extension */
  filename: string;
  /** Absolute path to file */
  filepath: string;
  /** Path relative to assets root */
  relativePath: string;
  /** File extension including dot (e.g., '.jpg', '.mp4') */
  extension: string;
  /** File size in bytes */
  size: number;

  // Metadata
  /** Media type: 'image' or 'video' */
  mediaType: MediaType;
  /** Project stage extracted from folder name */
  stage: MediaStage;

  // Image-specific (populated if image)
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;

  // Video-specific (populated if video)
  /** Video duration in seconds */
  duration?: number;
  /** Video codec (e.g., 'h264', 'vp9') */
  codec?: string;
}

/**
 * Discovered asset file (PDF, plan, CAD file, etc.)
 */
export interface DiscoveredAsset {
  // File info
  /** Base filename with extension */
  filename: string;
  /** Absolute path to file */
  filepath: string;
  /** Path relative to assets root */
  relativePath: string;
  /** File extension including dot */
  extension: string;
  /** File size in bytes */
  size: number;

  // Metadata
  /** Asset type extracted from folder or extension */
  assetType: AssetType;
  /** Category from folder name ('plans', 'materials', etc.) */
  category: string;
}

/**
 * All files discovered for a single component
 *
 * Represents one component's worth of files to be uploaded
 */
export interface ComponentFiles {
  /** Project number (e.g., "187") */
  projectNumber: string;
  /** Component category (e.g., "bathroom", "kitchen") */
  category: string;
  /** Optional subcategory (e.g., "pool" for outdoor-living) */
  subcategory?: string;

  // Files
  /** All media files (photos and videos) */
  media: DiscoveredMedia[];
  /** All asset files (documents, plans, etc.) */
  assets: DiscoveredAsset[];

  // Stats
  /** Total number of files in this component */
  totalFiles: number;
  /** Total size of all files in bytes */
  totalSize: number;
}

/**
 * Complete scan result for all projects
 */
export interface ScanResult {
  /** Whether scan completed without errors */
  success: boolean;
  /** All discovered component files */
  components: ComponentFiles[];
  /** Errors encountered during scan */
  errors: ScanError[];
  /** Non-critical warnings */
  warnings: ScanWarning[];
  /** Aggregate statistics */
  stats: ScanStats;
}

/**
 * Error information for scan failures
 */
export interface ScanError {
  /** Project number if applicable */
  projectNumber?: string;
  /** Component identifier if applicable */
  component?: string;
  /** File/folder path if applicable */
  path?: string;
  /** Error message */
  message: string;
}

/**
 * Warning information for non-critical issues
 */
export interface ScanWarning {
  /** Project number if applicable */
  projectNumber?: string;
  /** Component identifier if applicable */
  component?: string;
  /** File/folder path if applicable */
  path?: string;
  /** Warning message */
  message: string;
}

/**
 * Aggregate statistics from scan
 */
export interface ScanStats {
  /** Total number of projects scanned */
  totalProjects: number;
  /** Total number of components found */
  totalComponents: number;
  /** Total media files (images + videos) */
  totalMedia: number;
  /** Total asset files */
  totalAssets: number;
  /** Total size of all files in bytes */
  totalSize: number;
  /** Scan duration in milliseconds */
  scanTime: number;
}

/**
 * Internal: Component directory information
 */
export interface ComponentDir {
  /** Project number */
  projectNumber: string;
  /** Component category */
  category: string;
  /** Optional subcategory */
  subcategory?: string;
  /** Absolute path to component directory */
  path: string;
}

