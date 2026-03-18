/**
 * Lazy loading utility functions for image gallery
 *
 * These are pure functions for calculating which images should be
 * visible, loaded, or cleaned up based on current position and configuration.
 */

import { LAZY_LOADING } from "../constants/performanceConstants";
import { getIndicesInRange, getCombinedRangeSet } from "./indexCalculations";

/**
 * @deprecated Use LAZY_LOADING from constants/performanceConstants instead
 */
export const LAZY_LOADING_CONSTANTS = LAZY_LOADING;

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
  return getIndicesInRange(currentIndex, imagesLength, visibleRange);
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
  return getIndicesInRange(currentIndex, imagesLength, loadThreshold);
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
  return getCombinedRangeSet(currentIndex, imagesLength, [
    visibleRange,
    loadThreshold,
  ]);
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
  baseDelay: number = LAZY_LOADING.LOADING_DELAY_STEP
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
