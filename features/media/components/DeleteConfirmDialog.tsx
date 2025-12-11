import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedButton, ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

/**
 * Props for DeleteConfirmDialog component
 */
export interface DeleteConfirmDialogProps {
  /** Whether the dialog is visible */
  visible: boolean;
  /** Photo filename to display */
  photoFilename: string;
  /** Photo URI for thumbnail preview */
  photoUri?: string;
  /** Callback when delete is confirmed */
  onConfirm: () => void;
  /** Callback when delete is canceled */
  onCancel: () => void;
  /** Whether deletion is in progress */
  isDeleting: boolean;
  /** Test ID for testing */
  testID?: string;
}

/**
 * DeleteConfirmDialog - Confirmation dialog for photo deletion
 *
 * Shows a modal dialog with photo thumbnail, filename, and confirmation message.
 * Prevents dismissal while deletion is in progress.
 *
 * @component
 */
export function DeleteConfirmDialog({
  visible,
  photoFilename,
  photoUri,
  onConfirm,
  onCancel,
  isDeleting,
  testID = "delete-confirm-dialog",
}: DeleteConfirmDialogProps) {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: DesignTokens.spacing[4],
        },
        container: {
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.lg,
          padding: DesignTokens.spacing[6],
          width: "100%",
          maxWidth: 400,
          ...DesignTokens.shadows.lg,
        },
        thumbnail: {
          width: 120,
          height: 120,
          borderRadius: DesignTokens.borderRadius.md,
          backgroundColor: theme.colors.background.secondary,
          alignSelf: "center",
          marginBottom: DesignTokens.spacing[4],
        },
        title: {
          fontSize: DesignTokens.typography.fontSize.xl,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
          textAlign: "center",
          marginBottom: DesignTokens.spacing[2],
        },
        message: {
          fontSize: DesignTokens.typography.fontSize.base,
          color: theme.colors.text.secondary,
          textAlign: "center",
          marginBottom: DesignTokens.spacing[4],
          lineHeight: DesignTokens.typography.lineHeight.relaxed,
        },
        filename: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.text.tertiary,
          textAlign: "center",
          marginBottom: DesignTokens.spacing[6],
          fontFamily: DesignTokens.typography.fontFamily.mono,
        },
        buttonRow: {
          flexDirection: "row",
          gap: DesignTokens.spacing[3],
        },
        button: {
          flex: 1,
        },
      }),
    [theme]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isDeleting ? undefined : onCancel}
      accessibilityViewIsModal={true}
      accessibilityLabel="Delete photo confirmation"
    >
      <Pressable
        style={styles.overlay}
        onPress={isDeleting ? undefined : onCancel}
        accessibilityRole="button"
        accessibilityLabel="Close dialog"
      >
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
          accessibilityRole="none"
          testID={testID}
        >
          {/* Thumbnail */}
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              style={styles.thumbnail}
              contentFit="cover"
              cachePolicy="memory"
            />
          )}

          {/* Title */}
          <ThemedText style={styles.title}>Delete Photo?</ThemedText>

          {/* Message */}
          <ThemedText style={styles.message}>
            Are you sure you want to delete this photo? This action cannot be
            undone.
          </ThemedText>

          {/* Filename */}
          <ThemedText style={styles.filename} numberOfLines={1}>
            {photoFilename}
          </ThemedText>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <ThemedButton
              variant="secondary"
              onPress={onCancel}
              disabled={isDeleting}
              style={styles.button}
              accessibilityLabel="Cancel deletion"
            >
              Cancel
            </ThemedButton>
            <ThemedButton
              variant="primary"
              onPress={onConfirm}
              loading={isDeleting}
              disabled={isDeleting}
              style={styles.button}
              accessibilityLabel="Confirm deletion"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </ThemedButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
