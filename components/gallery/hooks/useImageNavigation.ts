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
