import { Image } from "expo-image";
import React, { useEffect } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_IN_SCALE = 2;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.4,
};

interface ZoomableImageProps {
  uri: string;
  containerStyle: StyleProp<ViewStyle>;
  cachePolicy?: "memory-disk" | "disk" | "memory" | "none";
  priority?: "high" | "normal" | "low";
  recyclingKey?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onLoad?: () => void;
  onError?: () => void;
  /** Called whenever zoom state changes — used by carousel to block/enable paging */
  onZoomChange: (isZoomed: boolean) => void;
  /** True when this image is the active page in the carousel */
  isActive: boolean;
}

/**
 * ZoomableImage — wraps an expo-image with pinch-to-zoom, pan, and double-tap gestures.
 *
 * - Pinch: scales the image from 1× up to 5×, accumulated across gestures
 * - Pan: moves the image while zoomed in
 * - Double-tap: toggles between 1× and 2×
 * - When `isActive` becomes false (carousel navigated away), zoom auto-resets
 */
export function ZoomableImage({
  uri,
  containerStyle,
  cachePolicy = "memory-disk",
  priority = "normal",
  recyclingKey,
  accessibilityLabel,
  accessibilityHint,
  onLoad,
  onError,
  onZoomChange,
  isActive,
}: ZoomableImageProps) {
  // Current displayed values (animated)
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Saved baselines — updated at end of each gesture so next gesture starts from here
  const savedScale = useSharedValue(1);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Reset zoom when the carousel navigates away from this image
  useEffect(() => {
    if (!isActive) {
      scale.value = withSpring(MIN_SCALE, SPRING_CONFIG);
      translateX.value = withSpring(0, SPRING_CONFIG);
      translateY.value = withSpring(0, SPRING_CONFIG);
      savedScale.value = MIN_SCALE;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      onZoomChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // ─── Gestures ──────────────────────────────────────────────────────────────

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      "worklet";
      scale.value = Math.min(
        Math.max(savedScale.value * e.scale, MIN_SCALE),
        MAX_SCALE
      );
    })
    .onEnd(() => {
      "worklet";
      if (scale.value <= MIN_SCALE) {
        // Snap back to 1× if user pinched below minimum
        scale.value = withSpring(MIN_SCALE, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedScale.value = MIN_SCALE;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(onZoomChange)(false);
      } else {
        savedScale.value = scale.value;
        runOnJS(onZoomChange)(scale.value > MIN_SCALE);
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      "worklet";
      // Only translate while zoomed — when at 1× let FlatList handle horizontal swipes
      if (scale.value > MIN_SCALE) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      "worklet";
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      "worklet";
      if (scale.value > MIN_SCALE) {
        // Already zoomed — reset to 1×
        scale.value = withSpring(MIN_SCALE, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedScale.value = MIN_SCALE;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(onZoomChange)(false);
      } else {
        // At 1× — zoom to 2×
        scale.value = withSpring(ZOOM_IN_SCALE, SPRING_CONFIG);
        savedScale.value = ZOOM_IN_SCALE;
        runOnJS(onZoomChange)(true);
      }
    });

  // All three gestures run simultaneously — they respond to different input
  // patterns (2-finger spread, 1-finger drag, 2-tap) so they don't conflict
  const composed = Gesture.Simultaneous(
    doubleTapGesture,
    pinchGesture,
    panGesture
  );

  // ─── Animated style ────────────────────────────────────────────────────────

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[containerStyle, styles.animatedWrapper, animatedStyle]}>
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          cachePolicy={cachePolicy}
          priority={priority}
          recyclingKey={recyclingKey}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="image"
          onLoad={onLoad}
          onError={onError}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  animatedWrapper: {
    overflow: "hidden",
  },
});
