import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";

interface ImageLoadingSkeletonProps {
  message?: string;
}

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
