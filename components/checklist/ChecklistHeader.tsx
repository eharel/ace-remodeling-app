import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CHECKLIST_CONFIG } from "@/constants/ChecklistConfig";
import { useTheme } from "@/contexts/ThemeContext";

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
            size={CHECKLIST_CONFIG.HEADER.RESET_ICON_SIZE}
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
            size={CHECKLIST_CONFIG.HEADER.CLOSE_ICON_SIZE}
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
    padding: CHECKLIST_CONFIG.HEADER.PADDING,
    borderBottomWidth: CHECKLIST_CONFIG.HEADER.BORDER_BOTTOM_WIDTH,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: CHECKLIST_CONFIG.HEADER.TITLE_FONT_SIZE,
    fontWeight: CHECKLIST_CONFIG.HEADER.TITLE_FONT_WEIGHT,
    marginBottom: CHECKLIST_CONFIG.HEADER.TITLE_MARGIN_BOTTOM,
  },
  progressText: {
    fontSize: CHECKLIST_CONFIG.HEADER.PROGRESS_FONT_SIZE,
    fontWeight: CHECKLIST_CONFIG.HEADER.PROGRESS_FONT_WEIGHT,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: CHECKLIST_CONFIG.HEADER.ACTIONS_GAP,
  },
  resetButton: {
    padding: CHECKLIST_CONFIG.HEADER.RESET_BUTTON_PADDING,
  },
});
