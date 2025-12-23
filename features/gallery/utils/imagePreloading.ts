import { Picture } from "@/shared/types";

/**
 * Image preloading utility functions for gallery
 *
 * These are pure functions for managing image preloading strategies,
 * timeout handling, and state management.
 */

/**
 * Configuration constants for image preloading
 */
export const PRELOADING_CONSTANTS = {
  /** Default preload radius around current index */
  DEFAULT_PRELOAD_RADIUS: 2,
  /** Preload timeout duration (ms) */
  PRELOAD_TIMEOUT: 10000,
} as const;

/**
 * Calculates which image indices should be preloaded around current index
 *
 * @param currentIndex - Current image index
 * @param imagesLength - Total number of images
 * @param preloadRadius - Number of images to preload on each side
 * @returns Array of indices that should be preloaded
 *
 * @example
 * ```typescript
 * const preloadIndices = getPreloadIndices(5, 10, 2);
 * // Returns: [3, 4, 5, 6, 7] (current ± 2)
 * ```
 */
export function getPreloadIndices(
  currentIndex: number,
  imagesLength: number,
  preloadRadius: number
): number[] {
  if (imagesLength === 0) {
    return [];
  }

  const indices = new Set<number>();

  for (let i = -preloadRadius; i <= preloadRadius; i++) {
    const index = currentIndex + i;
    if (index >= 0 && index < imagesLength) {
      indices.add(index);
    }
  }

  return Array.from(indices);
}

/**
 * Checks if an image should be preloaded based on current state
 *
 * @param imageId - Image identifier
 * @param loadedSet - Set of already loaded image IDs
 * @param loadingSet - Set of currently loading image IDs
 * @param failedSet - Set of failed image IDs
 * @returns True if image should be preloaded
 *
 * @example
 * ```typescript
 * const shouldPreload = shouldPreloadImage(
 *   "img1",
 *   new Set(["img2"]),
 *   new Set(),
 *   new Set()
 * );
 * // Returns: true (not loaded, loading, or failed)
 * ```
 */
export function shouldPreloadImage(
  imageId: string,
  loadedSet: Set<string>,
  loadingSet: Set<string>,
  failedSet: Set<string>
): boolean {
  return (
    !loadedSet.has(imageId) &&
    !loadingSet.has(imageId) &&
    !failedSet.has(imageId)
  );
}

/**
 * Creates preload statistics object
 *
 * @param loadedSet - Set of loaded image IDs
 * @param loadingSet - Set of loading image IDs
 * @param failedSet - Set of failed image IDs
 * @param totalImages - Total number of images
 * @returns Preload statistics object
 *
 * @example
 * ```typescript
 * const stats = createPreloadStats(loadedSet, loadingSet, failedSet, 10);
 * // Returns: { loaded: 5, loading: 2, failed: 1, total: 10 }
 * ```
 */
export function createPreloadStats(
  loadedSet: Set<string>,
  loadingSet: Set<string>,
  failedSet: Set<string>,
  totalImages: number
) {
  return {
    loaded: loadedSet.size,
    loading: loadingSet.size,
    failed: failedSet.size,
    total: totalImages,
  };
}

/**
 * Filters images to keep based on current preload range
 *
 * @param images - Array of images
 * @param currentIndices - Current indices to preload
 * @returns Set of image IDs that should be kept
 *
 * @example
 * ```typescript
 * const keepImages = getImagesToKeep(images, [1, 2, 3]);
 * // Returns: Set of image IDs for indices 1, 2, 3
 * ```
 */
export function getImagesToKeep(
  images: Picture[],
  currentIndices: number[]
): Set<string> {
  return new Set(
    currentIndices.map((index) => images[index]?.id).filter(Boolean)
  );
}

/**
 * Creates a timeout handler for preload operations
 *
 * @param imageId - Image identifier
 * @param timeoutMs - Timeout duration in milliseconds
 * @param onTimeout - Callback when timeout occurs
 * @returns Timeout ID
 *
 * @example
 * ```typescript
 * const timeoutId = createPreloadTimeout(
 *   "img1",
 *   5000,
 *   () => console.log("Preload timeout")
 * );
 * ```
 */
export function createPreloadTimeout(
  imageId: string,
  timeoutMs: number,
  onTimeout: () => void
): number {
  return setTimeout(() => {
    onTimeout();
  }, timeoutMs) as unknown as number;
}
