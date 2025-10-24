import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts";
import { DesignTokens } from "@/themes";

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
          backgroundColor: theme.colors.interactive.primary,
          paddingHorizontal: DesignTokens.spacing[6],
          paddingVertical: DesignTokens.spacing[3],
          borderRadius: DesignTokens.borderRadius.md,
          marginTop: DesignTokens.spacing[2],
        },
        actionText: {
          color: theme.colors.text.inverse,
          fontSize: DesignTokens.typography.fontSize.base,
          lineHeight:
            DesignTokens.typography.fontSize.base *
            DesignTokens.typography.lineHeight.normal,
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
        color={theme.colors.text.tertiary}
        style={styles.icon}
        accessibilityLabel="Empty state icon"
      />

      <ThemedText style={styles.title}>{title}</ThemedText>

      <ThemedText style={styles.message}>{message}</ThemedText>

      {onAction && actionText && (
        <Pressable
          style={styles.actionButton}
          onPress={onAction}
          accessibilityLabel={actionText}
          accessibilityRole="button"
        >
          <ThemedText style={styles.actionText}>{actionText}</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}
