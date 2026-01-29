/**
 * Memory management utility functions for gallery
 *
 * These are pure functions for calculating memory usage, pressure levels,
 * and providing memory management recommendations.
 */

import {
  MEMORY,
  MemoryPressure,
} from "../constants/performanceConstants";

/**
 * @deprecated Use MEMORY from constants/performanceConstants instead
 */
export const MEMORY_CONSTANTS = MEMORY;

// Re-export MemoryPressure type for backward compatibility
export type { MemoryPressure } from "../constants/performanceConstants";

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
  if (usagePercent > MEMORY.HIGH_PRESSURE_THRESHOLD) {
    return "high";
  } else if (usagePercent > MEMORY.MEDIUM_PRESSURE_THRESHOLD) {
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
      perfMemory?.totalJSHeapSize || MEMORY.DEFAULT_MEMORY_LIMIT;

    return {
      usedMemory: estimatedMemoryUsage,
      memoryLimit: estimatedMemoryLimit,
    };
  } catch (error) {
    return {
      usedMemory: 0,
      memoryLimit: MEMORY.DEFAULT_MEMORY_LIMIT,
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
  return currentTime - lastCheckTime >= MEMORY.MIN_CHECK_INTERVAL;
}

/**
 * Creates a default memory stats object
 *
 * @returns Default memory statistics
 */
export function createDefaultMemoryStats(): MemoryStats {
  return {
    usedMemory: 0,
    freeMemory: MEMORY.DEFAULT_MEMORY_LIMIT,
    totalMemory: MEMORY.DEFAULT_MEMORY_LIMIT,
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
