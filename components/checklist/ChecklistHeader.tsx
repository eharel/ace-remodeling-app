import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { styling } from "@/utils/styling";

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
        { borderBottomColor: theme.colors.border.primary },
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
          style={styles.resetButton}
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
          accessibilityRole="button"
          accessibilityLabel="Close checklist"
          accessibilityHint="Closes the meeting checklist modal"
        >
          <MaterialIcons
            name="close"
            size={24}
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
    padding: styling.spacing(5), // 20px padding
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: styling.fontSize("xl"),
    fontWeight: "600",
    marginBottom: styling.spacing(1),
  },
  progressText: {
    fontSize: styling.fontSize("sm"),
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: styling.spacing(3),
  },
  resetButton: {
    padding: styling.spacing(1),
  },
});
