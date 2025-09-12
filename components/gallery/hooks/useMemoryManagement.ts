import { useCallback, useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

interface UseMemoryManagementProps {
  onMemoryWarning?: () => void;
  onAppBackground?: () => void;
  onAppForeground?: () => void;
}

interface MemoryStats {
  usedMemory: number;
  freeMemory: number;
  totalMemory: number;
  memoryPressure: "low" | "medium" | "high";
}

export const useMemoryManagement = ({
  onMemoryWarning,
  onAppBackground,
  onAppForeground,
}: UseMemoryManagementProps = {}) => {
  const memoryCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const lastMemoryCheck = useRef<number>(0);
  const memoryStats = useRef<MemoryStats>({
    usedMemory: 0,
    freeMemory: 0,
    totalMemory: 0,
    memoryPressure: "low",
  });

  // Check memory usage (simplified version)
  const checkMemoryUsage = useCallback(() => {
    const now = Date.now();

    // Only check every 5 seconds to avoid performance impact
    if (now - lastMemoryCheck.current < 5000) {
      return;
    }

    lastMemoryCheck.current = now;

    // In a real app, you'd use native modules to get actual memory stats
    // For now, we'll use a simplified approach
    try {
      // This is a placeholder - in production you'd use:
      // - react-native-device-info for memory stats
      // - react-native-memory-info for detailed memory monitoring
      // - Native modules for platform-specific memory management

      const estimatedMemoryUsage = performance.memory?.usedJSHeapSize || 0;
      const estimatedMemoryLimit =
        performance.memory?.totalJSHeapSize || 100 * 1024 * 1024; // 100MB default

      const memoryUsagePercent =
        (estimatedMemoryUsage / estimatedMemoryLimit) * 100;

      let memoryPressure: "low" | "medium" | "high" = "low";
      if (memoryUsagePercent > 80) {
        memoryPressure = "high";
      } else if (memoryUsagePercent > 60) {
        memoryPressure = "medium";
      }

      memoryStats.current = {
        usedMemory: estimatedMemoryUsage,
        freeMemory: estimatedMemoryLimit - estimatedMemoryUsage,
        totalMemory: estimatedMemoryLimit,
        memoryPressure,
      };

      // Trigger memory warning if pressure is high
      if (memoryPressure === "high" && onMemoryWarning) {
        console.warn("🚨 High memory pressure detected");
        onMemoryWarning();
      }
    } catch (error) {
      console.warn("Memory check failed:", error);
    }
  }, [onMemoryWarning]);

  // Handle app state changes
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === "background") {
        console.log("📱 App backgrounded - cleaning up resources");
        onAppBackground?.();

        // Stop memory monitoring when backgrounded
        if (memoryCheckInterval.current) {
          clearInterval(memoryCheckInterval.current);
          memoryCheckInterval.current = null;
        }
      } else if (nextAppState === "active") {
        console.log("📱 App foregrounded - resuming monitoring");
        onAppForeground?.();

        // Resume memory monitoring
        if (!memoryCheckInterval.current) {
          memoryCheckInterval.current = setInterval(checkMemoryUsage, 10000); // Check every 10 seconds
        }
      }
    },
    [checkMemoryUsage, onAppBackground, onAppForeground]
  );

  // Start memory monitoring
  useEffect(() => {
    // Start monitoring when component mounts
    memoryCheckInterval.current = setInterval(checkMemoryUsage, 10000);

    // Listen to app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      // Cleanup on unmount
      if (memoryCheckInterval.current) {
        clearInterval(memoryCheckInterval.current);
        memoryCheckInterval.current = null;
      }
      subscription?.remove();
    };
  }, [checkMemoryUsage, handleAppStateChange]);

  // Force garbage collection (if available)
  const forceGarbageCollection = useCallback(() => {
    try {
      if (global.gc) {
        global.gc();
        console.log("🗑️ Forced garbage collection");
      } else {
        console.log("⚠️ Garbage collection not available");
      }
    } catch (error) {
      console.warn("Garbage collection failed:", error);
    }
  }, []);

  // Get current memory stats
  const getMemoryStats = useCallback(() => {
    return { ...memoryStats.current };
  }, []);

  // Check if memory pressure is high
  const isMemoryPressureHigh = useCallback(() => {
    return memoryStats.current.memoryPressure === "high";
  }, []);

  return {
    getMemoryStats,
    isMemoryPressureHigh,
    forceGarbageCollection,
    checkMemoryUsage,
  };
};
