import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "./ThemedText";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface ThemedSegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  /** Size variant */
  size?: "small" | "medium";
}

/**
 * ThemedSegmentedControl - A theme-aware segmented control component
 *
 * Features:
 * - Multiple segment options with labels and optional counts
 * - Smooth animated selection indicator
 * - Theme-aware styling
 * - Two size variants (small, medium)
 */
export function ThemedSegmentedControl<T extends string>({
  options,
  selectedValue,
  onValueChange,
  size = "medium",
}: ThemedSegmentedControlProps<T>) {
  const { theme } = useTheme();
  const selectedIndex = options.findIndex((opt) => opt.value === selectedValue);

  // Animation for the selection indicator
  const indicatorPosition = useSharedValue(selectedIndex);

  // Update indicator position when selection changes
  React.useEffect(() => {
    indicatorPosition.value = withTiming(selectedIndex, {
      duration: DesignTokens.animations.duration.fast,
    });
  }, [selectedIndex, indicatorPosition]);

  const isSmall = size === "small";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.base,
          padding: DesignTokens.spacing[1],
        },
        segmentWrapper: {
          flex: 1,
        },
        segment: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: isSmall
            ? DesignTokens.spacing[1]
            : DesignTokens.spacing[2],
          paddingHorizontal: isSmall
            ? DesignTokens.spacing[2]
            : DesignTokens.spacing[3],
          borderRadius: DesignTokens.borderRadius.sm,
          gap: DesignTokens.spacing[1],
        },
        selectedSegment: {
          backgroundColor: theme.colors.background.elevated,
          ...DesignTokens.shadows.sm,
          shadowColor: theme.colors.shadows.sm.shadowColor,
          shadowOpacity: theme.colors.shadows.sm.shadowOpacity,
        },
        label: {
          fontSize: isSmall
            ? DesignTokens.typography.fontSize.xs
            : DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
        },
        selectedLabel: {
          color: theme.colors.text.primary,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
        },
        unselectedLabel: {
          color: theme.colors.text.secondary,
        },
        count: {
          fontSize: isSmall
            ? DesignTokens.typography.fontSize.xs
            : DesignTokens.typography.fontSize.xs,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          color: theme.colors.text.tertiary,
        },
        selectedCount: {
          color: theme.colors.interactive.primary,
        },
      }),
    [theme, isSmall]
  );

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = option.value === selectedValue;

        return (
          <Pressable
            key={option.value}
            style={styles.segmentWrapper}
            onPress={() => onValueChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${option.label}${option.count !== undefined ? `, ${option.count} items` : ""}`}
          >
            <Animated.View
              style={[styles.segment, isSelected && styles.selectedSegment]}
            >
              <ThemedText
                style={[
                  styles.label,
                  isSelected ? styles.selectedLabel : styles.unselectedLabel,
                ]}
              >
                {option.label}
              </ThemedText>
              {option.count !== undefined && (
                <ThemedText
                  style={[styles.count, isSelected && styles.selectedCount]}
                >
                  {option.count}
                </ThemedText>
              )}
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
}
