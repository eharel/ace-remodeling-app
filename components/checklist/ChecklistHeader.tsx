import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";

interface ChecklistHeaderProps {
  /** Progress information for the checklist */
  progress: {
    completed: number;
    total: number;
  };
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
        <TouchableOpacity
          onPress={onReset}
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.background.card },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Reset checklist"
          accessibilityHint="Immediately resets all checklist items to unchecked state"
        >
          <MaterialIcons
            name="refresh"
            size={20}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onClose}
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.background.card },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Close checklist"
          accessibilityHint="Closes the meeting checklist modal"
        >
          <MaterialIcons
            name="close"
            size={20}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
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
  actionButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
    borderWidth: 1,
    borderColor: "transparent",
    ...DesignTokens.shadows.sm,
  },
});
