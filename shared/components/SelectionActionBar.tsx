import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

/**
 * Action configuration for SelectionActionBar
 */
export interface SelectionAction {
  /** Unique identifier for the action */
  id: string;
  /** Material icon name */
  icon: keyof typeof MaterialIcons.glyphMap;
  /** Display label */
  label: string;
  /** Callback when pressed */
  onPress: () => void;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Visual variant - danger for destructive actions */
  variant?: "default" | "danger";
  /** Whether this specific action is loading */
  isLoading?: boolean;
}

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

interface SelectionActionBarProps {
  /** Array of action configurations */
  actions: SelectionAction[];
  /** Number of currently selected items */
  selectedCount: number;
  /** Whether to show the selection count badge */
  showSelectionCount?: boolean;
}

/**
 * SelectionActionBar - A reusable bottom action bar for edit/selection modes
 *
 * Used for batch operations on selected items. Follows iOS/Material Design
 * conventions with actions at the bottom of the screen for easy thumb reach.
 *
 * Features:
 * - Configurable actions with icons and labels
 * - Loading state per action
 * - Danger variant for destructive actions
 * - Selection count display
 * - Dividers between actions
 *
 * Usage:
 * ```tsx
 * <SelectionActionBar
 *   selectedCount={selectedIds.size}
 *   actions={[
 *     { id: 'add', icon: 'add', label: 'Add', onPress: handleAdd },
 *     { id: 'delete', icon: 'delete-outline', label: 'Delete', onPress: handleDelete, variant: 'danger', disabled: !hasSelection },
 *   ]}
 * />
 * ```
 */
export function SelectionActionBar({
  actions,
  selectedCount,
  showSelectionCount = true,
}: SelectionActionBarProps) {
  const { theme } = useTheme();

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
        selectionBadge: {
          position: "absolute",
          top: -8,
          right: DesignTokens.spacing[4],
          backgroundColor: theme.colors.interactive.primary,
          paddingHorizontal: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[1],
          borderRadius: DesignTokens.borderRadius.full,
        },
        selectionBadgeText: {
          fontSize: DesignTokens.typography.fontSize.xs,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.text.inverse,
        },
      }),
    [theme]
  );

  return (
    <ThemedView style={styles.container}>
      {showSelectionCount && selectedCount > 0 && (
        <View style={styles.selectionBadge}>
          <ThemedText style={styles.selectionBadgeText}>
            {selectedCount} selected
          </ThemedText>
        </View>
      )}
      {actions.map((action, index) => (
        <View key={action.id} style={{ flexDirection: "row", alignItems: "center" }}>
          {index > 0 && <View style={styles.divider} />}
          <ActionButton
            icon={action.icon}
            label={action.label}
            onPress={action.onPress}
            disabled={action.disabled}
            variant={action.variant}
            isLoading={action.isLoading}
          />
        </View>
      ))}
    </ThemedView>
  );
}
