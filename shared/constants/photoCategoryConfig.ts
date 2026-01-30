import { MEDIA_STAGES } from "../types/MediaAsset";

/**
 * Photo tab categories for UI filtering
 *
 * These are the filter options shown in the photo gallery UI.
 * Maps to MEDIA_STAGES in the data model with some UI-friendly naming.
 *
 * IMPORTANT: This is the single source of truth for photo tab values.
 * All components should import PhotoTabValue from here, not define their own.
 */
export const PHOTO_TABS = {
  ALL: "all",
  BEFORE: "before",
  PROGRESS: "progress", // UI-friendly name (maps to "in-progress" in data model)
  AFTER: "after",
} as const;

export type PhotoTabValue = (typeof PHOTO_TABS)[keyof typeof PHOTO_TABS];

/**
 * Maps PhotoTabValue to MediaStage
 *
 * Handles the conversion between UI tab values and data model stage values.
 * "progress" tab maps to "in-progress" stage.
 * "all" returns null to indicate "all stages".
 */
export const PHOTO_TAB_TO_STAGE: Record<PhotoTabValue, string | null> = {
  all: null, // null means "all stages"
  before: MEDIA_STAGES.BEFORE,
  progress: MEDIA_STAGES.IN_PROGRESS,
  after: MEDIA_STAGES.AFTER,
} as const;

/**
 * Photo tab display labels for UI
 */
export const PHOTO_TAB_LABELS: Record<PhotoTabValue, string> = {
  all: "All Photos",
  before: "Before",
  progress: "In Progress",
  after: "After",
} as const;

/**
 * Convert PhotoTabValue to MediaStage for filtering
 *
 * @param tab - Photo tab value from UI
 * @returns MediaStage string or null for "all"
 */
export function getStageFromPhotoTab(tab: PhotoTabValue): string | null {
  return PHOTO_TAB_TO_STAGE[tab];
}

/**
 * Check if a MediaAsset matches the given photo tab filter
 *
 * @param asset - MediaAsset to check
 * @param tab - Photo tab filter value
 * @returns true if asset matches the filter
 */
export function matchesPhotoTab(
  asset: { mediaType: string; stage?: string },
  tab: PhotoTabValue
): boolean {
  if (tab === "all") {
    return asset.mediaType === "image";
  }
  const targetStage = getStageFromPhotoTab(tab);
  return (
    asset.mediaType === "image" &&
    targetStage !== null &&
    asset.stage === targetStage
  );
}
