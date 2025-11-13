import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedIconButton } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import type { ChecklistProgress } from "@/features/checklist/utils/checklistHelpers";

interface ChecklistHeaderProps {
  /** Progress information for the checklist (from getTotalProgress) */
  progress: ChecklistProgress;
  /** Callback when reset button is pressed */
  onReset: () => void;
  /** Callback when close button is pressed */
  onClose: () => void;
}

/**
 * Header component for the checklist modal
 * Displays title, progress, and action buttons
 */
export function ChecklistHeader({
  progress,
  onReset,
  onClose,
}: ChecklistHeaderProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.background.section,
          borderBottomColor: theme.colors.border.primary,
        },
      ]}
    >
      <View style={styles.headerContent}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Meeting Checklist
        </Text>
        <Text
          style={[styles.progressText, { color: theme.colors.text.secondary }]}
        >
          {progress.completed}/{progress.total} completed
        </Text>
      </View>
      <View style={styles.headerActions}>
        <ThemedIconButton
          icon="refresh"
          variant="ghost"
          size="small"
          onPress={onReset}
          accessibilityLabel="Reset checklist"
          accessibilityHint="Immediately resets all checklist items to unchecked state"
        />
        <ThemedIconButton
          icon="close"
          variant="ghost"
          size="small"
          onPress={onClose}
          accessibilityLabel="Close checklist"
          accessibilityHint="Closes the meeting checklist modal"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: DesignTokens.spacing[5], // 20px padding
    borderBottomWidth: 1,
    ...DesignTokens.shadows.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  progressText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: DesignTokens.spacing[2],
  },
});
