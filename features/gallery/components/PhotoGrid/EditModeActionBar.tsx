import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

interface ActionButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}

function ActionButton({
  icon,
  label,
  onPress,
  disabled = false,
  variant = "default",
}: ActionButtonProps) {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: DesignTokens.spacing[2],
          paddingHorizontal: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.base,
          minWidth: 72,
          gap: DesignTokens.spacing[1],
        },
        label: {
          fontSize: DesignTokens.typography.fontSize.xs,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          textAlign: "center",
        },
      }),
    []
  );

  const iconColor = useMemo(() => {
    if (disabled) return theme.colors.text.disabled;
    if (variant === "danger") return theme.colors.status.error;
    return theme.colors.text.primary;
  }, [disabled, variant, theme]);

  const textColor = useMemo(() => {
    if (disabled) return theme.colors.text.disabled;
    if (variant === "danger") return theme.colors.status.error;
    return theme.colors.text.secondary;
  }, [disabled, variant, theme]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          opacity: pressed ? DesignTokens.interactions.activeOpacity : 1,
          backgroundColor: pressed
            ? theme.colors.background.secondary
            : "transparent",
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <MaterialIcons name={icon} size={24} color={iconColor} />
      <ThemedText style={[styles.label, { color: textColor }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface EditModeActionBarProps {
  selectedCount: number;
  onAddPhotos: () => void;
  onDelete: () => void;
  onSetThumbnail: () => void;
}

export function EditModeActionBar({
  selectedCount,
  onAddPhotos,
  onDelete,
  onSetThumbnail,
}: EditModeActionBarProps) {
  const { theme } = useTheme();

  const hasSelection = selectedCount > 0;
  const hasSingleSelection = selectedCount === 1;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
          borderTopWidth: DesignTokens.borderWidth.thin,
          borderTopColor: theme.colors.border.secondary,
          backgroundColor: theme.colors.background.elevated,
          ...DesignTokens.shadows.sm,
          shadowColor: theme.colors.shadows.sm.shadowColor,
          shadowOpacity: theme.colors.shadows.sm.shadowOpacity,
        },
        divider: {
          width: DesignTokens.borderWidth.thin,
          height: 40,
          backgroundColor: theme.colors.border.primary,
        },
      }),
    [theme]
  );

  return (
    <ThemedView style={styles.container}>
      <ActionButton
        icon="add-photo-alternate"
        label="Add Photos"
        onPress={onAddPhotos}
      />

      <View style={styles.divider} />

      <ActionButton
        icon="delete-outline"
        label="Delete"
        onPress={onDelete}
        disabled={!hasSelection}
        variant="danger"
      />

      <View style={styles.divider} />

      <ActionButton
        icon="image"
        label="Set Thumbnail"
        onPress={onSetThumbnail}
        disabled={!hasSingleSelection}
      />
    </ThemedView>
  );
}
