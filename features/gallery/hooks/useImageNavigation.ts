import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  runOnJS,
  SharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import {
  MAX_EDGE_DRAG,
  SWIPE_THRESHOLD,
  VELOCITY_THRESHOLD,
} from "../constants/gestureConstants";
import { GestureEvent, UseImageNavigationReturn } from "../types/gallery.types";

const { width: screenWidth } = Dimensions.get("window");

interface UseImageNavigationProps {
  currentIndex: number;
  imagesLength: number;
  translateX: SharedValue<number>;
  onIndexChange: (newIndex: number) => void;
}

/**
 * useImageNavigation - Custom hook for handling image navigation gestures and animations
 *
 * This hook provides gesture-based navigation for the image gallery, including
 * pan gestures for swiping between images, haptic feedback, and smooth animations.
 *
 * Features:
 * - Real-time dragging with visual feedback
 * - Swipe threshold detection for navigation
 * - Edge resistance when reaching first/last images
 * - Haptic feedback for user interactions
 * - Smooth spring animations
 *
 * @param {UseImageNavigationProps} params - The hook parameters
 * @param {number} params.currentIndex - Current image index
 * @param {number} params.imagesLength - Total number of images
 * @param {SharedValue<number>} params.translateX - Shared value for carousel translation
 * @param {(newIndex: number) => void} params.onIndexChange - Callback for index changes
 *
 * @returns {UseImageNavigationReturn} Object containing navigation functions and gestures
 * @returns {(index: number) => void} returns.goToImage - Function to navigate to specific image
 * @returns {PanGesture} returns.panGesture - Pan gesture handler for swiping
 *
 * @example
 * ```tsx
 * const { goToImage, panGesture } = useImageNavigation({
 *   currentIndex: 0,
 *   imagesLength: 5,
 *   translateX: translateXValue,
 *   onIndexChange: setCurrentIndex
 * });
 * ```
 */
export const useImageNavigation = ({
  currentIndex,
  imagesLength,
  translateX,
  onIndexChange,
}: UseImageNavigationProps): UseImageNavigationReturn => {
  const goToImage = useCallback(
    (index: number) => {
      const targetX = -index * screenWidth;
      onIndexChange(index);
      translateX.value = withTiming(targetX, { duration: 300 });

      // Haptic feedback for thumbnail clicks
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [translateX, onIndexChange]
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      "worklet";
      // Initialize gesture - no state updates needed here
    })
    .onUpdate((event: GestureEvent) => {
      "worklet";
      // Real-time dragging: move the carousel with finger movement
      // Pre-calculate bounds once for better performance
      const baseX = -currentIndex * screenWidth;
      const newX = baseX + event.translationX;
      const minX = -(imagesLength - 1) * screenWidth;
      const maxX = 0;

      // Optimized edge drag feedback - simplified calculations
      if (newX > maxX) {
        // At first image - allow small drag for visual feedback
        translateX.value = maxX + Math.min(event.translationX, MAX_EDGE_DRAG);
      } else if (newX < minX) {
        // At last image - allow small drag for visual feedback
        const offsetFromMin = event.translationX - (minX - baseX);
        translateX.value = minX + Math.max(offsetFromMin, -MAX_EDGE_DRAG);
      } else {
        // Normal dragging - direct assignment for best performance
        translateX.value = newX;
      }
    })
    .onEnd((event: GestureEvent) => {
      "worklet";
      const velocity = event.velocityX;
      const translation = event.translationX;

      // Calculate which image we should snap to
      let targetIndex = currentIndex;
      let shouldTriggerHaptic = false;
      let hapticType: "success" | "warning" = "success";

      if (translation > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
        // Swipe right - go to previous image
        if (currentIndex > 0) {
          targetIndex = currentIndex - 1;
          shouldTriggerHaptic = true;
        } else {
          // Edge bounce effect - at first image
          shouldTriggerHaptic = true;
          hapticType = "warning";
        }
      } else if (
        translation < -SWIPE_THRESHOLD ||
        velocity < -VELOCITY_THRESHOLD
      ) {
        // Swipe left - go to next image
        if (currentIndex < imagesLength - 1) {
          targetIndex = currentIndex + 1;
          shouldTriggerHaptic = true;
        } else {
          // Edge bounce effect - at last image
          shouldTriggerHaptic = true;
          hapticType = "warning";
        }
      }

      // Trigger haptic feedback immediately (non-blocking)
      if (shouldTriggerHaptic) {
        if (hapticType === "success") {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        } else {
          runOnJS(Haptics.notificationAsync)(
            Haptics.NotificationFeedbackType.Warning
          );
        }
      }

      // Animate to the target position with optimized spring for smoother feel
      // Tuned parameters for 60fps: lower damping = more responsive, higher stiffness = faster
      const targetX = -targetIndex * screenWidth;
      translateX.value = withSpring(
        targetX,
        {
          damping: 15, // Reduced from 20 for more responsive feel
          stiffness: 400, // Increased from 300 for faster animation
          mass: 0.3, // Reduced from 0.5 for lighter feel
          velocity: velocity * 0.001, // Use gesture velocity for natural feel
        },
        (finished) => {
          "worklet";
          // Only update state AFTER animation completes to avoid blocking UI thread
          if (finished && targetIndex !== currentIndex) {
            runOnJS(onIndexChange)(targetIndex);
          }
        }
      );
    });

  return {
    goToImage,
    panGesture,
  };
};
