import { FileAsset } from "./FileAsset";

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
 * These stages appear in the gallery showcase of transformation photos.
 *
 * RENDERINGS use plural form as they represent collections.
 * MATERIALS moved to DOCUMENT_TYPES as reference material (not gallery content).
 */
export const MEDIA_STAGES = {
  BEFORE: "before",
  AFTER: "after",
  IN_PROGRESS: "in-progress",
  RENDERINGS: "renderings",
  OTHER: "other",
} as const;

/**
 * Type-safe media stage type
 */
export type MediaStage = (typeof MEDIA_STAGES)[keyof typeof MEDIA_STAGES];

/**
 * MediaAsset represents images and videos for projects
 *
 * Extends FileAsset with media-specific fields for categorization and display.
 * Media assets are organized by project stage (before, after, in-progress, renderings)
 * and can be either images or videos.
 *
 * INHERITANCE:
 * Inherits common file fields (id, url, storagePath, etc.) from FileAsset.
 *
 * MEDIA TYPES:
 * - Images: Photos of actual spaces (before/after/during construction)
 * - Videos: Drone footage, walkthroughs, time-lapses
 *
 * STAGES:
 * Media is categorized by project stage to enable timeline-based galleries
 * (before → in-progress → after → renderings).
 * Materials and other reference photos belong in assets, not gallery.
 */
export interface MediaAsset extends FileAsset {
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

  /**
   * VIDEO-SPECIFIC
   * Optional fields that are only relevant for video assets
   */

  /** Duration in seconds (only for videos) */
  duration?: number;

  /** Video codec (e.g., "h264", "vp9") - only for videos */
  codec?: string;
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
