import React, { useMemo, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";

interface FeaturedToggleProps {
  /** Current featured status */
  isFeatured: boolean;
  /** Callback when toggle changes */
  onToggle: (value: boolean) => Promise<void>;
  /** Optional label override */
  label?: string;
}

/**
 * FeaturedToggle - A toggle switch for marking a project/component as featured
 *
 * Shows a star icon, label, and switch. Handles loading state during save.
 */
export function FeaturedToggle({
  isFeatured,
  onToggle,
  label = "Featured in Showcase",
}: FeaturedToggleProps) {
  const { theme } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (value: boolean) => {
    setIsUpdating(true);
    try {
      await onToggle(value);
    } finally {
      setIsUpdating(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
          backgroundColor: theme.colors.background.secondary,
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: DesignTokens.borderWidth.thin,
          borderColor: isFeatured
            ? theme.colors.status.warning
            : theme.colors.border.primary,
        },
        leftContent: {
          flexDirection: "row",
          alignItems: "center",
          gap: DesignTokens.spacing[3],
        },
        label: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          color: theme.colors.text.primary,
        },
      }),
    [theme, isFeatured]
  );

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <MaterialIcons
          name={isFeatured ? "star" : "star-outline"}
          size={20}
          color={
            isFeatured
              ? theme.colors.status.warning
              : theme.colors.text.secondary
          }
        />
        <ThemedText style={styles.label}>{label}</ThemedText>
      </View>
      <Switch
        value={isFeatured}
        onValueChange={handleToggle}
        disabled={isUpdating}
        trackColor={{
          false: theme.colors.background.accent,
          true: theme.colors.status.warningLight,
        }}
        thumbColor={
          isFeatured
            ? theme.colors.status.warning
            : theme.colors.background.elevated
        }
        ios_backgroundColor={theme.colors.background.accent}
      />
    </View>
  );
}
