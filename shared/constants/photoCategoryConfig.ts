import { MEDIA_STAGES } from "../types/MediaAsset";

/**
 * Photo category constants for filtering photos by stage
 *
 * These represent the filter categories for photos in the gallery.
 * Maps to MEDIA_STAGES in the data model with some UI-friendly naming.
 *
 * IMPORTANT: This is the single source of truth for photo category values.
 * All components should import PhotoCategory from here, not define their own.
 */
export const PHOTO_CATEGORIES = {
  ALL: "all",
  BEFORE: "before",
  PROGRESS: "progress", // UI-friendly name (maps to "in-progress" in data model)
  AFTER: "after",
} as const;

export type PhotoCategory = (typeof PHOTO_CATEGORIES)[keyof typeof PHOTO_CATEGORIES];

/**
 * Maps PhotoCategory to MediaStage
 *
 * Handles the conversion between photo category filter values and data model stage values.
 * "progress" category maps to "in-progress" stage.
 * "all" returns null to indicate "all stages".
 */
export const PHOTO_CATEGORY_TO_STAGE: Record<PhotoCategory, string | null> = {
  all: null, // null means "all stages"
  before: MEDIA_STAGES.BEFORE,
  progress: MEDIA_STAGES.IN_PROGRESS,
  after: MEDIA_STAGES.AFTER,
} as const;

/**
 * Photo category display labels for UI
 */
export const PHOTO_CATEGORY_LABELS: Record<PhotoCategory, string> = {
  all: "All Photos",
  before: "Before",
  progress: "In Progress",
  after: "After",
} as const;

/**
 * Convert PhotoCategory to MediaStage for filtering
 *
 * @param category - Photo category filter value
 * @returns MediaStage string or null for "all"
 */
export function getStageFromPhotoCategory(category: PhotoCategory): string | null {
  return PHOTO_CATEGORY_TO_STAGE[category];
}

/**
 * Check if a MediaAsset matches the given photo category filter
 *
 * @param asset - MediaAsset to check
 * @param category - Photo category filter value
 * @returns true if asset matches the filter
 */
export function matchesPhotoCategory(
  asset: { mediaType: string; stage?: string },
  category: PhotoCategory
): boolean {
  if (category === "all") {
    return asset.mediaType === "image";
  }
  const targetStage = getStageFromPhotoCategory(category);
  return (
    asset.mediaType === "image" &&
    targetStage !== null &&
    asset.stage === targetStage
  );
}
