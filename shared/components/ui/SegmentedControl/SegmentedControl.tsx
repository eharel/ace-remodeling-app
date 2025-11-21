import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { useTheme } from "@/shared/contexts";
import { SegmentedControlProps } from "./types";
import { formatLabel } from "./utils";
import PillOption from "./PillOption";
import TabOption from "./TabOption";

/**
 * SegmentedControl - Unified selection component with multiple visual variants
 * 
 * Core Responsibilities:
 * - Manage option rendering logic (NOT styling)
 * - Handle label formatting and count display
 * - Delegate to variant-specific components for visual presentation
 * - Provide a clean, composable API
 * 
 * Architecture:
 * - Uses Strategy Pattern: core logic here, visual variants in separate components
 * - Type-safe with TypeScript generics
 * - Pure functions for label formatting and rendering
 * - Static styles for performance
 * 
 * @template T - The type of option values (must extend string)
 * 
 * @example
 * ```tsx
 * <SegmentedControl
 *   variant="pills"
 *   options={['option1', 'option2', 'option3'] as const}
 *   selected={selected}
 *   onSelect={setSelected}
 *   showCounts={true}
 *   getCounts={(opt) => counts[opt]}
 * />
 * ```
 */
export function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
  variant = "tabs",
  showCounts = false,
  getCounts,
  getLabel,
  ariaLabel,
  testID,
}: SegmentedControlProps<T>) {
  const { theme } = useTheme();

  /**
   * Pure function: format display text for an option
   * 
   * Handles:
   * - Custom label formatting via getLabel prop
   * - Default formatting via formatLabel utility
   * - Count display when showCounts is enabled
   */
  const getDisplayText = (option: T): string => {
    const label = getLabel?.(option) ?? formatLabel(option);

    if (!showCounts || !getCounts) {
      return label;
    }

    const count = getCounts(option);
    return `${label} (${count})`;
  };

  // Dynamic styles based on variant (tabs need border-bottom and different spacing)
  const containerStyle = useMemo(
    () => [
      variant === "tabs"
        ? {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.secondary,
            marginBottom: DesignTokens.spacing[4],
            paddingVertical: 0, // Tabs don't need vertical padding
          }
        : {
            paddingVertical: DesignTokens.spacing[3],
          },
      { backgroundColor: "transparent" },
    ],
    [variant, theme]
  );

  const scrollContentStyle = useMemo(
    () => ({
      paddingHorizontal: DesignTokens.spacing[4],
      gap: variant === "tabs" ? DesignTokens.spacing[6] : DesignTokens.spacing[3],
      flexDirection: "row" as const,
    }),
    [variant]
  );

  return (
    <View style={containerStyle} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={scrollContentStyle}
        accessibilityLabel={ariaLabel}
        accessibilityRole="tablist"
      >
        {options.map((option) => {
          const isSelected = selected === option;
          const displayText = getDisplayText(option);
          const accessibilityLabel = `${displayText}${isSelected ? ", selected" : ""}`;

          // Strategy pattern: delegate rendering to variant component
          if (variant === "pills") {
            return (
              <PillOption
                key={option}
                label={displayText}
                isSelected={isSelected}
                onPress={() => onSelect(option)}
                accessibilityLabel={accessibilityLabel}
                testID={testID ? `${testID}-${option}` : undefined}
              />
            );
          }

          // Tab variant
          return (
            <TabOption
              key={option}
              label={displayText}
              isSelected={isSelected}
              onPress={() => onSelect(option)}
              accessibilityLabel={accessibilityLabel}
              testID={testID ? `${testID}-${option}` : undefined}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

