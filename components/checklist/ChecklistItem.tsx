import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  AccessibilityState,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { CHECKLIST_CONFIG } from "../../constants/ChecklistConfig";

/**
 * Props for the ChecklistItem component
 */
interface ChecklistItemProps {
  /** The text content to display */
  text: string;
  /** Whether the item is checked */
  isChecked?: boolean;
  /** Callback when the item is pressed */
  onPress?: () => void;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
  /** Accessibility state for screen readers */
  accessibilityState?: AccessibilityState;
}

/**
 * Individual checklist item component
 * Displays a checkbox with text and handles user interaction
 */
export function ChecklistItem({
  text,
  isChecked = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}: ChecklistItemProps) {
  const { getThemeColor } = useTheme();

  return (
    <TouchableOpacity
      style={styles.checklistItem}
      onPress={onPress}
      activeOpacity={CHECKLIST_CONFIG.ITEM.ACTIVE_OPACITY}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel || text}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState || { checked: isChecked }}
    >
      <MaterialIcons
        name={isChecked ? "check-box" : "check-box-outline-blank"}
        size={CHECKLIST_CONFIG.ITEM.ICON_SIZE}
        color={
          isChecked
            ? getThemeColor("interactive.primary")
            : getThemeColor("text.tertiary")
        }
        accessibilityElementsHidden={true}
      />
      <Text
        style={[
          styles.checklistText,
          {
            color: getThemeColor("text.primary"),
            textDecorationLine: isChecked ? "line-through" : "none",
            opacity: isChecked ? CHECKLIST_CONFIG.ITEM.CHECKED_OPACITY : 1,
          },
        ]}
        accessibilityElementsHidden={true}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: CHECKLIST_CONFIG.ITEM.PADDING_VERTICAL,
    paddingHorizontal: CHECKLIST_CONFIG.ITEM.PADDING_HORIZONTAL,
  },
  checklistText: {
    fontSize: CHECKLIST_CONFIG.ITEM.TEXT_FONT_SIZE,
    marginLeft: CHECKLIST_CONFIG.ITEM.TEXT_MARGIN_LEFT,
    flex: 1,
  },
});
