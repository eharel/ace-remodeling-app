import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";

interface ImageErrorStateProps {
  error?: string;
  onRetry?: () => void;
}

export const ImageErrorState = React.memo<ImageErrorStateProps>(
  ({ error = "Failed to load image", onRetry }) => {
    const { theme } = useTheme();

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
            padding: DesignTokens.spacing[6],
          },
          content: {
            alignItems: "center",
            gap: DesignTokens.spacing[4],
          },
          icon: {
            marginBottom: DesignTokens.spacing[2],
          },
          title: {
            fontSize: DesignTokens.typography.fontSize.lg,
            fontWeight: DesignTokens.typography.fontWeight.semibold,
            color: theme.colors.text.primary,
            textAlign: "center",
            marginBottom: DesignTokens.spacing[2],
          },
          message: {
            fontSize: DesignTokens.typography.fontSize.base,
            color: theme.colors.text.secondary,
            textAlign: "center",
            lineHeight:
              DesignTokens.typography.lineHeight.normal *
              DesignTokens.typography.fontSize.base,
            marginBottom: DesignTokens.spacing[4],
          },
          retryButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: DesignTokens.spacing[2],
            backgroundColor: theme.colors.interactive.primary,
            paddingHorizontal: DesignTokens.spacing[4],
            paddingVertical: DesignTokens.spacing[3],
            borderRadius: DesignTokens.borderRadius.md,
          },
          retryText: {
            color: theme.colors.text.inverse,
            fontSize: DesignTokens.typography.fontSize.base,
            fontWeight: DesignTokens.typography.fontWeight.medium,
          },
        }),
      [theme]
    );

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <MaterialIcons
            name="error-outline"
            size={48}
            color={theme.colors.text.secondary}
            style={styles.icon}
          />
          <ThemedText style={styles.title}>Image Load Error</ThemedText>
          <ThemedText style={styles.message}>{error}</ThemedText>
          {onRetry && (
            <Pressable
              style={styles.retryButton}
              onPress={onRetry}
              accessibilityLabel="Retry loading image"
              accessibilityRole="button"
            >
              <MaterialIcons
                name="refresh"
                size={20}
                color={theme.colors.text.inverse}
              />
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    );
  }
);

ImageErrorState.displayName = "ImageErrorState";
