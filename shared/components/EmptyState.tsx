import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, ViewStyle } from "react-native";

import { DesignTokens } from "@/core/themes";
import { useTheme } from "../contexts";
import { ThemedButton, ThemedText, ThemedView } from "./themed";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export function EmptyState({
  title = "No items found",
  message = "There are no items to display at the moment.",
  icon = "folder-open",
  actionText,
  onAction,
  style,
  testID = "empty-state",
}: EmptyStateProps) {
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
          lineHeight:
            DesignTokens.typography.fontSize.xl *
            DesignTokens.typography.lineHeight.tight,
          fontWeight: DesignTokens.typography.fontWeight.bold,
          textAlign: "center",
          marginBottom: DesignTokens.spacing[2],
        },
        message: {
          fontSize: DesignTokens.typography.fontSize.base,
          lineHeight:
            DesignTokens.typography.fontSize.base *
            DesignTokens.typography.lineHeight.normal,
          textAlign: "center",
          opacity: 0.7,
          marginBottom: DesignTokens.spacing[4],
        },
        actionButton: {
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
        color={theme.colors.text.tertiary}
        style={styles.icon}
        accessibilityLabel="Empty state icon"
      />

      <ThemedText style={styles.title}>{title}</ThemedText>

      <ThemedText style={styles.message}>{message}</ThemedText>

      {onAction && actionText && (
        <ThemedButton
          variant="primary"
          size="medium"
          onPress={onAction}
          accessibilityLabel={actionText}
          style={styles.actionButton}
        >
          {actionText}
        </ThemedButton>
      )}
    </ThemedView>
  );
}
