/**
 * Lazy loading utility functions for image gallery
 *
 * These are pure functions for calculating which images should be
 * visible, loaded, or cleaned up based on current position and configuration.
 */

/**
 * Configuration constants for lazy loading
 */
export const LAZY_LOADING_CONSTANTS = {
  /** Default visible range around current index */
  DEFAULT_VISIBLE_RANGE: 3,
  /** Default load threshold for preloading */
  DEFAULT_LOAD_THRESHOLD: 2,
  /** Staggered loading delay between images (ms) */
  LOADING_DELAY_STEP: 50,
  /** Simulated image load time (ms) */
  SIMULATED_LOAD_TIME: 100,
} as const;

/**
 * Calculates which image indices should be visible (rendered) around current index
 *
 * @param currentIndex - Current image index
 * @param imagesLength - Total number of images
 * @param visibleRange - Number of images to render around current index
 * @returns Array of indices that should be visible
 *
 * @example
 * ```typescript
 * const visibleIndices = getVisibleIndices(5, 10, 2);
 * // Returns: [3, 4, 5, 6, 7] (current ± 2)
 * ```
 */
export function getVisibleIndices(
  currentIndex: number,
  imagesLength: number,
  visibleRange: number
): number[] {
  if (imagesLength === 0) {
    return [];
  }

  const indices = new Set<number>();

  for (let i = -visibleRange; i <= visibleRange; i++) {
    const index = currentIndex + i;
    if (index >= 0 && index < imagesLength) {
      indices.add(index);
    }
  }

  return Array.from(indices);
}

/**
 * Calculates which image indices should be loaded (but not necessarily visible)
 *
 * @param currentIndex - Current image index
 * @param imagesLength - Total number of images
 * @param loadThreshold - Distance from current index to start loading
 * @returns Array of indices that should be loaded
 *
 * @example
 * ```typescript
 * const loadIndices = getLoadIndices(5, 10, 3);
 * // Returns: [2, 3, 4, 5, 6, 7, 8] (current ± 3)
 * ```
 */
export function getLoadIndices(
  currentIndex: number,
  imagesLength: number,
  loadThreshold: number
): number[] {
  if (imagesLength === 0) {
    return [];
  }

  const indices = new Set<number>();

  for (let i = -loadThreshold; i <= loadThreshold; i++) {
    const index = currentIndex + i;
    if (index >= 0 && index < imagesLength) {
      indices.add(index);
    }
  }

  return Array.from(indices);
}

/**
 * Calculates which indices should be kept (visible + load range)
 *
 * @param currentIndex - Current image index
 * @param imagesLength - Total number of images
 * @param visibleRange - Number of images to render around current index
 * @param loadThreshold - Distance from current index to start loading
 * @returns Set of indices that should be kept
 *
 * @example
 * ```typescript
 * const keepIndices = getKeepIndices(5, 10, 2, 3);
 * // Returns: Set([2, 3, 4, 5, 6, 7, 8]) (union of visible and load ranges)
 * ```
 */
export function getKeepIndices(
  currentIndex: number,
  imagesLength: number,
  visibleRange: number,
  loadThreshold: number
): Set<number> {
  const visibleIndices = getVisibleIndices(
    currentIndex,
    imagesLength,
    visibleRange
  );
  const loadIndices = getLoadIndices(currentIndex, imagesLength, loadThreshold);

  return new Set([...visibleIndices, ...loadIndices]);
}

/**
 * Calculates loading delay for staggered image loading
 *
 * @param index - Image index
 * @param baseDelay - Base delay in milliseconds
 * @returns Delay in milliseconds for this image
 *
 * @example
 * ```typescript
 * const delay = calculateLoadingDelay(2, 50);
 * // Returns: 100 (2 * 50ms)
 * ```
 */
export function calculateLoadingDelay(
  index: number,
  baseDelay: number = LAZY_LOADING_CONSTANTS.LOADING_DELAY_STEP
): number {
  return index * baseDelay;
}

/**
 * Creates loading statistics object
 *
 * @param loadedIndices - Set of loaded image indices
 * @param loadingIndices - Set of loading image indices
 * @param visibleIndices - Set of visible image indices
 * @param totalImages - Total number of images
 * @returns Loading statistics object
 *
 * @example
 * ```typescript
 * const stats = createLoadingStats(loadedSet, loadingSet, visibleSet, 10);
 * // Returns: { loaded: 5, loading: 2, visible: 3, total: 10 }
 * ```
 */
export function createLoadingStats(
  loadedIndices: Set<number>,
  loadingIndices: Set<number>,
  visibleIndices: Set<number>,
  totalImages: number
) {
  return {
    loaded: loadedIndices.size,
    loading: loadingIndices.size,
    visible: visibleIndices.size,
    total: totalImages,
  };
}
