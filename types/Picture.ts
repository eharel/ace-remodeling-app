/**
 * Picture types for better type safety and consistency
 */
export const PICTURE_TYPES = {
  BEFORE: "before",
  AFTER: "after",
  PROGRESS: "progress",
  DETAIL: "detail",
  RENDERING: "rendering",
  OTHER: "other",
} as const;

export type PictureType = (typeof PICTURE_TYPES)[keyof typeof PICTURE_TYPES];

/**
 * Picture interface representing project images
 * Supports various image types with Firebase Storage integration
 */
export interface Picture {
  id: string;
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  type: PictureType; // Type-safe picture type
  category?: string; // For compatibility with uploaded Firebase data
  description?: string;
  order: number;
  createdAt: string; // ISO date string format
  filename?: string; // Original filename from upload
  storagePath?: string; // Firebase Storage path
  size?: number; // File size in bytes
}

export interface PicturePair {
  before: Picture;
  after: Picture;
  description?: string;
}
