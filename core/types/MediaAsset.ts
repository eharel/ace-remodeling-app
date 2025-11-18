/**
 * Media type constants for distinguishing images from videos
 * 
 * Used to classify media assets by their content format.
 */
export const MEDIA_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
} as const;

/**
 * Type-safe media type
 */
export type MediaType = (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];

/**
 * Content stage constants for categorizing media by project phase
 * 
 * Represents when in the project lifecycle the media was captured.
 * Note: IN_PROGRESS renamed from PROGRESS for consistency with status naming.
 */
export const MEDIA_STAGES = {
  BEFORE: "before",
  AFTER: "after",
  IN_PROGRESS: "in-progress",
  DETAIL: "detail",
  RENDERING: "rendering",
  OTHER: "other",
} as const;

/**
 * Type-safe media stage type
 */
export type MediaStage = (typeof MEDIA_STAGES)[keyof typeof MEDIA_STAGES];

/**
 * Represents images and videos for projects.
 * Supports Firebase Storage integration.
 * 
 * Media assets can be images (photos) or videos (drone footage, etc.)
 * and are categorized by the project phase when they were captured.
 */
export interface MediaAsset {
  /**
   * IDENTITY
   */
  /** Unique identifier for the media asset */
  id: string;
  /** Original filename, required for tracking and organization */
  filename: string;

  /**
   * STORAGE
   */
  /** Public download URL for the media asset */
  url: string;
  /**
   * Firebase Storage path (e.g., "projects/187/bathroom/photos/after-01.jpg")
   * Used for direct Firebase Storage operations
   */
  storagePath: string;
  /**
   * Thumbnail URL for videos or optimized previews
   * Optional - primarily used for video previews or image optimization
   */
  thumbnailUrl?: string;
  /** File size in bytes */
  size?: number;

  /**
   * CLASSIFICATION
   */
  /** Media format type: "image" or "video" */
  mediaType: MediaType;
  /**
   * Project phase when this media was captured
   * Indicates the stage of the project (before, after, in-progress, etc.)
   */
  stage: MediaStage;

  /**
   * DISPLAY
   */
  /**
   * Caption for the media asset
   * Replaces altText - more accurate term as it's not just for accessibility
   */
  caption?: string;
  /** Longer explanation if needed */
  description?: string;
  /** Order for gallery sorting */
  order: number;

  /**
   * VIDEO-SPECIFIC
   * Optional fields that are only relevant for video assets
   */
  /** Duration in seconds (only for videos) */
  duration?: number;
  /** Video codec (e.g., "h264", "vp9") - only for videos */
  codec?: string;

  /**
   * METADATA
   */
  /**
   * ISO format timestamp of when the media was uploaded
   * Uses past tense since it's immutable after upload
   */
  uploadedAt: string;
}

/**
 * Before/after comparison pair for showcasing transformations
 * 
 * Used to display side-by-side comparisons of project progress,
 * highlighting the transformation from initial state to completion.
 */
export interface MediaPair {
  /** Media asset captured before work began */
  before: MediaAsset;
  /** Media asset captured after work was completed */
  after: MediaAsset;
  /**
   * Caption describing the transformation
   * Optional description of what changed between before and after
   */
  caption?: string;
}

/**
 * Type guard to check if a media asset is a video
 * 
 * @param asset - The media asset to check
 * @returns True if the asset is a video, false otherwise
 */
export function isVideo(asset: MediaAsset): asset is MediaAsset {
  return asset.mediaType === MEDIA_TYPES.VIDEO;
}

/**
 * Type guard to check if a media asset is an image
 * 
 * @param asset - The media asset to check
 * @returns True if the asset is an image, false otherwise
 */
export function isImage(asset: MediaAsset): asset is MediaAsset {
  return asset.mediaType === MEDIA_TYPES.IMAGE;
}

