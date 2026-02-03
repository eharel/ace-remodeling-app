import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

  const isSmall = size === "small";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          backgroundColor: theme.colors.background.accent,
          borderRadius: DesignTokens.borderRadius.base,
          padding: DesignTokens.spacing[1],
        },
        segmentWrapper: {
          flex: 1,
        },
        segment: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: isSmall ? 8 : 12,
          paddingHorizontal: isSmall ? 8 : 12,
          borderRadius: DesignTokens.borderRadius.sm,
        },
        selectedSegment: {
          backgroundColor: theme.colors.background.card,
          ...DesignTokens.shadows.base,
          shadowColor: theme.colors.shadows.base.shadowColor,
          shadowOpacity: theme.colors.shadows.base.shadowOpacity,
        },
        label: {
          fontSize: 12,
          fontWeight: "500",
          color: "#333333",
        },
        selectedLabel: {
          color: "#000000",
          fontWeight: "600",
        },
        count: {
          fontSize: 11,
          fontWeight: "500",
          color: "#666666",
          marginLeft: 4,
        },
        selectedCount: {
          color: "#BB9D67",
        },
      }),
    [theme, isSmall]
  );

  return (
    <View style={styles.container}>
      {options.map((option) => {
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
            <View style={[styles.segment, isSelected && styles.selectedSegment]}>
              <Text
                style={[
                  styles.label,
                  isSelected && styles.selectedLabel,
                ]}
              >
                {option.label}
              </Text>
              {option.count !== undefined && (
                <Text
                  style={[styles.count, isSelected && styles.selectedCount]}
                >
                  {option.count}
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
