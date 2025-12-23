import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, ViewStyle } from "react-native";

import { DesignTokens } from "@/shared/themes";
import { useTheme } from "../contexts";
import { ThemedButton, ThemedText, ThemedView } from "./themed";

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
          lineHeight:
            DesignTokens.typography.fontSize.base *
            DesignTokens.typography.lineHeight.normal,
          marginBottom: DesignTokens.spacing[4],
        },
        retryButton: {
          marginTop: DesignTokens.spacing[2],
        },
      }),
    []
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
        <ThemedButton
          variant="primary"
          size="medium"
          onPress={onRetry}
          accessibilityLabel={retryText}
          style={styles.retryButton}
        >
          {retryText}
        </ThemedButton>
      )}
    </ThemedView>
  );
}
