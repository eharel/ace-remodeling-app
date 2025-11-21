import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { OptionComponentProps } from "./types";

/**
 * TabOption - Visual variant component for tab-style selection
 *
 * Responsibilities:
 * - ONLY visual presentation of the tab variant
 * - Uses underline indicator for selection (border-bottom)
 * - Lighter visual weight than pills (no borders/backgrounds)
 * - Uses theme colors and design tokens
 * - No business logic
 *
 * Visual Design:
 * - Unselected: Secondary text color, no underline
 * - Selected: Primary text color (semibold), colored underline indicator (3px)
 * - Spacing: More horizontal space between options than pills
 *
 * Note: The label may include counts in parentheses (e.g., "All Photos (20)")
 * which is formatted by SegmentedControl's getDisplayText function.
 */
export default function TabOption({
  label,
  isSelected,
  onPress,
  accessibilityLabel,
  testID,
}: OptionComponentProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        staticStyles.tab,
        isSelected && {
          borderBottomColor: theme.colors.components.button.primary,
        },
      ]}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel || `Select ${label}`}
      accessibilityState={{ selected: isSelected }}
      testID={testID}
      android_ripple={{
        color: `${theme.colors.interactive.primary}20`,
        borderless: false,
      }}
    >
      <ThemedText
        style={[
          staticStyles.tabLabel,
          {
            color: isSelected
              ? theme.colors.components.button.primary
              : theme.colors.text.secondary,
            fontWeight: isSelected
              ? DesignTokens.typography.fontWeight.semibold
              : DesignTokens.typography.fontWeight.normal,
            fontFamily: isSelected
              ? DesignTokens.typography.fontFamily.semibold
              : DesignTokens.typography.fontFamily.regular,
          },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

// Static styles using DesignTokens (performance optimization)
const staticStyles = StyleSheet.create({
  tab: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[3],
    minHeight: 44, // iPad touch target minimum
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    marginBottom: -1, // Overlap with container border for clean look
  },
  tabLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    lineHeight:
      DesignTokens.typography.fontSize.base *
      DesignTokens.typography.lineHeight.tight,
  },
});

