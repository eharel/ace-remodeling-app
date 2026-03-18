import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  /** Show loading state */
  loading?: boolean;
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
  loading: externalLoading,
}: ThemedSegmentedControlProps<T>) {
  const { theme } = useTheme();
  const [pendingValue, setPendingValue] = useState<T | null>(null);

  const isSmall = size === "small";
  const isLoading = externalLoading || pendingValue !== null;

  const handlePress = useCallback(
    (value: T) => {
      if (value === selectedValue || isLoading) return;

      setPendingValue(value);

      // Use InteractionManager to defer the heavy work until after the UI updates
      InteractionManager.runAfterInteractions(() => {
        onValueChange(value);
        // Clear pending state after a short delay to ensure rendering completes
        setTimeout(() => setPendingValue(null), 50);
      });
    },
    [selectedValue, onValueChange, isLoading]
  );

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
          fontSize: isSmall ? 12 : 14,
          fontWeight: "500",
          color: theme.colors.text.secondary,
        },
        selectedLabel: {
          color: theme.colors.text.primary,
          fontWeight: "600",
        },
        count: {
          fontSize: isSmall ? 11 : 12,
          fontWeight: "500",
          color: theme.colors.text.secondary,
          marginLeft: 4,
        },
        selectedCount: {
          color: theme.colors.interactive.primary,
        },
        containerLoading: {
          opacity: 0.8,
        },
        pendingSegment: {
          backgroundColor: theme.colors.background.card,
          ...DesignTokens.shadows.base,
          shadowColor: theme.colors.shadows.base.shadowColor,
          shadowOpacity: theme.colors.shadows.base.shadowOpacity,
        },
        disabledLabel: {
          opacity: 0.5,
        },
      }),
    [theme, isSmall]
  );

  return (
    <View style={[styles.container, isLoading && styles.containerLoading]}>
      {options.map((option) => {
        const isCurrentlySelected = option.value === selectedValue;
        const isPending = option.value === pendingValue;
        // When something is pending, only show the pending one as "selected"
        const showAsSelected = pendingValue
          ? isPending
          : isCurrentlySelected;

        return (
          <Pressable
            key={option.value}
            style={styles.segmentWrapper}
            onPress={() => handlePress(option.value)}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityState={{ selected: isCurrentlySelected, busy: isPending }}
            accessibilityLabel={`${option.label}${option.count !== undefined ? `, ${option.count} items` : ""}`}
          >
            <View
              style={[
                styles.segment,
                showAsSelected && styles.selectedSegment,
              ]}
            >
              {isPending ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.interactive.primary}
                />
              ) : (
                <>
                  <Text
                    style={[
                      styles.label,
                      showAsSelected && styles.selectedLabel,
                      isLoading && !showAsSelected && styles.disabledLabel,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.count !== undefined && (
                    <Text
                      style={[
                        styles.count,
                        showAsSelected && styles.selectedCount,
                        isLoading && !showAsSelected && styles.disabledLabel,
                      ]}
                    >
                      {option.count}
                    </Text>
                  )}
                </>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
