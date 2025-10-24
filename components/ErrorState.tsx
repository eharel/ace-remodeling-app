import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts";
import { DesignTokens } from "@/themes";

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onRetry?: () => void;
  retryText?: string;
  style?: ViewStyle;
  testID?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  icon = "error-outline",
  onRetry,
  retryText = "Try again",
  style,
  testID = "error-state",
}: ErrorStateProps) {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: DesignTokens.spacing[8],
          gap: DesignTokens.spacing[4],
        },
        icon: {
          marginBottom: DesignTokens.spacing[2],
        },
        title: {
          fontSize: DesignTokens.typography.fontSize.xl,
          fontWeight: DesignTokens.typography.fontWeight.bold,
          textAlign: "center",
          marginBottom: DesignTokens.spacing[2],
        },
        message: {
          fontSize: DesignTokens.typography.fontSize.base,
          textAlign: "center",
          opacity: 0.7,
          lineHeight: 22,
          marginBottom: DesignTokens.spacing[4],
        },
        retryButton: {
          backgroundColor: theme.colors.interactive.primary,
          paddingHorizontal: DesignTokens.spacing[6],
          paddingVertical: DesignTokens.spacing[3],
          borderRadius: DesignTokens.borderRadius.md,
          marginTop: DesignTokens.spacing[2],
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
    <ThemedView
      style={[styles.container, style]}
      testID={testID}
      accessibilityLabel={title}
      accessibilityHint={message}
    >
      <MaterialIcons
        name={icon}
        size={64}
        color={theme.colors.status.error}
        style={styles.icon}
        accessibilityLabel="Error icon"
      />

      <ThemedText style={styles.title}>{title}</ThemedText>

      <ThemedText style={styles.message}>{message}</ThemedText>

      {onRetry && (
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityLabel={retryText}
          accessibilityRole="button"
        >
          <ThemedText style={styles.retryText}>{retryText}</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}
