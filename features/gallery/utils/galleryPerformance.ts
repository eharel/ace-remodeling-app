import {
  PerformanceMetrics,
  PerformanceStats,
} from "../types/gallery.types";

/**
 * Performance calculation utilities for image gallery
 *
 * These are pure functions that can be easily tested and reused
 * across different performance monitoring implementations.
 */

/**
 * Performance scoring thresholds and weights
 */
export const PERFORMANCE_THRESHOLDS = {
  /** Target render time for 60fps (16.67ms) */
  TARGET_RENDER_TIME: 16,
  /** Target image load time for good UX */
  TARGET_IMAGE_LOAD_TIME: 500,
  /** Target frame rate for smooth animations */
  TARGET_FRAME_RATE: 50,
  /** Target gesture response time for responsiveness */
  TARGET_GESTURE_RESPONSE_TIME: 100,
} as const;

/**
 * Performance penalty weights for scoring
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
 * Calculates performance score based on current metrics
 *
 * @param stats - Current performance statistics
 * @returns Performance score from 0-100 (100 = perfect)
 *
 * @example
 * ```typescript
 * const score = calculatePerformanceScore({
 *   averageRenderTime: 12,
 *   averageImageLoadTime: 300,
 *   averageFrameRate: 55,
 *   averageGestureResponseTime: 80,
 *   totalRenders: 10,
 *   totalImageLoads: 5,
 *   performanceScore: 0
 * });
 * // Returns: ~95 (good performance)
 * ```
 */
export function calculatePerformanceScore(stats: PerformanceStats): number {
  let score = 100;

  // Penalize slow renders (target: <16ms for 60fps)
  if (stats.averageRenderTime > PERFORMANCE_THRESHOLDS.TARGET_RENDER_TIME) {
    const penalty = Math.min(
      PERFORMANCE_PENALTIES.MAX_RENDER_PENALTY,
      (stats.averageRenderTime - PERFORMANCE_THRESHOLDS.TARGET_RENDER_TIME) * 2
    );
    score -= penalty;
  }

  // Penalize slow image loads (target: <500ms)
  if (
    stats.averageImageLoadTime > PERFORMANCE_THRESHOLDS.TARGET_IMAGE_LOAD_TIME
  ) {
    const penalty = Math.min(
      PERFORMANCE_PENALTIES.MAX_IMAGE_LOAD_PENALTY,
      (stats.averageImageLoadTime -
        PERFORMANCE_THRESHOLDS.TARGET_IMAGE_LOAD_TIME) /
        50
    );
    score -= penalty;
  }

  // Penalize low frame rate (target: >50fps)
  if (stats.averageFrameRate < PERFORMANCE_THRESHOLDS.TARGET_FRAME_RATE) {
    const penalty = Math.min(
      PERFORMANCE_PENALTIES.MAX_FRAME_RATE_PENALTY,
      (PERFORMANCE_THRESHOLDS.TARGET_FRAME_RATE - stats.averageFrameRate) * 2
    );
    score -= penalty;
  }

  // Penalize slow gesture response (target: <100ms)
  if (
    stats.averageGestureResponseTime >
    PERFORMANCE_THRESHOLDS.TARGET_GESTURE_RESPONSE_TIME
  ) {
    const penalty = Math.min(
      PERFORMANCE_PENALTIES.MAX_GESTURE_PENALTY,
      (stats.averageGestureResponseTime -
        PERFORMANCE_THRESHOLDS.TARGET_GESTURE_RESPONSE_TIME) /
        10
    );
    score -= penalty;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculates average metrics from recent performance data
 *
 * @param metrics - Array of recent performance metrics
 * @param frameRateHistory - Array of recent frame rate measurements
 * @param totalRenders - Total number of renders
 * @param totalImageLoads - Total number of image loads
 * @returns Calculated performance statistics
 *
 * @example
 * ```typescript
 * const stats = calculateAverageMetrics(
 *   recentMetrics,
 *   frameRateHistory,
 *   10,
 *   5
 * );
 * ```
 */
export function calculateAverageMetrics(
  metrics: PerformanceMetrics[],
  frameRateHistory: number[],
  totalRenders: number,
  totalImageLoads: number
): Omit<PerformanceStats, "performanceScore"> {
  const recentMetrics = metrics.slice(-50); // Last 50 measurements

  const renderMetrics = recentMetrics.filter((m) => m.renderTime > 0);
  const imageLoadMetrics = recentMetrics.filter((m) => m.imageLoadTime > 0);
  const gestureMetrics = recentMetrics.filter((m) => m.gestureResponseTime > 0);
  const memoryMetrics = recentMetrics.filter((m) => m.memoryUsage > 0);

  const averageRenderTime =
    renderMetrics.length > 0
      ? renderMetrics.reduce((sum, m) => sum + m.renderTime, 0) /
        renderMetrics.length
      : 0;

  const averageImageLoadTime =
    imageLoadMetrics.length > 0
      ? imageLoadMetrics.reduce((sum, m) => sum + m.imageLoadTime, 0) /
        imageLoadMetrics.length
      : 0;

  const averageFrameRate =
    frameRateHistory.length > 0
      ? frameRateHistory.reduce((sum, fps) => sum + fps, 0) /
        frameRateHistory.length
      : 0;

  const averageGestureResponseTime =
    gestureMetrics.length > 0
      ? gestureMetrics.reduce((sum, m) => sum + m.gestureResponseTime, 0) /
        gestureMetrics.length
      : 0;

  const averageMemoryUsage =
    memoryMetrics.length > 0
      ? memoryMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) /
        memoryMetrics.length
      : 0;

  return {
    averageRenderTime,
    averageImageLoadTime,
    averageMemoryUsage,
    averageFrameRate,
    averageGestureResponseTime,
    totalRenders,
    totalImageLoads,
  };
}

/**
 * Generates performance recommendations based on current stats
 *
 * @param stats - Current performance statistics
 * @returns Array of recommendation strings
 *
 * @example
 * ```typescript
 * const recommendations = getPerformanceRecommendations(stats);
 * if (recommendations.length > 0) {
 *   console.warn("Performance issues:", recommendations);
 * }
 * ```
 */
export function getPerformanceRecommendations(
  stats: PerformanceStats
): string[] {
  const recommendations: string[] = [];

  if (stats.averageRenderTime > PERFORMANCE_THRESHOLDS.TARGET_RENDER_TIME) {
    recommendations.push("Consider reducing image sizes or using lazy loading");
  }

  if (
    stats.averageImageLoadTime > PERFORMANCE_THRESHOLDS.TARGET_IMAGE_LOAD_TIME
  ) {
    recommendations.push("Implement image preloading for better performance");
  }

  if (stats.averageFrameRate < PERFORMANCE_THRESHOLDS.TARGET_FRAME_RATE) {
    recommendations.push("Reduce animation complexity or optimize rendering");
  }

  if (
    stats.averageGestureResponseTime >
    PERFORMANCE_THRESHOLDS.TARGET_GESTURE_RESPONSE_TIME
  ) {
    recommendations.push("Optimize gesture handling for better responsiveness");
  }

  if (stats.performanceScore < 70) {
    recommendations.push("Overall performance needs improvement");
  }

  return recommendations;
}

/**
 * Creates a default performance stats object
 *
 * @returns Default performance statistics
 */
export function createDefaultPerformanceStats(): PerformanceStats {
  return {
    averageRenderTime: 0,
    averageImageLoadTime: 0,
    averageMemoryUsage: 0,
    averageFrameRate: 0,
    averageGestureResponseTime: 0,
    totalRenders: 0,
    totalImageLoads: 0,
    performanceScore: 100,
  };
}
