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
  const { getThemeColor } = useTheme();

  return (
    <View
      style={[
        styles.header,
        { borderBottomColor: getThemeColor("border.primary") },
      ]}
    >
      <View style={styles.headerContent}>
        <Text style={[styles.title, { color: getThemeColor("text.primary") }]}>
          Meeting Checklist
        </Text>
        <Text
          style={[
            styles.progressText,
            { color: getThemeColor("text.secondary") },
          ]}
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
            size={styling.componentSize("header").resetIconSize}
            color={getThemeColor("text.secondary")}
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
            size={styling.componentSize("header").closeIconSize}
            color={getThemeColor("text.secondary")}
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
    fontSize: styling.componentSize("header").titleFontSize,
    fontWeight: styling.componentSize("header").titleFontWeight,
    marginBottom: styling.componentSize("header").titleMarginBottom,
  },
  progressText: {
    fontSize: styling.componentSize("header").progressFontSize,
    fontWeight: styling.componentSize("header").progressFontWeight,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: styling.componentSize("header").actionsGap,
  },
  resetButton: {
    padding: styling.componentSize("header").resetButtonPadding,
  },
});
