import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  AccessibilityState,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { styling } from "@/utils/styling";

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
      activeOpacity={styling.interaction("activeOpacity")}
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel || text}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState || { checked: isChecked }}
    >
      <MaterialIcons
        name={isChecked ? "check-box" : "check-box-outline-blank"}
        size={styling.componentSize("checklistItem").iconSize}
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
            opacity: isChecked ? styling.interaction("disabledOpacity") : 1,
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
    paddingVertical: styling.spacing(3), // 12px
    paddingHorizontal: styling.spacing(1), // 4px
  },
  checklistText: {
    fontSize: styling.componentSize("checklistItem").textFontSize,
    marginLeft: styling.componentSize("checklistItem").textMarginLeft,
    flex: 1,
  },
});
