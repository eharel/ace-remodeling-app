import { useCallback, useEffect, useRef, useState } from "react";

interface PerformanceMetrics {
  renderTime: number;
  imageLoadTime: number;
  memoryUsage: number;
  frameRate: number;
  gestureResponseTime: number;
}

interface PerformanceStats {
  averageRenderTime: number;
  averageImageLoadTime: number;
  averageMemoryUsage: number;
  averageFrameRate: number;
  averageGestureResponseTime: number;
  totalRenders: number;
  totalImageLoads: number;
  performanceScore: number; // 0-100
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [stats, setStats] = useState<PerformanceStats>({
    averageRenderTime: 0,
    averageImageLoadTime: 0,
    averageMemoryUsage: 0,
    averageFrameRate: 0,
    averageGestureResponseTime: 0,
    totalRenders: 0,
    totalImageLoads: 0,
    performanceScore: 100,
  });

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

  // Calculate performance score
  const calculatePerformanceScore = useCallback(
    (currentStats: PerformanceStats): number => {
      let score = 100;

      // Penalize slow renders (target: <16ms for 60fps)
      if (currentStats.averageRenderTime > 16) {
        score -= Math.min(30, (currentStats.averageRenderTime - 16) * 2);
      }

      // Penalize slow image loads (target: <500ms)
      if (currentStats.averageImageLoadTime > 500) {
        score -= Math.min(20, (currentStats.averageImageLoadTime - 500) / 50);
      }

      // Penalize low frame rate (target: >50fps)
      if (currentStats.averageFrameRate < 50) {
        score -= Math.min(25, (50 - currentStats.averageFrameRate) * 2);
      }

      // Penalize slow gesture response (target: <100ms)
      if (currentStats.averageGestureResponseTime > 100) {
        score -= Math.min(
          15,
          (currentStats.averageGestureResponseTime - 100) / 10
        );
      }

      return Math.max(0, Math.min(100, score));
    },
    []
  );

  // Update statistics
  useEffect(() => {
    if (metrics.length === 0) return;

    const recentMetrics = metrics.slice(-50); // Last 50 measurements

    const averageRenderTime =
      recentMetrics
        .filter((m) => m.renderTime > 0)
        .reduce((sum, m) => sum + m.renderTime, 0) /
      Math.max(1, recentMetrics.filter((m) => m.renderTime > 0).length);

    const averageImageLoadTime =
      recentMetrics
        .filter((m) => m.imageLoadTime > 0)
        .reduce((sum, m) => sum + m.imageLoadTime, 0) /
      Math.max(1, recentMetrics.filter((m) => m.imageLoadTime > 0).length);

    const averageFrameRate =
      frameRateHistory.current.length > 0
        ? frameRateHistory.current.reduce((sum, fps) => sum + fps, 0) /
          frameRateHistory.current.length
        : 0;

    const averageGestureResponseTime =
      recentMetrics
        .filter((m) => m.gestureResponseTime > 0)
        .reduce((sum, m) => sum + m.gestureResponseTime, 0) /
      Math.max(
        1,
        recentMetrics.filter((m) => m.gestureResponseTime > 0).length
      );

    const averageMemoryUsage =
      recentMetrics
        .filter((m) => m.memoryUsage > 0)
        .reduce((sum, m) => sum + m.memoryUsage, 0) /
      Math.max(1, recentMetrics.filter((m) => m.memoryUsage > 0).length);

    const newStats: PerformanceStats = {
      averageRenderTime: averageRenderTime || 0,
      averageImageLoadTime: averageImageLoadTime || 0,
      averageMemoryUsage: averageMemoryUsage || 0,
      averageFrameRate: averageFrameRate || 0,
      averageGestureResponseTime: averageGestureResponseTime || 0,
      totalRenders: stats.totalRenders,
      totalImageLoads: stats.totalImageLoads,
      performanceScore: 0,
    };

    newStats.performanceScore = calculatePerformanceScore(newStats);

    setStats(newStats);
  }, [
    metrics,
    stats.totalRenders,
    stats.totalImageLoads,
    calculatePerformanceScore,
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

  // Get performance recommendations
  const getPerformanceRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (stats.averageRenderTime > 16) {
      recommendations.push(
        "Consider reducing image sizes or using lazy loading"
      );
    }

    if (stats.averageImageLoadTime > 500) {
      recommendations.push("Implement image preloading for better performance");
    }

    if (stats.averageFrameRate < 50) {
      recommendations.push("Reduce animation complexity or optimize rendering");
    }

    if (stats.averageGestureResponseTime > 100) {
      recommendations.push(
        "Optimize gesture handling for better responsiveness"
      );
    }

    if (stats.performanceScore < 70) {
      recommendations.push("Overall performance needs improvement");
    }

    return recommendations;
  }, [stats]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics([]);
    setStats({
      averageRenderTime: 0,
      averageImageLoadTime: 0,
      averageMemoryUsage: 0,
      averageFrameRate: 0,
      averageGestureResponseTime: 0,
      totalRenders: 0,
      totalImageLoads: 0,
      performanceScore: 100,
    });
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
    getPerformanceRecommendations,
    resetMetrics,
  };
};
