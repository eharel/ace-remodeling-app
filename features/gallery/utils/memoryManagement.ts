/**
 * Memory management utility functions for gallery
 *
 * These are pure functions for calculating memory usage, pressure levels,
 * and providing memory management recommendations.
 */

/**
 * Configuration constants for memory management
 */
export const MEMORY_CONSTANTS = {
  /** Memory check interval (ms) */
  MEMORY_CHECK_INTERVAL: 10000,
  /** Minimum time between memory checks (ms) */
  MIN_CHECK_INTERVAL: 5000,
  /** Default memory limit (bytes) */
  DEFAULT_MEMORY_LIMIT: 100 * 1024 * 1024, // 100MB
  /** High memory pressure threshold (%) */
  HIGH_MEMORY_THRESHOLD: 80,
  /** Medium memory pressure threshold (%) */
  MEDIUM_MEMORY_THRESHOLD: 60,
} as const;

/**
 * Memory pressure levels
 */
export type MemoryPressure = "low" | "medium" | "high";

/**
 * Memory statistics interface
 */
export interface MemoryStats {
  usedMemory: number;
  freeMemory: number;
  totalMemory: number;
  memoryPressure: MemoryPressure;
}

/**
 * Calculates memory pressure level based on usage percentage
 *
 * @param usagePercent - Memory usage percentage (0-100)
 * @returns Memory pressure level
 *
 * @example
 * ```typescript
 * const pressure = calculateMemoryPressure(85);
 * // Returns: "high"
 * ```
 */
export function calculateMemoryPressure(usagePercent: number): MemoryPressure {
  if (usagePercent > MEMORY_CONSTANTS.HIGH_MEMORY_THRESHOLD) {
    return "high";
  } else if (usagePercent > MEMORY_CONSTANTS.MEDIUM_MEMORY_THRESHOLD) {
    return "medium";
  } else {
    return "low";
  }
}

/**
 * Calculates memory statistics from usage data
 *
 * @param usedMemory - Used memory in bytes
 * @param totalMemory - Total memory in bytes
 * @returns Memory statistics object
 *
 * @example
 * ```typescript
 * const stats = calculateMemoryStats(80 * 1024 * 1024, 100 * 1024 * 1024);
 * // Returns: { usedMemory: 80MB, freeMemory: 20MB, totalMemory: 100MB, memoryPressure: "high" }
 * ```
 */
export function calculateMemoryStats(
  usedMemory: number,
  totalMemory: number
): MemoryStats {
  const freeMemory = totalMemory - usedMemory;
  const usagePercent = (usedMemory / totalMemory) * 100;
  const memoryPressure = calculateMemoryPressure(usagePercent);

  return {
    usedMemory,
    freeMemory,
    totalMemory,
    memoryPressure,
  };
}

/**
 * Gets estimated memory usage from performance API
 *
 * @returns Object with estimated memory usage and limit
 *
 * @example
 * ```typescript
 * const { usedMemory, memoryLimit } = getEstimatedMemoryUsage();
 * ```
 */
export function getEstimatedMemoryUsage(): {
  usedMemory: number;
  memoryLimit: number;
} {
  try {
    // Use performance.memory if available (Chrome/Edge only - not available in React Native)
    // Type assertion needed because TypeScript doesn't include this browser-specific API
    const perfMemory = (performance as any).memory;
    const estimatedMemoryUsage = perfMemory?.usedJSHeapSize || 0;
    const estimatedMemoryLimit =
      perfMemory?.totalJSHeapSize ||
      MEMORY_CONSTANTS.DEFAULT_MEMORY_LIMIT;

    return {
      usedMemory: estimatedMemoryUsage,
      memoryLimit: estimatedMemoryLimit,
    };
  } catch (error) {
    return {
      usedMemory: 0,
      memoryLimit: MEMORY_CONSTANTS.DEFAULT_MEMORY_LIMIT,
    };
  }
}

/**
 * Checks if enough time has passed since last memory check
 *
 * @param lastCheckTime - Timestamp of last check
 * @param currentTime - Current timestamp
 * @returns True if enough time has passed
 *
 * @example
 * ```typescript
 * const shouldCheck = shouldCheckMemory(lastCheckTime, Date.now());
 * ```
 */
export function shouldCheckMemory(
  lastCheckTime: number,
  currentTime: number
): boolean {
  return currentTime - lastCheckTime >= MEMORY_CONSTANTS.MIN_CHECK_INTERVAL;
}

/**
 * Creates a default memory stats object
 *
 * @returns Default memory statistics
 */
export function createDefaultMemoryStats(): MemoryStats {
  return {
    usedMemory: 0,
    freeMemory: MEMORY_CONSTANTS.DEFAULT_MEMORY_LIMIT,
    totalMemory: MEMORY_CONSTANTS.DEFAULT_MEMORY_LIMIT,
    memoryPressure: "low",
  };
}

/**
 * Attempts to force garbage collection if available
 *
 * @returns True if garbage collection was attempted
 *
 * @example
 * ```typescript
 * const success = forceGarbageCollection();
 * ```
 */
export function forceGarbageCollection(): boolean {
  try {
    if (global.gc) {
      global.gc();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
