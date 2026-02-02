import { useTheme } from "@/shared/contexts";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image"; // Better performance than standard Image
import React, { memo, useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface PhotoThumbnailProps {
  photoId: string;
  uri: string;
  size: number;
  onPress: () => void;
  inSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (photoId: string) => void;
}

// Using memo to prevent unnecessary re-renders during scrolls
export const PhotoThumbnail = memo(function PhotoThumbnail({
  photoId,
  uri,
  size,
  onPress,
  inSelectionMode = false,
  isSelected = false,
  onSelect,
}: PhotoThumbnailProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const checkmarkOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  // Animate selection state changes
  useEffect(() => {
    if (isSelected && inSelectionMode) {
      scale.value = withSpring(0.92, {
        damping: 15,
        stiffness: 150,
      });
      checkmarkOpacity.value = withTiming(1, { duration: 200 });
      overlayOpacity.value = withTiming(0.2, { duration: 200 });
    } else {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      checkmarkOpacity.value = withTiming(0, { duration: 200 });
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isSelected, inSelectionMode, scale, checkmarkOpacity, overlayOpacity]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedCheckmarkStyle = useAnimatedStyle(() => ({
    opacity: checkmarkOpacity.value,
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handlePress = () => {
    if (inSelectionMode && onSelect) {
      // In editing mode, toggle selection
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(photoId);
    } else {
      // Normal mode, open image
      onPress();
    }
  };

  const primaryColor = theme.colors.interactive.primary;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          opacity: pressed && !inSelectionMode ? 0.8 : 1,
        },
      ]}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: 4,
            overflow: "hidden",
            borderWidth: isSelected && inSelectionMode ? 3 : 0,
            borderColor:
              isSelected && inSelectionMode ? primaryColor : "transparent",
          },
          animatedContainerStyle,
        ]}
      >
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          transition={200} // Smooth fade-in
          cachePolicy="memory-disk"
        />

        {/* Overlay when selected in editing mode */}
        {isSelected && inSelectionMode && (
          <Animated.View
            style={[
              styles.overlay,
              {
                backgroundColor: primaryColor,
              },
              animatedOverlayStyle,
            ]}
          />
        )}

        {/* Checkmark when selected in editing mode */}
        {isSelected && inSelectionMode && (
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                backgroundColor: primaryColor,
              },
              animatedCheckmarkStyle,
            ]}
          >
            <MaterialIcons name="check" size={16} color="#ffffff" />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  image: {
    flex: 1,
    backgroundColor: "#222", // Placeholder color
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  checkmarkContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
