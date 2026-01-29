/**
 * Performance-related constants for the gallery feature
 *
 * Consolidates all performance tuning constants in one place for easy adjustment.
 * These values have been optimized for smooth gallery operation on mobile devices.
 */

/**
 * Lazy loading configuration
 *
 * Controls which images are rendered vs deferred
 */
export const LAZY_LOADING = {
  /** Number of images to render around current index */
  DEFAULT_VISIBLE_RANGE: 3,
  /** Distance threshold for starting to load images */
  DEFAULT_LOAD_THRESHOLD: 2,
  /** Staggered loading delay between images (ms) */
  LOADING_DELAY_STEP: 50,
  /** Simulated image load time for testing (ms) */
  SIMULATED_LOAD_TIME: 100,
} as const;

/**
 * Image preloading configuration
 *
 * Controls prefetching of adjacent images
 */
export const PRELOADING = {
  /** Default number of images to preload on each side */
  DEFAULT_PRELOAD_RADIUS: 2,
  /** Timeout for preload operations (ms) */
  PRELOAD_TIMEOUT: 10000,
} as const;

/**
 * Memory management configuration
 *
 * Controls memory monitoring and cleanup behavior
 */
export const MEMORY = {
  /** Interval between memory checks (ms) */
  CHECK_INTERVAL: 10000,
  /** Minimum time between memory checks (ms) */
  MIN_CHECK_INTERVAL: 5000,
  /** Default memory limit (bytes) - 100MB */
  DEFAULT_MEMORY_LIMIT: 100 * 1024 * 1024,
  /** High memory pressure threshold (%) */
  HIGH_PRESSURE_THRESHOLD: 80,
  /** Medium memory pressure threshold (%) */
  MEDIUM_PRESSURE_THRESHOLD: 60,
} as const;

/**
 * Performance scoring thresholds
 *
 * Target values for performance metrics (lower is better for times)
 */
export const PERFORMANCE_TARGETS = {
  /** Target render time for 60fps (ms) */
  RENDER_TIME: 16,
  /** Target image load time for good UX (ms) */
  IMAGE_LOAD_TIME: 500,
  /** Target frame rate for smooth animations */
  FRAME_RATE: 50,
  /** Target gesture response time (ms) */
  GESTURE_RESPONSE_TIME: 100,
} as const;

/**
 * Performance scoring penalties
 *
 * Maximum penalty points for poor performance in each area
 */
export const PERFORMANCE_PENALTIES = {
  /** Maximum penalty for slow renders */
  MAX_RENDER_PENALTY: 30,
  /** Maximum penalty for slow image loads */
  MAX_IMAGE_LOAD_PENALTY: 20,
  /** Maximum penalty for low frame rate */
  MAX_FRAME_RATE_PENALTY: 25,
  /** Maximum penalty for slow gesture response */
  MAX_GESTURE_PENALTY: 15,
} as const;

/**
 * Memory pressure levels type
 */
export type MemoryPressure = "low" | "medium" | "high";
