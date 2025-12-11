import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { MediaAsset } from "@/core/types";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

/**
 * Props for PhotoOptionsMenu component
 */
export interface PhotoOptionsMenuProps {
  /** Photo to show options for */
  photo: MediaAsset;
  /** Project ID */
  projectId: string;
  /** Component ID */
  componentId: string;
  /** Whether the menu is visible */
  visible: boolean;
  /** Callback when menu should be closed */
  onClose: () => void;
  /** Callback when delete is selected */
  onDelete: () => void;
  /** Callback when photo is pressed to view full size */
  onViewFullSize?: () => void;
  /** Optional: position for context menu (not used in current implementation) */
  anchorPosition?: { x: number; y: number };
  /** Test ID for testing */
  testID?: string;
}

/**
 * PhotoOptionsMenu - Context menu for photo actions
 *
 * Displays a modal menu with options for a photo (delete, view full size, etc.).
 * Appears when user long-presses a photo.
 *
 * @component
 */
export function PhotoOptionsMenu({
  photo,
  projectId,
  componentId,
  visible,
  onClose,
  onDelete,
  onViewFullSize,
  testID = "photo-options-menu",
}: PhotoOptionsMenuProps) {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        },
        container: {
          backgroundColor: theme.colors.background.card,
          borderTopLeftRadius: DesignTokens.borderRadius.lg,
          borderTopRightRadius: DesignTokens.borderRadius.lg,
          paddingBottom: DesignTokens.spacing[6],
          ...DesignTokens.shadows.lg,
        },
        menuItem: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: DesignTokens.spacing[4],
          paddingHorizontal: DesignTokens.spacing[6],
          gap: DesignTokens.spacing[3],
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.secondary,
        },
        menuItemLast: {
          borderBottomWidth: 0,
        },
        menuItemDanger: {
          // Red tint for destructive actions
        },
        icon: {
          width: 24,
          alignItems: "center",
        },
        menuItemText: {
          fontSize: DesignTokens.typography.fontSize.base,
          color: theme.colors.text.primary,
          flex: 1,
        },
        menuItemTextDanger: {
          color: theme.colors.status.error,
        },
        cancelButton: {
          marginTop: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[4],
          paddingHorizontal: DesignTokens.spacing[6],
          alignItems: "center",
        },
        cancelButtonText: {
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
        },
      }),
    [theme]
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
      accessibilityLabel="Photo options menu"
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close menu"
      >
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
          accessibilityRole="none"
          testID={testID}
        >
          {/* View Full Size */}
          {onViewFullSize && (
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                onViewFullSize();
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel="View full size photo"
            >
              <View style={styles.icon}>
                <MaterialIcons
                  name="fullscreen"
                  size={24}
                  color={theme.colors.text.primary}
                />
              </View>
              <ThemedText style={styles.menuItemText}>
                View Full Size
              </ThemedText>
            </Pressable>
          )}

          {/* Delete Photo */}
          <Pressable
            style={[styles.menuItem, styles.menuItemLast]}
            onPress={() => {
              onDelete();
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel="Delete photo"
          >
            <View style={styles.icon}>
              <MaterialIcons
                name="delete"
                size={24}
                color={theme.colors.status.error}
              />
            </View>
            <ThemedText
              style={[styles.menuItemText, styles.menuItemTextDanger]}
            >
              Delete Photo
            </ThemedText>
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
