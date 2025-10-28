import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/core/themes";

interface ImageLoadingSkeletonProps {
  message?: string;
}

/**
 * ImageLoadingSkeleton - Loading skeleton component for images
 *
 * This component displays a pulsing loading animation while an image is loading.
 * It provides visual feedback to users and follows the app's design system.
 *
 * Features:
 * - Pulsing opacity animation for visual feedback
 * - Customizable loading message
 * - Theme-aware styling
 * - Accessibility support
 * - Optimized with React.memo
 *
 * @component
 * @param {ImageLoadingSkeletonProps} props - The component props
 * @param {string} [props.message="Loading image..."] - Loading message to display
 *
 * @example
 * ```tsx
 * <ImageLoadingSkeleton message="Loading project image..." />
 * ```
 *
 * @returns {JSX.Element} The loading skeleton component
 */
export const ImageLoadingSkeleton = React.memo<ImageLoadingSkeletonProps>(
  ({ message = "Loading image..." }) => {
    const { theme } = useTheme();
    const opacity = useSharedValue(0.3);

    useEffect(() => {
      opacity.value = withRepeat(withTiming(0.8, { duration: 1000 }), -1, true);
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    const styles = React.useMemo(
      () =>
        StyleSheet.create({
          container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.colors.background.section,
            borderRadius: DesignTokens.borderRadius.md,
            margin: DesignTokens.spacing[4],
          },
          content: {
            alignItems: "center",
            gap: DesignTokens.spacing[4],
          },
          skeleton: {
            width: 200,
            height: 200,
            backgroundColor: theme.colors.background.separator,
            borderRadius: DesignTokens.borderRadius.md,
          },
          message: {
            fontSize: DesignTokens.typography.fontSize.base,
            color: theme.colors.text.secondary,
            textAlign: "center",
          },
        }),
      [theme]
    );

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View style={[styles.skeleton, animatedStyle]} />
          <ActivityIndicator
            size="large"
            color={theme.colors.interactive.primary}
            accessibilityLabel="Loading image"
          />
          <ThemedText style={styles.message}>{message}</ThemedText>
        </View>
      </View>
    );
  }
);

ImageLoadingSkeleton.displayName = "ImageLoadingSkeleton";
