import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { DesignTokens } from "@/shared/themes";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { OptionComponentProps } from "./types";

/**
 * PillOption - Visual variant component for pill-style selection
 * 
 * Responsibilities:
 * - ONLY visual presentation of the pill variant
 * - Uses theme colors and design tokens
 * - No business logic
 * 
 * Extracted from ComponentSelector styling to be reusable.
 */
export default function PillOption({
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
        staticStyles.pill,
        {
          backgroundColor: isSelected
            ? theme.colors.interactive.primary
            : "transparent",
          borderColor: theme.colors.interactive.primary,
        },
      ]}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel || `Select ${label}`}
      accessibilityState={{ selected: isSelected }}
      testID={testID}
    >
      <ThemedText
        style={[
          staticStyles.pillText,
          {
            color: isSelected
              ? "#FFFFFF" // White text on colored background
              : theme.colors.interactive.primary,
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
  pill: {
    paddingVertical: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[6],
    borderRadius: DesignTokens.borderRadius.full,
    borderWidth: DesignTokens.borderWidth.thin,
    minHeight: 44, // Minimum touch target for accessibility
    justifyContent: "center",
    alignItems: "center",
  },
  pillText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontFamily: DesignTokens.typography.fontFamily.medium,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    lineHeight:
      DesignTokens.typography.fontSize.base *
      DesignTokens.typography.lineHeight.tight,
  },
});

