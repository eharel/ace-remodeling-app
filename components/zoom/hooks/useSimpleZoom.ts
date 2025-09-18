import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  UseZoomReturn,
  ZOOM_CONSTANTS,
  ZoomConfig,
  ZoomState,
} from "../types/zoom.types";

interface UseSimpleZoomProps {
  config?: Partial<ZoomConfig>;
  onZoomChange?: (state: ZoomState) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
}

export const useSimpleZoom = ({
  config: userConfig = {},
  onZoomChange,
  onZoomStart,
  onZoomEnd,
}: UseSimpleZoomProps = {}): UseZoomReturn => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // Merge user config with defaults
  const config: ZoomConfig = {
    ...ZOOM_CONSTANTS,
    ...userConfig,
    panBounds: {
      minX: -screenWidth * 2,
      maxX: screenWidth * 2,
      minY: -screenHeight * 2,
      maxY: screenHeight * 2,
    },
  };

  // Shared values
  const scale = useSharedValue(config.initialScale!);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isZoomed = useSharedValue(false);
  const isPanning = useSharedValue(false);
  const isZooming = useSharedValue(false);

  // Saved values for gesture handling
  const savedScale = useRef(config.initialScale!);
  const savedTranslateX = useRef(0);
  const savedTranslateY = useRef(0);

  // Update config
  const updateConfig = useCallback(
    (newConfig: Partial<ZoomConfig>) => {
      Object.assign(config, newConfig);
    },
    [config]
  );

  // Reset zoom to initial state
  const resetZoom = useCallback(() => {
    scale.value = withSpring(config.initialScale!, {
      damping: 15,
      stiffness: 150,
    });
    translateX.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    isZoomed.value = false;
    isPanning.value = false;
    isZooming.value = false;

    savedScale.current = config.initialScale!;
    savedTranslateX.current = 0;
    savedTranslateY.current = 0;
  }, [
    config.initialScale,
    scale,
    translateX,
    translateY,
    isZoomed,
    isPanning,
    isZooming,
  ]);

  // Set zoom to specific scale
  const setZoom = useCallback(
    (newScale: number, centerX?: number, centerY?: number) => {
      const clampedScale = Math.max(
        config.minScale!,
        Math.min(config.maxScale!, newScale)
      );

      const centerXValue = centerX ?? screenWidth / 2;
      const centerYValue = centerY ?? screenHeight / 2;

      // Calculate translation to keep the focal point in place
      const scaleDiff = clampedScale - scale.value;
      const newTranslateX =
        translateX.value - (centerXValue - screenWidth / 2) * scaleDiff;
      const newTranslateY =
        translateY.value - (centerYValue - screenHeight / 2) * scaleDiff;

      scale.value = withSpring(clampedScale, {
        damping: 15,
        stiffness: 150,
      });
      translateX.value = withSpring(newTranslateX, {
        damping: 15,
        stiffness: 150,
      });
      translateY.value = withSpring(newTranslateY, {
        damping: 15,
        stiffness: 150,
      });

      isZoomed.value = clampedScale > config.minScale!;
      savedScale.current = clampedScale;
      savedTranslateX.current = newTranslateX;
      savedTranslateY.current = newTranslateY;
    },
    [config.minScale, config.maxScale, scale, translateX, translateY, isZoomed]
  );

  // Zoom in
  const zoomIn = useCallback(
    (centerX?: number, centerY?: number) => {
      const newScale = Math.min(config.maxScale!, scale.value * 1.5);
      setZoom(newScale, centerX, centerY);
    },
    [config.maxScale, scale.value, setZoom]
  );

  // Zoom out
  const zoomOut = useCallback(
    (centerX?: number, centerY?: number) => {
      const newScale = Math.max(config.minScale!, scale.value / 1.5);
      setZoom(newScale, centerX, centerY);
    },
    [config.minScale, scale.value, setZoom]
  );

  // Toggle zoom (double-tap behavior)
  const toggleZoom = useCallback(
    (centerX?: number, centerY?: number) => {
      if (isZoomed.value) {
        resetZoom();
      } else {
        setZoom(config.doubleTapScale!, centerX, centerY);
      }
    },
    [isZoomed.value, resetZoom, setZoom, config.doubleTapScale]
  );

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .enabled(config.enablePinch!)
    .onStart(() => {
      savedScale.current = scale.value;
      savedTranslateX.current = translateX.value;
      savedTranslateY.current = translateY.value;
      isZooming.value = true;
      runOnJS(onZoomStart)?.();
    })
    .onUpdate((event) => {
      const newScale = savedScale.current * event.scale;
      const clampedScale = Math.max(
        config.minScale!,
        Math.min(config.maxScale!, newScale)
      );

      scale.value = clampedScale;
      isZoomed.value = clampedScale > config.minScale!;
    })
    .onEnd(() => {
      const finalScale = Math.max(
        config.minScale!,
        Math.min(config.maxScale!, scale.value)
      );

      scale.value = withSpring(finalScale, {
        damping: 15,
        stiffness: 150,
      });

      isZoomed.value = finalScale > config.minScale!;
      isZooming.value = false;

      // If zoomed out to minimum, reset translation
      if (finalScale <= config.minScale!) {
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        savedTranslateX.current = 0;
        savedTranslateY.current = 0;
      }

      savedScale.current = finalScale;
      runOnJS(onZoomEnd)?.();
    });

  // Pan gesture - only work when zoomed in
  const panGesture = Gesture.Pan()
    .enabled(config.enablePan!)
    .onStart(() => {
      // Only start panning if we're zoomed in
      if (isZoomed.value) {
        savedTranslateX.current = translateX.value;
        savedTranslateY.current = translateY.value;
        isPanning.value = true;
      }
    })
    .onUpdate((event) => {
      // Only pan if we're zoomed in
      if (isZoomed.value) {
        const newTranslateX = savedTranslateX.current + event.translationX;
        const newTranslateY = savedTranslateY.current + event.translationY;

        // Apply pan bounds
        const clampedX = Math.max(
          config.panBounds!.minX!,
          Math.min(config.panBounds!.maxX!, newTranslateX)
        );
        const clampedY = Math.max(
          config.panBounds!.minY!,
          Math.min(config.panBounds!.maxY!, newTranslateY)
        );

        translateX.value = clampedX;
        translateY.value = clampedY;
      }
    })
    .onEnd(() => {
      isPanning.value = false;
      savedTranslateX.current = translateX.value;
      savedTranslateY.current = translateY.value;
    });

  // Double-tap gesture
  const doubleTapGesture = Gesture.Tap()
    .enabled(config.enableDoubleTap!)
    .numberOfTaps(2)
    .onStart((event) => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      toggleZoom(event.x, event.y);
    });

  // Combine gestures - use Simultaneous so they can work together
  const combinedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture
  );

  // Animated style for the zoomable content
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Get current state - this should only be called from worklets
  const getCurrentState = useCallback((): ZoomState => {
    return {
      scale: scale.value,
      translateX: translateX.value,
      translateY: translateY.value,
      isZoomed: isZoomed.value,
      isPanning: isPanning.value,
      isZooming: isZooming.value,
    };
  }, []);

  // Check if at min/max scale - these should only be called from worklets
  const isAtMinScale = useCallback(() => {
    return scale.value <= config.minScale!;
  }, [config.minScale]);

  const isAtMaxScale = useCallback(() => {
    return scale.value >= config.maxScale!;
  }, [config.maxScale]);

  return {
    // Shared values
    scale,
    translateX,
    translateY,
    isZoomed,
    isPanning,
    isZooming,

    // Gesture handlers
    pinchGesture: combinedGesture,
    panGesture,
    doubleTapGesture,

    // Actions
    resetZoom,
    setZoom,
    zoomIn,
    zoomOut,
    toggleZoom,

    // Utilities
    getCurrentState,
    isAtMinScale,
    isAtMaxScale,

    // Configuration
    config,
    updateConfig,

    // Animated style
    animatedStyle,
  };
};
