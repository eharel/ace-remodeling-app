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
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: isSmall
            ? DesignTokens.spacing[2]
            : DesignTokens.spacing[3],
          paddingHorizontal: isSmall
            ? DesignTokens.spacing[2]
            : DesignTokens.spacing[3],
          borderRadius: DesignTokens.borderRadius.sm,
          gap: DesignTokens.spacing[1],
        },
        selectedSegment: {
          backgroundColor: theme.colors.background.card,
          ...DesignTokens.shadows.base,
          shadowColor: theme.colors.shadows.base.shadowColor,
          shadowOpacity: theme.colors.shadows.base.shadowOpacity,
        },
        label: {
          fontSize: isSmall
            ? DesignTokens.typography.fontSize.xs
            : DesignTokens.typography.fontSize.sm,
          fontWeight: "500" as const,
          color: theme.colors.text.secondary,
        },
        selectedLabel: {
          color: theme.colors.text.primary,
          fontWeight: "600" as const,
        },
        count: {
          fontSize: DesignTokens.typography.fontSize.xs,
          fontWeight: "500" as const,
          color: theme.colors.text.secondary,
        },
        selectedCount: {
          color: theme.colors.interactive.primary,
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
