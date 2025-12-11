import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useState } from "react";
import { Alert, Linking, Platform, StyleSheet } from "react-native";

import { DesignTokens } from "@/core/themes";
import { MediaAsset, MediaStage } from "@/core/types";
import { ThemedButton, ThemedIconButton } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { usePhotoUpload } from "@/shared/hooks";

/**
 * Props for PhotoUploadButton component
 */
export interface PhotoUploadButtonProps {
  /** Project ID */
  projectId: string;
  /** Component ID */
  componentId: string;
  /** Media stage (before, after, in-progress, renderings, other) */
  stage: MediaStage;
  /** Optional caption for uploaded photos */
  caption?: string;
  /** Allow selecting multiple photos (default: true) */
  multiple?: boolean;
  /** Max photos per selection (default: 10) */
  maxPhotos?: number;
  /** Custom button content */
  children?: React.ReactNode;
  /** Callback when upload completes successfully */
  onUploadComplete?: (assets: MediaAsset[]) => void;
  /** Callback when upload fails */
  onUploadError?: (error: Error) => void;
  /** Button variant */
  variant?: "button" | "icon" | "fab";
  /** Disable the button */
  disabled?: boolean;
  /** Test ID for testing */
  testID?: string;
}

/**
 * PhotoUploadButton - Button component for uploading photos
 *
 * Handles image picker integration, permissions, and upload flow.
 * Supports multiple variants: standard button, icon button, or FAB.
 *
 * @component
 */
export function PhotoUploadButton({
  projectId,
  componentId,
  stage,
  caption,
  multiple = true,
  maxPhotos = 10,
  children,
  onUploadComplete,
  onUploadError,
  variant = "button",
  disabled = false,
  testID = "photo-upload-button",
}: PhotoUploadButtonProps) {
  const { theme } = useTheme();
  const { uploadPhoto, uploadPhotos, isUploading, error } = usePhotoUpload();
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Request media library permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        const message =
          "Photo library access is required to upload photos. Please enable it in Settings.";
        setPermissionError(message);

        if (status === "denied") {
          Alert.alert(
            "Permission Required",
            message,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => {
                  if (Platform.OS === "ios") {
                    Linking.openURL("app-settings:");
                  } else {
                    Linking.openSettings();
                  }
                },
              },
            ],
            { cancelable: true }
          );
        }
        return false;
      }

      setPermissionError(null);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to request permissions";
      setPermissionError(errorMessage);
      return false;
    }
  }, []);

  // Handle photo selection and upload
  const handleUpload = useCallback(async () => {
    // Request permissions first
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return;
    }

    try {
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: multiple,
        selectionLimit: multiple ? maxPhotos : 1,
        quality: 0.8, // Slight compression for faster uploads
        allowsEditing: false,
      });

      if (result.canceled) {
        return; // User canceled
      }

      const uris = result.assets.map((asset) => asset.uri);
      const uploadOptions = {
        projectId,
        componentId,
        stage,
        caption,
      };

      // Upload photos
      let uploadedAssets: MediaAsset[];
      if (uris.length === 1) {
        // Single photo upload
        const asset = await uploadPhoto(uris[0], uploadOptions);
        uploadedAssets = [asset];
      } else {
        // Multiple photos upload
        uploadedAssets = await uploadPhotos(uris, uploadOptions);
      }

      // Call success callback
      if (onUploadComplete && uploadedAssets.length > 0) {
        onUploadComplete(uploadedAssets);
      }
    } catch (err) {
      const caughtError =
        err instanceof Error ? err : new Error("Upload failed");
      setPermissionError(null); // Clear permission error if upload error occurred

      if (onUploadError) {
        onUploadError(caughtError);
      } else {
        // Show default error alert if no handler provided
        Alert.alert("Upload Failed", caughtError.message, [{ text: "OK" }]);
      }
    }
  }, [
    requestPermissions,
    multiple,
    maxPhotos,
    projectId,
    componentId,
    stage,
    caption,
    uploadPhoto,
    uploadPhotos,
    onUploadComplete,
    onUploadError,
  ]);

  // Render based on variant
  if (variant === "icon") {
    return (
      <ThemedIconButton
        icon={isUploading ? "cloud-upload" : "add-photo-alternate"}
        variant="primary"
        onPress={handleUpload}
        disabled={disabled || isUploading}
        accessibilityLabel={isUploading ? "Uploading photo" : "Upload photo"}
        accessibilityHint="Opens photo picker to select and upload photos"
        testID={testID}
      />
    );
  }

  if (variant === "fab") {
    const styles = StyleSheet.create({
      fab: {
        width: DesignTokens.components.fab.size,
        height: DesignTokens.components.fab.size,
        borderRadius: DesignTokens.components.fab.borderRadius,
        backgroundColor: theme.colors.interactive.primary,
        justifyContent: "center",
        alignItems: "center",
        ...DesignTokens.shadows.md,
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    });

    return (
      <ThemedIconButton
        icon="add-photo-alternate"
        variant="primary"
        size="large"
        onPress={handleUpload}
        disabled={disabled || isUploading}
        accessibilityLabel="Upload photo"
        accessibilityHint="Opens photo picker to select and upload photos"
        testID={testID}
        style={styles.fab}
      />
    );
  }

  // Default: button variant
  return (
    <ThemedButton
      onPress={handleUpload}
      disabled={disabled || isUploading}
      loading={isUploading}
      icon="add-photo-alternate"
      variant="primary"
      accessibilityLabel="Upload photo"
      accessibilityHint="Opens photo picker to select and upload photos"
      testID={testID}
    >
      {children || "Upload Photo"}
    </ThemedButton>
  );
}
