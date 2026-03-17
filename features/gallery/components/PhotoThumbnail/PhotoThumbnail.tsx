import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { memo, useEffect, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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
  mediaType?: "image" | "video";
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
  mediaType = "image",
}: PhotoThumbnailProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const checkmarkScale = useSharedValue(0);
  const borderOpacity = useSharedValue(0);

  // Animate selection state changes
  useEffect(() => {
    if (isSelected && inSelectionMode) {
      scale.value = withSpring(0.94, {
        damping: 18,
        stiffness: 200,
      });
      checkmarkScale.value = withSpring(1, {
        damping: 12,
        stiffness: 180,
      });
      borderOpacity.value = withTiming(1, { duration: 150 });
    } else {
      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 200,
      });
      checkmarkScale.value = withSpring(0, {
        damping: 12,
        stiffness: 180,
      });
      borderOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [isSelected, inSelectionMode, scale, checkmarkScale, borderOpacity]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedCheckmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
  }));

  const animatedBorderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  const handlePress = () => {
    if (inSelectionMode && onSelect) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect(photoId);
    } else {
      onPress();
    }
  };

  const primaryColor = theme.colors.interactive.primary;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        pressable: {
          width: size,
          height: size,
        },
        container: {
          width: size,
          height: size,
          borderRadius: DesignTokens.borderRadius.base,
          overflow: "hidden",
          backgroundColor: theme.colors.background.secondary,
        },
        image: {
          flex: 1,
          backgroundColor: theme.colors.background.tertiary,
        },
        selectionBorder: {
          ...StyleSheet.absoluteFillObject,
          borderRadius: DesignTokens.borderRadius.base,
          borderWidth: DesignTokens.borderWidth.thick,
          borderColor: primaryColor,
        },
        checkmarkContainer: {
          position: "absolute",
          top: DesignTokens.spacing[2],
          right: DesignTokens.spacing[2],
          width: 26,
          height: 26,
          borderRadius: DesignTokens.borderRadius.full,
          backgroundColor: primaryColor,
          justifyContent: "center",
          alignItems: "center",
          ...DesignTokens.shadows.md,
          shadowColor: theme.colors.shadows.md.shadowColor,
          shadowOpacity: theme.colors.shadows.md.shadowOpacity,
        },
        unselectedIndicator: {
          position: "absolute",
          top: DesignTokens.spacing[2],
          right: DesignTokens.spacing[2],
          width: 26,
          height: 26,
          borderRadius: DesignTokens.borderRadius.full,
          backgroundColor: theme.colors.background.overlay,
          borderWidth: DesignTokens.borderWidth.base,
          borderColor: theme.colors.text.inverse,
          justifyContent: "center",
          alignItems: "center",
        },
        playBadge: {
          ...StyleSheet.absoluteFillObject,
          justifyContent: "center",
          alignItems: "center",
        },
      }),
    [size, theme, primaryColor]
  );

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.pressable,
        { opacity: pressed && !inSelectionMode ? 0.85 : 1 },
      ]}
    >
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />

        {/* Selection border overlay */}
        {inSelectionMode && (
          <Animated.View style={[styles.selectionBorder, animatedBorderStyle]} />
        )}

        {/* Checkmark when selected */}
        {inSelectionMode && isSelected && (
          <Animated.View
            style={[styles.checkmarkContainer, animatedCheckmarkStyle]}
          >
            <MaterialIcons
              name="check"
              size={18}
              color={theme.colors.text.inverse}
            />
          </Animated.View>
        )}

        {/* Video play badge */}
        {mediaType === "video" && !inSelectionMode && (
          <View style={styles.playBadge} pointerEvents="none">
            <MaterialIcons
              name="play-circle-filled"
              size={32}
              color="rgba(255,255,255,0.9)"
            />
          </View>
        )}

        {/* Empty circle indicator when in selection mode but not selected */}
        {inSelectionMode && !isSelected && (
          <View style={styles.unselectedIndicator} />
        )}
      </Animated.View>
    </Pressable>
  );
});

