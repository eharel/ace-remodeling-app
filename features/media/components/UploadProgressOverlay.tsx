import { MaterialIcons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { UploadingPhoto } from "@/shared/hooks";
import { UploadProgressItem } from "./UploadProgressItem";

/**
 * Props for UploadProgressOverlay component
 */
export interface UploadProgressOverlayProps {
  /** Currently uploading photos */
  uploads: UploadingPhoto[];
  /** Callback when overlay should be dismissed */
  onDismiss?: () => void;
  /** Callback when an upload should be canceled */
  onCancelUpload?: (uploadId: string) => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * UploadProgressOverlay - Bottom sheet overlay showing upload progress
 *
 * Displays all currently uploading photos with progress indicators.
 * Only renders when there are active uploads. Animates in/out smoothly.
 *
 * @component
 */
export function UploadProgressOverlay({
  uploads,
  onDismiss,
  onCancelUpload,
  testID = "upload-progress-overlay",
}: UploadProgressOverlayProps) {
  const { theme } = useTheme();
  const [isDismissed, setIsDismissed] = useState(false);
  const previousUploadCountRef = useRef(uploads.length);

  // Only show if there are any uploads (active or completed)
  const activeUploads = uploads.filter(
    (u) => u.status === "uploading" || u.status === "processing"
  );
  const hasActiveUploads = activeUploads.length > 0;
  const hasAnyUploads = uploads.length > 0;

  // Reset dismissed state when new uploads start (upload count increases)
  useEffect(() => {
    if (uploads.length > previousUploadCountRef.current) {
      setIsDismissed(false);
    }
    previousUploadCountRef.current = uploads.length;
  }, [uploads.length]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        container: {
          backgroundColor: theme.colors.background.card,
          borderTopLeftRadius: DesignTokens.borderRadius.lg,
          borderTopRightRadius: DesignTokens.borderRadius.lg,
          maxHeight: "60%",
          ...DesignTokens.shadows.lg,
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: DesignTokens.spacing[4],
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.primary,
        },
        headerTitle: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
        },
        closeButton: {
          padding: DesignTokens.spacing[1],
        },
        content: {
          padding: DesignTokens.spacing[4],
          gap: DesignTokens.spacing[3],
        },
        emptyState: {
          padding: DesignTokens.spacing[8],
          alignItems: "center",
          gap: DesignTokens.spacing[2],
        },
        emptyText: {
          fontSize: DesignTokens.typography.fontSize.base,
          color: theme.colors.text.secondary,
          textAlign: "center",
        },
      }),
    [theme]
  );

  const handleCancel = useCallback(
    (uploadId: string) => {
      if (onCancelUpload) {
        onCancelUpload(uploadId);
      }
    },
    [onCancelUpload]
  );

  // Dismiss handler - updates internal state and calls optional callback
  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  // Only return null if there are no uploads at all
  if (!hasAnyUploads) {
    return null;
  }

  // Don't show if user dismissed it (unless there are new active uploads)
  const shouldShow = !isDismissed || hasActiveUploads;

  return (
    <Modal
      visible={shouldShow}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
      accessibilityViewIsModal={true}
      accessibilityLabel="Upload progress"
    >
      <Pressable
        style={styles.overlay}
        onPress={handleDismiss}
        accessibilityRole="button"
        accessibilityLabel="Close upload progress"
      >
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
          accessibilityRole="none"
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>
              {hasActiveUploads
                ? `Uploading ${activeUploads.length} photo${
                    activeUploads.length !== 1 ? "s" : ""
                  }`
                : "Upload Complete"}
            </ThemedText>
            <Pressable
              style={styles.closeButton}
              onPress={handleDismiss}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <MaterialIcons
                name="close"
                size={24}
                color={theme.colors.text.primary}
              />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {!hasActiveUploads && hasAnyUploads ? (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="check-circle"
                  size={48}
                  color={theme.colors.status.success}
                />
                <ThemedText style={styles.emptyText}>
                  All uploads completed
                </ThemedText>
              </View>
            ) : (
              uploads.map((upload) => (
                <UploadProgressItem
                  key={upload.id}
                  upload={upload}
                  onCancel={
                    upload.status === "uploading" ||
                    upload.status === "processing"
                      ? () => handleCancel(upload.id)
                      : undefined
                  }
                />
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
