import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { SegmentedControlProps } from "./types";
import { formatLabel } from "./utils";
import PillOption from "./PillOption";

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

  return (
    <View style={staticStyles.container} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={staticStyles.scrollContent}
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

          // Tab variant will be added in Stage 2
          // For now, fallback to pill for development/testing
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
        })}
      </ScrollView>
    </View>
  );
}

// Static styles (performance optimization - created once, not on every render)
const staticStyles = StyleSheet.create({
  container: {
    paddingVertical: DesignTokens.spacing[3],
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[3],
    flexDirection: "row",
  },
});

