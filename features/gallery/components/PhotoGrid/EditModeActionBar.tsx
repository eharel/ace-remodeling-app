import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

interface ActionButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  isLoading?: boolean;
}

function ActionButton({
  icon,
  label,
  onPress,
  disabled = false,
  variant = "default",
  isLoading = false,
}: ActionButtonProps) {
  const { theme } = useTheme();

  const isDisabled = disabled || isLoading;

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
    if (isDisabled) return theme.colors.text.disabled;
    if (variant === "danger") return theme.colors.status.error;
    return theme.colors.text.primary;
  }, [isDisabled, variant, theme]);

  const textColor = useMemo(() => {
    if (isDisabled) return theme.colors.text.disabled;
    if (variant === "danger") return theme.colors.status.error;
    return theme.colors.text.secondary;
  }, [isDisabled, variant, theme]);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
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
      accessibilityState={{ disabled: isDisabled }}
    >
      {isLoading ? (
        <ActivityIndicator size={24} color={iconColor} />
      ) : (
        <MaterialIcons name={icon} size={24} color={iconColor} />
      )}
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
  isLoading?: boolean;
  loadingOperation?: "add" | "delete" | "thumbnail" | null;
  /** Whether adding photos is allowed (disabled when viewing "All" category) */
  canAddPhotos?: boolean;
}

export function EditModeActionBar({
  selectedCount,
  onAddPhotos,
  onDelete,
  onSetThumbnail,
  isLoading = false,
  loadingOperation = null,
  canAddPhotos = true,
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
        label={canAddPhotos ? "Add Photos" : "Select Category"}
        onPress={onAddPhotos}
        disabled={!canAddPhotos || isLoading}
        isLoading={loadingOperation === "add"}
      />

      <View style={styles.divider} />

      <ActionButton
        icon="delete-outline"
        label="Delete"
        onPress={onDelete}
        disabled={!hasSelection || isLoading}
        variant="danger"
        isLoading={loadingOperation === "delete"}
      />

      <View style={styles.divider} />

      <ActionButton
        icon="image"
        label="Set Thumbnail"
        onPress={onSetThumbnail}
        disabled={!hasSingleSelection || isLoading}
        isLoading={loadingOperation === "thumbnail"}
      />
    </ThemedView>
  );
}
