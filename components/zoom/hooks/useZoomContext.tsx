import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  ZOOM_CONSTANTS,
  ZoomConfig,
  ZoomContextValue,
} from "../types/zoom.types";

const ZoomContext = createContext<ZoomContextValue | undefined>(undefined);

interface ZoomProviderProps {
  children: React.ReactNode;
  globalConfig?: Partial<ZoomConfig>;
}

export const ZoomProvider: React.FC<ZoomProviderProps> = ({
  children,
  globalConfig: initialGlobalConfig = {},
}) => {
  // Global zoom configuration
  const [globalConfig, setGlobalConfig] = useState<ZoomConfig>({
    minScale: ZOOM_CONSTANTS.DEFAULT_MIN_SCALE,
    maxScale: ZOOM_CONSTANTS.DEFAULT_MAX_SCALE,
    initialScale: ZOOM_CONSTANTS.DEFAULT_INITIAL_SCALE,
    doubleTapScale: ZOOM_CONSTANTS.DEFAULT_DOUBLE_TAP_SCALE,
    animationDuration: ZOOM_CONSTANTS.DEFAULT_ANIMATION_DURATION,
    enablePan: true,
    enablePinch: true,
    enableDoubleTap: true,
    ...initialGlobalConfig,
  });

  // Track active zoom instances
  const activeZoomInstances = useRef<Set<string>>(new Set());
  const zoomStates = useRef<Map<string, any>>(new Map());

  // Update global configuration
  const updateGlobalConfig = useCallback((newConfig: Partial<ZoomConfig>) => {
    setGlobalConfig((prev) => ({
      ...prev,
      ...newConfig,
    }));
  }, []);

  // Register a zoom instance
  const registerZoomInstance = useCallback((id: string, state: any) => {
    activeZoomInstances.current.add(id);
    zoomStates.current.set(id, state);
  }, []);

  // Unregister a zoom instance
  const unregisterZoomInstance = useCallback((id: string) => {
    activeZoomInstances.current.delete(id);
    zoomStates.current.delete(id);
  }, []);

  // Reset all zoom instances
  const resetAllZoom = useCallback(() => {
    zoomStates.current.forEach((state) => {
      if (state.resetZoom) {
        state.resetZoom();
      }
    });
  }, []);

  // Get zoom statistics
  const getZoomStats = useCallback(() => {
    const states = Array.from(zoomStates.current.values());
    const activeZoomCount = states.filter(
      (state) => state.isZoomed?.value || state.isZoomed
    ).length;
    const averageScale =
      states.length > 0
        ? states.reduce(
            (sum, state) => sum + (state.scale?.value || state.scale || 1),
            0
          ) / states.length
        : 1;

    return {
      activeZoomCount,
      averageScale,
      totalZoomedComponents: activeZoomInstances.current.size,
    };
  }, []);

  const contextValue: ZoomContextValue = {
    globalConfig,
    updateGlobalConfig,
    resetAllZoom,
    getZoomStats,
  };

  return (
    <ZoomContext.Provider value={contextValue}>{children}</ZoomContext.Provider>
  );
};

export const useZoomContext = (): ZoomContextValue => {
  const context = useContext(ZoomContext);
  if (context === undefined) {
    throw new Error("useZoomContext must be used within a ZoomProvider");
  }
  return context;
};
