import { useCallback, useEffect, useRef, useState } from "react";
import {
  calculateAverageMetrics,
  calculatePerformanceScore,
  createDefaultPerformanceStats,
  getPerformanceRecommendations,
} from "../utils/galleryPerformance";
import { PerformanceMetrics, PerformanceStats } from "../types/gallery.types";

/**
 * usePerformanceMonitoring - Custom hook for monitoring gallery performance metrics
 *
 * This hook tracks various performance metrics for the image gallery including
 * render times, image load times, frame rates, and gesture response times.
 * It provides performance recommendations and scoring.
 *
 * Features:
 * - Tracks render performance and timing
 * - Monitors image loading performance
 * - Measures frame rate and animation performance
 * - Tracks gesture response times
 * - Provides performance scoring (0-100)
 * - Offers performance recommendations
 * - Automatic cleanup and resource management
 *
 * @returns {Object} Object containing performance monitoring utilities
 * @returns {PerformanceStats} returns.stats - Current performance statistics
 * @returns {() => void} returns.startRenderTiming - Start timing a render operation
 * @returns {() => void} returns.endRenderTiming - End timing a render operation
 * @returns {() => void} returns.startImageLoadTiming - Start timing an image load
 * @returns {() => void} returns.endImageLoadTiming - End timing an image load
 * @returns {() => void} returns.startGestureTiming - Start timing a gesture response
 * @returns {() => void} returns.endGestureTiming - End timing a gesture response
 * @returns {() => string[]} returns.getPerformanceRecommendations - Get performance recommendations
 * @returns {() => void} returns.resetMetrics - Reset all performance metrics
 *
 * @example
 * ```tsx
 * const {
 *   stats,
 *   startRenderTiming,
 *   endRenderTiming,
 *   getPerformanceRecommendations
 * } = usePerformanceMonitoring();
 *
 * // Time a render operation
 * startRenderTiming();
 * // ... render logic ...
 * endRenderTiming();
 *
 * // Check performance score
 * if (stats.performanceScore < 70) {
 *   const recommendations = getPerformanceRecommendations();
 *   console.warn("Performance issues:", recommendations);
 * }
 * ```
 */
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [stats, setStats] = useState<PerformanceStats>(
    createDefaultPerformanceStats()
  );

  const frameCount = useRef(0);
  const lastFrameTime = useRef(0);
  const frameRateHistory = useRef<number[]>([]);
  const renderStartTime = useRef(0);
  const imageLoadStartTime = useRef(0);
  const gestureStartTime = useRef(0);

  // Start render timing
  const startRenderTiming = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // End render timing
  const endRenderTiming = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;

    setMetrics((prev) => [
      ...prev,
      {
        renderTime,
        imageLoadTime: 0,
        memoryUsage: 0,
        frameRate: 0,
        gestureResponseTime: 0,
      },
    ]);

    setStats((prev) => ({
      ...prev,
      totalRenders: prev.totalRenders + 1,
    }));
  }, []);

  // Start image load timing
  const startImageLoadTiming = useCallback(() => {
    imageLoadStartTime.current = performance.now();
  }, []);

  // End image load timing
  const endImageLoadTiming = useCallback(() => {
    const imageLoadTime = performance.now() - imageLoadStartTime.current;

    setMetrics((prev) => [
      ...prev,
      {
        renderTime: 0,
        imageLoadTime,
        memoryUsage: 0,
        frameRate: 0,
        gestureResponseTime: 0,
      },
    ]);

    setStats((prev) => ({
      ...prev,
      totalImageLoads: prev.totalImageLoads + 1,
    }));
  }, []);

  // Start gesture timing
  const startGestureTiming = useCallback(() => {
    gestureStartTime.current = performance.now();
  }, []);

  // End gesture timing
  const endGestureTiming = useCallback(() => {
    const gestureResponseTime = performance.now() - gestureStartTime.current;

    setMetrics((prev) => [
      ...prev,
      {
        renderTime: 0,
        imageLoadTime: 0,
        memoryUsage: 0,
        frameRate: 0,
        gestureResponseTime,
      },
    ]);
  }, []);

  // Measure frame rate
  const measureFrameRate = useCallback(() => {
    const now = performance.now();

    if (lastFrameTime.current > 0) {
      const deltaTime = now - lastFrameTime.current;
      const fps = 1000 / deltaTime;

      frameRateHistory.current.push(fps);

      // Keep only last 60 frames
      if (frameRateHistory.current.length > 60) {
        frameRateHistory.current.shift();
      }

      setMetrics((prev) => [
        ...prev,
        {
          renderTime: 0,
          imageLoadTime: 0,
          memoryUsage: 0,
          frameRate: fps,
          gestureResponseTime: 0,
        },
      ]);
    }

    lastFrameTime.current = now;
    frameCount.current++;
  }, []);

  // Calculate performance score using utility function
  const calculatePerformanceScoreCallback = useCallback(
    (currentStats: PerformanceStats): number => {
      return calculatePerformanceScore(currentStats);
    },
    []
  );

  // Update statistics using utility functions
  useEffect(() => {
    if (metrics.length === 0) return;

    const baseStats = calculateAverageMetrics(
      metrics,
      frameRateHistory.current,
      stats.totalRenders,
      stats.totalImageLoads
    );

    const newStats: PerformanceStats = {
      ...baseStats,
      performanceScore: calculatePerformanceScore(baseStats),
    };

    setStats(newStats);
  }, [
    metrics,
    stats.totalRenders,
    stats.totalImageLoads,
    calculatePerformanceScoreCallback,
  ]);

  // Start frame rate monitoring
  useEffect(() => {
    let animationFrameId: number;

    const measureFrame = () => {
      measureFrameRate();
      animationFrameId = requestAnimationFrame(measureFrame);
    };

    animationFrameId = requestAnimationFrame(measureFrame);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [measureFrameRate]);

  // Get performance recommendations using utility function
  const getPerformanceRecommendationsCallback = useCallback(() => {
    return getPerformanceRecommendations(stats);
  }, [stats]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics([]);
    setStats(createDefaultPerformanceStats());
    frameRateHistory.current = [];
  }, []);

  return {
    stats,
    startRenderTiming,
    endRenderTiming,
    startImageLoadTiming,
    endImageLoadTiming,
    startGestureTiming,
    endGestureTiming,
    getPerformanceRecommendations: getPerformanceRecommendationsCallback,
    resetMetrics,
  };
};
