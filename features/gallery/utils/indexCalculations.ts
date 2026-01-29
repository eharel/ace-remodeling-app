/**
 * Index calculation utilities for gallery
 *
 * These are pure functions for calculating ranges of indices around a current position.
 * Used by both lazy loading and preloading systems to determine which images
 * should be rendered, loaded, or kept in memory.
 */

/**
 * Calculates indices within a range around the current index
 *
 * This is the core calculation used by both lazy loading and preloading.
 * Returns all valid indices within ±radius of the current index.
 *
 * @param currentIndex - Current position in the list
 * @param totalLength - Total number of items
 * @param radius - Number of items on each side to include
 * @returns Array of valid indices within the range
 *
 * @example
 * ```typescript
 * getIndicesInRange(5, 10, 2);
 * // Returns: [3, 4, 5, 6, 7] (current ± 2, clamped to bounds)
 *
 * getIndicesInRange(0, 10, 2);
 * // Returns: [0, 1, 2] (start edge case)
 *
 * getIndicesInRange(9, 10, 2);
 * // Returns: [7, 8, 9] (end edge case)
 * ```
 */
export function getIndicesInRange(
  currentIndex: number,
  totalLength: number,
  radius: number
): number[] {
  if (totalLength === 0) {
    return [];
  }

  const indices: number[] = [];
  const start = Math.max(0, currentIndex - radius);
  const end = Math.min(totalLength - 1, currentIndex + radius);

  for (let i = start; i <= end; i++) {
    indices.push(i);
  }

  return indices;
}

/**
 * Calculates indices as a Set for efficient lookup
 *
 * Same as getIndicesInRange but returns a Set for O(1) membership testing.
 *
 * @param currentIndex - Current position in the list
 * @param totalLength - Total number of items
 * @param radius - Number of items on each side to include
 * @returns Set of valid indices within the range
 *
 * @example
 * ```typescript
 * const visible = getIndicesInRangeSet(5, 10, 2);
 * visible.has(5); // true
 * visible.has(10); // false
 * ```
 */
export function getIndicesInRangeSet(
  currentIndex: number,
  totalLength: number,
  radius: number
): Set<number> {
  return new Set(getIndicesInRange(currentIndex, totalLength, radius));
}

/**
 * Combines multiple ranges into a single Set
 *
 * Useful when you need both visible range and preload range combined.
 *
 * @param currentIndex - Current position in the list
 * @param totalLength - Total number of items
 * @param ranges - Array of radii to combine
 * @returns Set of all indices from all ranges
 *
 * @example
 * ```typescript
 * // Combine visible range (2) and preload range (4)
 * const keepIndices = getCombinedRangeSet(5, 10, [2, 4]);
 * // Returns: Set([1, 2, 3, 4, 5, 6, 7, 8, 9])
 * ```
 */
export function getCombinedRangeSet(
  currentIndex: number,
  totalLength: number,
  ranges: number[]
): Set<number> {
  const combined = new Set<number>();

  for (const radius of ranges) {
    const indices = getIndicesInRange(currentIndex, totalLength, radius);
    for (const index of indices) {
      combined.add(index);
    }
  }

  return combined;
}

/**
 * Checks if an index is within range of the current index
 *
 * @param index - Index to check
 * @param currentIndex - Current position
 * @param radius - Allowed distance from current
 * @returns True if index is within range
 *
 * @example
 * ```typescript
 * isIndexInRange(3, 5, 2); // true (5-2=3)
 * isIndexInRange(1, 5, 2); // false (too far)
 * ```
 */
export function isIndexInRange(
  index: number,
  currentIndex: number,
  radius: number
): boolean {
  return Math.abs(index - currentIndex) <= radius;
}

/**
 * Gets the distance from current index (useful for prioritization)
 *
 * @param index - Index to measure
 * @param currentIndex - Current position
 * @returns Absolute distance from current index
 *
 * @example
 * ```typescript
 * getDistanceFromCurrent(3, 5); // 2
 * getDistanceFromCurrent(7, 5); // 2
 * ```
 */
export function getDistanceFromCurrent(
  index: number,
  currentIndex: number
): number {
  return Math.abs(index - currentIndex);
}

/**
 * Sorts indices by distance from current (nearest first)
 *
 * Useful for prioritizing which images to load first.
 *
 * @param indices - Array of indices to sort
 * @param currentIndex - Current position
 * @returns New array sorted by distance (nearest first)
 *
 * @example
 * ```typescript
 * sortByDistanceFromCurrent([1, 2, 3, 7, 8], 5);
 * // Returns: [3, 7, 2, 8, 1] (sorted by distance from 5)
 * ```
 */
export function sortByDistanceFromCurrent(
  indices: number[],
  currentIndex: number
): number[] {
  return [...indices].sort(
    (a, b) =>
      getDistanceFromCurrent(a, currentIndex) -
      getDistanceFromCurrent(b, currentIndex)
  );
}
