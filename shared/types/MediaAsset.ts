import { FileAsset, FileAssetSchema } from "./FileAsset";
import { z } from "zod";

/**
 * Media type constants for distinguishing images from videos
 *
 * Used to classify media assets by their content format.
 */
export const MEDIA_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
} as const;

export type MediaType = (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];

const mediaTypeValues = Object.values(MEDIA_TYPES);
export const MediaTypeSchema = z.enum(
  mediaTypeValues as [MediaType, ...MediaType[]]
);

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

export type MediaStage = (typeof MEDIA_STAGES)[keyof typeof MEDIA_STAGES];

const mediaStageValues = Object.values(MEDIA_STAGES);
export const MediaStageSchema = z.enum(
  mediaStageValues as [MediaStage, ...MediaStage[]]
);

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
export const MediaAssetSchema = FileAssetSchema.extend({
  mediaType: MediaTypeSchema,
  stage: MediaStageSchema,
  caption: z.string().optional(),
  duration: z.number().optional(),
  codec: z.string().optional(),
});

export type MediaAsset = z.infer<typeof MediaAssetSchema>;

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
