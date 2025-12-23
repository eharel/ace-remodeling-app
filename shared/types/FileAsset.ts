/**
 * Base interface for all file assets stored in Firebase Storage
 *
 * This serves as the foundation for media (photos/videos), documents (PDFs/contracts),
 * and any other file-based content in the system. By sharing common fields, we ensure
 * consistency across file types and enable generic file operations.
 *
 * EXTENSIBILITY:
 * Specific file types (MediaAsset, Document) extend this interface with their own
 * domain-specific fields while inheriting the common storage and metadata fields.
 *
 * USAGE:
 * Do not use FileAsset directly. Always use specific types (MediaAsset, Document)
 * that extend this interface. FileAsset exists to enforce consistency and enable
 * generic operations on any file type.
 */
export interface FileAsset {
  /**
   * IDENTITY
   */

  /** Unique identifier for the file asset */
  id: string;

  /** Original filename from upload (e.g., 'bathroom-after-01.jpg') */
  filename: string;

  /**
   * STORAGE
   */

  /** Public download URL from Firebase Storage */
  url: string;

  /**
   * Firebase Storage path for direct operations
   * (e.g., 'projects/187/bathroom/photos/after/01.jpg')
   */
  storagePath: string;

  /**
   * Optional thumbnail URL for previews
   * (used for PDFs, videos, and optimized image previews)
   */
  thumbnailUrl?: string;

  /** File size in bytes */
  size?: number;

  /**
   * DISPLAY
   */

  /** Optional description or notes about the file */
  description?: string;

  /** Display order in lists and galleries (lower numbers appear first) */
  order: number;

  /**
   * METADATA
   */

  /** ISO format timestamp of when the file was uploaded */
  uploadedAt: string;
}

