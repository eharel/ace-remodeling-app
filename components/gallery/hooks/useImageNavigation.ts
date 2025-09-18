import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS, SharedValue, withSpring } from "react-native-reanimated";

import {
  ANIMATION_CONFIG,
  EDGE_RESISTANCE,
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
      translateX.value = withSpring(targetX, ANIMATION_CONFIG);

      // Haptic feedback for thumbnail clicks
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [translateX, onIndexChange]
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event: GestureEvent) => {
      "worklet";
      // Real-time dragging: move the carousel with finger movement
      const baseX = -currentIndex * screenWidth;
      const newX = baseX + event.translationX;

      // Apply bounds to prevent over-scrolling
      const minX = -(imagesLength - 1) * screenWidth;
      const maxX = 0;

      // Clamp the translation within bounds
      if (newX > maxX) {
        // At first image - apply resistance
        translateX.value = maxX + event.translationX * EDGE_RESISTANCE;
      } else if (newX < minX) {
        // At last image - apply resistance
        translateX.value =
          minX + (event.translationX - (minX - baseX)) * EDGE_RESISTANCE;
      } else {
        // Normal dragging
        translateX.value = newX;
      }
    })
    .onEnd((event: GestureEvent) => {
      "worklet";
      const velocity = event.velocityX;
      const translation = event.translationX;

      // Calculate which image we should snap to
      let targetIndex = currentIndex;

      if (translation > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
        // Swipe right - go to previous image
        if (currentIndex > 0) {
          targetIndex = currentIndex - 1;
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        } else {
          // Edge bounce effect - at first image
          runOnJS(Haptics.notificationAsync)(
            Haptics.NotificationFeedbackType.Warning
          );
        }
      } else if (
        translation < -SWIPE_THRESHOLD ||
        velocity < -VELOCITY_THRESHOLD
      ) {
        // Swipe left - go to next image
        if (currentIndex < imagesLength - 1) {
          targetIndex = currentIndex + 1;
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        } else {
          // Edge bounce effect - at last image
          runOnJS(Haptics.notificationAsync)(
            Haptics.NotificationFeedbackType.Warning
          );
        }
      }

      // Update the index immediately for instant text updates
      if (targetIndex !== currentIndex) {
        runOnJS(onIndexChange)(targetIndex);
      }

      // Animate to the target position
      const targetX = -targetIndex * screenWidth;
      translateX.value = withSpring(targetX, ANIMATION_CONFIG);
    });

  return {
    goToImage,
    panGesture,
  };
};
