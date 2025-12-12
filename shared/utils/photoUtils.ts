import { MEDIA_STAGES, MediaAsset } from "@/core/types";

/**
 * Photo counts for each category
 */
export interface PhotoCounts {
  all: number;
  before: number;
  progress: number;
  after: number;
}

/**
 * Calculate photo counts for each category
 *
 * @param media - Array of project media assets
 * @returns Object containing counts for each category
 */
export function getPhotoCounts(media: MediaAsset[]): PhotoCounts {
  if (!media || media.length === 0) {
    return { all: 0, before: 0, progress: 0, after: 0 };
  }

  // Filter to images only (exclude videos)
  // Also filter out null/undefined values to prevent crashes
  const images = media.filter((m) => m && m.mediaType === "image");

  return {
    all: images.length,
    before: images.filter((m) => m.stage === MEDIA_STAGES.BEFORE).length,
    progress: images.filter((m) => m.stage === MEDIA_STAGES.IN_PROGRESS).length,
    after: images.filter((m) => m.stage === MEDIA_STAGES.AFTER).length,
  };
}

/**
 * Determine preview count based on screen width
 * Small screens (< 768px): 2 photos
 * Large screens (>= 768px): 3 photos
 *
 * @param screenWidth - Current screen width in pixels
 * @returns Number of photos to show in preview (2 or 3)
 */
export function getPreviewCount(screenWidth: number): number {
  return screenWidth < 768 ? 2 : 3;
}

/**
 * Get preview photos for a specific category (simple slice)
 *
 * @param photos - Array of media assets to preview
 * @param count - Number of photos to show in preview
 * @returns Array of media assets limited to preview count
 */
export function getPreviewPhotos(
  photos: MediaAsset[],
  count: number
): MediaAsset[] {
  return photos.slice(0, count);
}

/**
 * Intelligently samples photos from all categories to create a diverse preview.
 * Priority order: after → before → progress (shows finished work first)
 * Uses round-robin selection to ensure variety when multiple categories exist.
 *
 * Strategy:
 * - If project has photos in all 3 categories: shows one from each (after, before, progress)
 * - If project missing a category: fills preview with available categories, maintaining priority
 * - If project has only after photos: shows first 2-3 after photos
 * - Always prioritizes showing finished work (after) first for client presentations
 * - Never shows only "ugly construction phase" photos if better options exist
 *
 * @param allMedia - Complete array of project media assets (images only)
 * @param previewCount - Number of photos to show in preview (2 or 3)
 * @returns Array of sampled media assets for preview
 *
 * @example
 * ```ts
 * // Project with all categories: returns [after[0], before[0], progress[0]]
 * samplePreviewPhotos(mixedPhotos, 3);
 *
 * // Project with only after photos: returns [after[0], after[1], after[2]]
 * samplePreviewPhotos(afterOnlyPhotos, 3);
 *
 * // Project missing progress: returns [after[0], before[0], after[1]]
 * samplePreviewPhotos(noProgressPhotos, 3);
 * ```
 */
export function samplePreviewPhotos(
  allMedia: MediaAsset[],
  previewCount: number
): MediaAsset[] {
  // Filter to images only
  // Also filter out null/undefined values to prevent crashes
  const allPhotos = allMedia.filter((m) => m && m.mediaType === "image");

  if (!allPhotos || allPhotos.length === 0) {
    return [];
  }

  // If total photos <= preview count, return all
  if (allPhotos.length <= previewCount) {
    return [...allPhotos];
  }

  // Separate photos by stage
  const categorized = {
    after: allPhotos.filter((p) => p.stage === MEDIA_STAGES.AFTER),
    before: allPhotos.filter((p) => p.stage === MEDIA_STAGES.BEFORE),
    progress: allPhotos.filter((p) => p.stage === MEDIA_STAGES.IN_PROGRESS),
  };

  const preview: MediaAsset[] = [];
  const priorityOrder: ("after" | "before" | "progress")[] = [
    "after",
    "before",
    "progress",
  ];
  const pointers = { after: 0, before: 0, progress: 0 };

  let attempts = 0;
  const maxAttempts = previewCount * 3; // Safety limit

  // Round-robin through categories in priority order
  while (preview.length < previewCount && attempts < maxAttempts) {
    const categoryIndex = attempts % 3;
    const category = priorityOrder[categoryIndex];
    const photos = categorized[category];

    // If this category has more photos to offer, take the next one
    if (pointers[category] < photos.length) {
      preview.push(photos[pointers[category]]);
      pointers[category]++;
    }

    attempts++;

    // Early exit if all categories exhausted
    const allExhausted = priorityOrder.every(
      (cat) => pointers[cat] >= categorized[cat].length
    );
    if (allExhausted) break;
  }

  return preview;
}
