/**
 * TypeScript interfaces for Firebase Storage upload script
 *
 * These types define the structure of data used throughout the upload process,
 * from parsing local files to generating Firestore data.
 */

/**
 * Information extracted from project folder name
 */
export interface ProjectInfo {
  id: string; // Project number: "104"
  slug: string; // URL-friendly identifier: "104-luxe-revival"
  displayName: string; // Human-readable name: "Luxe Revival"
  category: string; // Project category: "kitchen", "bathroom", etc.
  subcategory?: string; // Project subcategory: "adu", "addition" (only for adu-addition category)
}

/**
 * Represents a local file discovered during folder scan
 */
export interface LocalFile {
  projectInfo: ProjectInfo;
  category: string; // Standardized category: "after", "before", "progress", etc.
  subcategory?: string; // Project subcategory: "adu", "addition" (only for adu-addition category)
  fileType: "image" | "document";
  filename: string; // Original filename with extension
  localPath: string; // Full path on local filesystem
  size: number; // File size in bytes
  extension: string; // File extension including dot: ".jpg", ".pdf"
}

/**
 * Represents a file successfully uploaded to Firebase Storage
 */
export interface UploadedFile {
  projectId: string; // Project number: "104"
  projectSlug: string; // URL-friendly identifier: "104-luxe-revival"
  projectName: string; // Human-readable name: "Luxe Revival"
  category: string; // Standardized category
  subcategory?: string; // Project subcategory: "adu", "addition" (only for adu-addition category)
  fileType: "image" | "document";
  filename: string; // Filename in storage
  url: string; // Permanent download URL from Firebase
  storagePath: string; // Full path in Firebase Storage
  size: number; // File size in bytes
  uploadedAt: string; // ISO timestamp of upload
  wasNewlyUploaded?: boolean; // true if uploaded, false if already existed
}

/**
 * Represents a file that was skipped during upload
 */
export interface SkippedFile {
  path: string; // File path or identifier
  reason: string; // Why it was skipped
  size?: number; // Optional file size
}

/**
 * Represents an error that occurred during upload
 */
export interface UploadError {
  file: string; // File identifier
  error: string; // Error message
  localPath?: string; // Optional local path
}

/**
 * Summary statistics for an upload session
 */
export interface UploadSummary {
  totalFiles: number; // Total files scanned
  uploadedCount: number; // Successfully uploaded
  skippedCount: number; // Skipped (already exist, system files, etc.)
  errorCount: number; // Failed uploads
  totalSize: number; // Total bytes uploaded
  duration: number; // Total time in milliseconds
  imageCount: number; // Number of images uploaded
  documentCount: number; // Number of documents uploaded
}

/**
 * Complete result of an upload operation
 */
export interface UploadResult {
  uploaded: UploadedFile[];
  skipped: SkippedFile[];
  errors: UploadError[];
  summary: UploadSummary;
}

/**
 * Photo data structure for Firestore
 */
export interface FirestorePhoto {
  url: string;
  category: string; // "before", "after", "progress", "rendering"
  filename: string;
  storagePath: string;
  size: number;
  order: number; // Display order
}

/**
 * Document data structure for Firestore
 */
export interface FirestoreDocument {
  url: string;
  category: string; // "plans", "rendering", "other"
  filename: string;
  storagePath: string;
  size: number;
  type: string; // Document type for display
}

/**
 * Project data structure for Firestore
 */
export interface FirestoreProject {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string; // Project subcategory: "adu", "addition" (only for adu-addition category)
  photos: FirestorePhoto[];
  documents: FirestoreDocument[];
}

/**
 * Complete Firestore data output
 */
export interface FirestoreData {
  uploadDate: string; // ISO timestamp
  category: string; // Project category (e.g., "kitchen")
  totalProjects: number;
  projects: FirestoreProject[];
}

/**
 * Command-line options for the upload script
 */
export interface UploadOptions {
  dryRun: boolean; // Preview without uploading
  force: boolean; // Re-upload even if exists
  project?: string; // Upload specific project only
  outputPath: string; // Where to save generated JSON
  batchSize: number; // Number of files to upload in parallel
}

/**
 * Scan result from local folder
 */
export interface ScanResult {
  files: LocalFile[];
  projectCount: number;
  imageCount: number;
  documentCount: number;
  skippedCount: number;
  totalSize: number;
}
