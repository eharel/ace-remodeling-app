import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

/**
 * Props for InheritanceIndicator component
 */
export interface InheritanceIndicatorProps {
  /** Source of inherited value (e.g., "Project 187") */
  source: string;
  /** Optional callback when user wants to create override */
  onEdit?: () => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * InheritanceIndicator - Visual indicator for inherited values
 *
 * Shows a small badge indicating that a value is inherited from the project.
 * Optionally provides a quick action to create a component-level override.
 *
 * @component
 */
export function InheritanceIndicator({
  source,
  onEdit,
  testID = "inheritance-indicator",
}: InheritanceIndicatorProps) {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          alignItems: "center",
          gap: DesignTokens.spacing[1],
          marginBottom: DesignTokens.spacing[1],
        },
        badge: {
          flexDirection: "row",
          alignItems: "center",
          gap: DesignTokens.spacing[1],
          paddingHorizontal: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[1],
          borderRadius: DesignTokens.borderRadius.sm,
          backgroundColor: theme.colors.background.secondary,
        },
        icon: {
          opacity: 0.6,
        },
        text: {
          fontSize: DesignTokens.typography.fontSize.xs,
          color: theme.colors.text.tertiary,
        },
        editButton: {
          marginLeft: DesignTokens.spacing[1],
        },
      }),
    [theme]
  );

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.badge}>
        <MaterialIcons
          name="link"
          size={12}
          color={theme.colors.text.tertiary}
          style={styles.icon}
        />
        <ThemedText style={styles.text}>Inherited from {source}</ThemedText>
      </View>
      {onEdit && (
        <Pressable
          style={styles.editButton}
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`Create custom ${source} value`}
          accessibilityHint="Tap to override inherited value"
        >
          <MaterialIcons
            name="edit"
            size={14}
            color={theme.colors.interactive.primary}
          />
        </Pressable>
      )}
    </View>
  );
}
