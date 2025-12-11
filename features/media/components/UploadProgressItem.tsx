import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { UploadingPhoto } from "@/shared/hooks";

/**
 * Props for UploadProgressItem component
 */
export interface UploadProgressItemProps {
  /** Upload progress data */
  upload: UploadingPhoto;
  /** Callback when cancel is pressed */
  onCancel?: () => void;
  /** Callback when retry is pressed (for failed uploads) */
  onRetry?: () => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * UploadProgressItem - Individual upload progress row
 *
 * Displays thumbnail, filename, progress bar, and status indicator.
 * Shows cancel button for in-progress uploads and retry button for failed uploads.
 *
 * @component
 */
export function UploadProgressItem({
  upload,
  onCancel,
  onRetry,
  testID = "upload-progress-item",
}: UploadProgressItemProps) {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
          gap: DesignTokens.spacing[3],
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
        },
        thumbnail: {
          width: 48,
          height: 48,
          borderRadius: DesignTokens.borderRadius.sm,
          backgroundColor: theme.colors.background.secondary,
        },
        content: {
          flex: 1,
          gap: DesignTokens.spacing[1],
        },
        filename: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          color: theme.colors.text.primary,
        },
        progressBar: {
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.colors.background.secondary,
          overflow: "hidden",
        },
        progressFill: {
          height: "100%",
          backgroundColor: theme.colors.interactive.primary,
          borderRadius: 2,
        },
        statusContainer: {
          flexDirection: "row",
          alignItems: "center",
          gap: DesignTokens.spacing[2],
        },
        statusText: {
          fontSize: DesignTokens.typography.fontSize.xs,
          color: theme.colors.text.secondary,
        },
        errorText: {
          fontSize: DesignTokens.typography.fontSize.xs,
          color: theme.colors.status.error,
        },
        actionButton: {
          padding: DesignTokens.spacing[2],
          borderRadius: DesignTokens.borderRadius.sm,
          backgroundColor: theme.colors.background.secondary,
        },
        iconButton: {
          padding: DesignTokens.spacing[1],
        },
      }),
    [theme]
  );

  const getStatusIcon = (): {
    icon: keyof typeof MaterialIcons.glyphMap;
    color: string;
  } => {
    switch (upload.status) {
      case "uploading":
      case "processing":
        return {
          icon: "cloud-upload",
          color: theme.colors.interactive.primary,
        };
      case "complete":
        return { icon: "check-circle", color: theme.colors.status.success };
      case "error":
        return { icon: "error", color: theme.colors.status.error };
      default:
        return { icon: "cloud-upload", color: theme.colors.text.secondary };
    }
  };

  const statusIcon = getStatusIcon();
  const filename = upload.localUri.split("/").pop() || "photo.jpg";

  return (
    <View style={styles.container} testID={testID}>
      {/* Thumbnail */}
      <Image
        source={{ uri: upload.localUri }}
        style={styles.thumbnail}
        contentFit="cover"
        cachePolicy="memory"
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Filename */}
        <ThemedText style={styles.filename} numberOfLines={1}>
          {filename}
        </ThemedText>

        {/* Progress Bar */}
        {upload.status === "uploading" || upload.status === "processing" ? (
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${upload.progress}%` }]}
            />
          </View>
        ) : null}

        {/* Status */}
        <View style={styles.statusContainer}>
          <MaterialIcons
            name={statusIcon.icon}
            size={16}
            color={statusIcon.color}
          />
          {upload.status === "error" && upload.error ? (
            <ThemedText style={styles.errorText} numberOfLines={1}>
              {upload.error}
            </ThemedText>
          ) : (
            <ThemedText style={styles.statusText}>
              {upload.status === "uploading"
                ? `${upload.progress}%`
                : upload.status === "processing"
                ? "Processing..."
                : upload.status === "complete"
                ? "Complete"
                : "Error"}
            </ThemedText>
          )}
        </View>
      </View>

      {/* Action Button */}
      {upload.status === "uploading" || upload.status === "processing" ? (
        onCancel ? (
          <Pressable
            style={styles.iconButton}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel upload"
            accessibilityHint="Cancels this photo upload"
          >
            <MaterialIcons
              name="close"
              size={20}
              color={theme.colors.text.secondary}
            />
          </Pressable>
        ) : null
      ) : upload.status === "error" && onRetry ? (
        <Pressable
          style={styles.actionButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry upload"
          accessibilityHint="Retries uploading this photo"
        >
          <MaterialIcons
            name="refresh"
            size={18}
            color={theme.colors.interactive.primary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
