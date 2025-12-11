import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import { MediaAsset } from "@/core/types";
import { ThemedButton, ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { usePhotoUpload, useProjectMutations } from "@/shared/hooks";

/**
 * Props for ThumbnailPickerModal component
 */
export interface ThumbnailPickerModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Project ID */
  projectId: string;
  /** Component ID */
  componentId: string;
  /** Current thumbnail URL */
  currentThumbnail?: string;
  /** Existing gallery photos to choose from */
  media: MediaAsset[];
  /** Callback when thumbnail is selected */
  onThumbnailSelected?: () => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * ThumbnailPickerModal - Modal for selecting component thumbnail
 *
 * Shows a grid of existing gallery photos and an option to upload a new image.
 * Tapping a photo sets it as the component thumbnail.
 *
 * @component
 */
export function ThumbnailPickerModal({
  visible,
  onClose,
  projectId,
  componentId,
  currentThumbnail,
  media,
  onThumbnailSelected,
  testID = "thumbnail-picker-modal",
}: ThumbnailPickerModalProps) {
  const { theme } = useTheme();
  const { updateComponentThumbnail } = useProjectMutations();
  const { uploadPhoto } = usePhotoUpload();
  const [uploading, setUploading] = useState(false);

  const imageMedia = useMemo(() => {
    return media.filter((m) => m.mediaType === "image");
  }, [media]);

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
          maxHeight: "80%",
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
        },
        uploadButton: {
          marginBottom: DesignTokens.spacing[4],
        },
        grid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: DesignTokens.spacing[3],
        },
        photoItem: {
          width: "30%",
          aspectRatio: 4 / 3,
          borderRadius: DesignTokens.borderRadius.md,
          overflow: "hidden",
          ...DesignTokens.shadows.sm,
        },
        photoItemSelected: {
          borderWidth: 3,
          borderColor: theme.colors.interactive.primary,
        },
        photoImage: {
          width: "100%",
          height: "100%",
        },
        photoOverlay: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          justifyContent: "center",
          alignItems: "center",
        },
        checkmark: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: theme.colors.interactive.primary,
          justifyContent: "center",
          alignItems: "center",
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

  // Request media library permissions
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        const message =
          "Photo library access is required to upload photos. Please enable it in Settings.";
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
      return true;
    } catch (err) {
      console.error("Failed to request permissions:", err);
      return false;
    }
  }, []);

  const handleSelectPhoto = useCallback(
    async (photoUrl: string) => {
      try {
        await updateComponentThumbnail(projectId, componentId, photoUrl);
        if (onThumbnailSelected) {
          onThumbnailSelected();
        }
        onClose();
      } catch (error) {
        console.error("Failed to set thumbnail:", error);
        Alert.alert("Error", "Failed to set thumbnail. Please try again.", [
          { text: "OK" },
        ]);
      }
    },
    [
      projectId,
      componentId,
      updateComponentThumbnail,
      onThumbnailSelected,
      onClose,
    ]
  );

  const handleClearThumbnail = useCallback(async () => {
    try {
      await updateComponentThumbnail(projectId, componentId, "");
      if (onThumbnailSelected) {
        onThumbnailSelected();
      }
      onClose();
    } catch (error) {
      console.error("Failed to clear thumbnail:", error);
      Alert.alert("Error", "Failed to clear thumbnail. Please try again.", [
        { text: "OK" },
      ]);
    }
  }, [
    projectId,
    componentId,
    updateComponentThumbnail,
    onThumbnailSelected,
    onClose,
  ]);

  const handleUploadNew = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return;
    }

    try {
      setUploading(true);

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled) {
        setUploading(false);
        return;
      }

      const uri = result.assets[0].uri;

      // Upload photo and add to gallery
      const uploadedAsset = await uploadPhoto(uri, {
        projectId,
        componentId,
        stage: "after", // Default to "after" for thumbnails
      });

      // Set the uploaded photo as thumbnail
      await updateComponentThumbnail(projectId, componentId, uploadedAsset.url);

      if (onThumbnailSelected) {
        onThumbnailSelected();
      }
      onClose();
    } catch (error) {
      console.error("Failed to upload and set thumbnail:", error);
      Alert.alert("Error", "Failed to upload thumbnail. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setUploading(false);
    }
  }, [
    requestPermissions,
    projectId,
    componentId,
    uploadPhoto,
    updateComponentThumbnail,
    onThumbnailSelected,
    onClose,
  ]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
      accessibilityLabel="Select thumbnail"
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close thumbnail picker"
      >
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
          accessibilityRole="none"
          testID={testID}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Select Thumbnail</ThemedText>
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
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
            {/* Upload New Button */}
            <ThemedButton
              variant="primary"
              onPress={handleUploadNew}
              loading={uploading}
              disabled={uploading}
              icon="add-photo-alternate"
              style={styles.uploadButton}
              accessibilityLabel="Upload new thumbnail"
            >
              Upload New Photo
            </ThemedButton>

            {/* Clear Thumbnail Button (only show if thumbnail is set) */}
            {currentThumbnail && (
              <ThemedButton
                variant="secondary"
                onPress={handleClearThumbnail}
                icon="delete-outline"
                style={styles.uploadButton}
                accessibilityLabel="Remove thumbnail"
              >
                Remove Thumbnail
              </ThemedButton>
            )}

            {/* Photo Grid */}
            {imageMedia.length > 0 ? (
              <View style={styles.grid}>
                {imageMedia.map((photo) => {
                  const isSelected = currentThumbnail === photo.url;
                  return (
                    <Pressable
                      key={photo.id}
                      style={[
                        styles.photoItem,
                        isSelected && styles.photoItemSelected,
                      ]}
                      onPress={() => handleSelectPhoto(photo.url)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isSelected
                          ? `Currently selected thumbnail: ${
                              photo.filename || "photo"
                            }`
                          : `Select as thumbnail: ${photo.filename || "photo"}`
                      }
                    >
                      <Image
                        source={{ uri: photo.url }}
                        style={styles.photoImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                      {isSelected && (
                        <View style={styles.photoOverlay}>
                          <View style={styles.checkmark}>
                            <MaterialIcons
                              name="check"
                              size={20}
                              color={theme.colors.text.inverse}
                            />
                          </View>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="photo-library"
                  size={48}
                  color={theme.colors.text.tertiary}
                />
                <ThemedText style={styles.emptyText}>
                  No photos available. Upload a new photo to use as thumbnail.
                </ThemedText>
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
