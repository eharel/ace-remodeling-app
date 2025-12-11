import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { MediaAsset } from "@/core/types";
import { ThemedIconButton } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { usePhotoDelete } from "@/shared/hooks";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { PhotoOptionsMenu } from "./PhotoOptionsMenu";

/**
 * Props for PhotoCard component
 */
export interface PhotoCardProps {
  /** Photo to display */
  photo: MediaAsset;
  /** Project ID */
  projectId: string;
  /** Component ID */
  componentId: string;
  /** Callback when photo is pressed */
  onPress?: () => void;
  /** Whether edit mode is enabled */
  editable?: boolean;
  /** Callback when photo is deleted */
  onDelete?: () => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * PhotoCard - Individual photo card in a grid
 *
 * Displays a photo with optional edit controls (delete button, drag handle).
 * Supports long-press for options menu and tap for viewing.
 *
 * @component
 */
export function PhotoCard({
  photo,
  projectId,
  componentId,
  onPress,
  editable = false,
  onDelete,
  testID = "photo-card",
}: PhotoCardProps) {
  const { theme } = useTheme();
  const { deletePhoto, isDeleting, deletingPhotoId } = usePhotoDelete();
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          aspectRatio: 4 / 3,
          borderRadius: DesignTokens.borderRadius.lg,
          overflow: "hidden",
          ...DesignTokens.shadows.sm,
        },
        imageContainer: {
          width: "100%",
          height: "100%",
          position: "relative",
        },
        image: {
          width: "100%",
          height: "100%",
        },
        overlay: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: editable ? "rgba(0, 0, 0, 0.3)" : "transparent",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          padding: DesignTokens.spacing[2],
          opacity: editable ? 1 : 0,
        },
        controls: {
          flexDirection: "row",
          gap: DesignTokens.spacing[2],
        },
        dragHandle: {
          position: "absolute",
          top: DesignTokens.spacing[2],
          left: DesignTokens.spacing[2],
        },
      }),
    [theme, editable]
  );

  const handleLongPress = () => {
    if (editable) {
      setOptionsMenuVisible(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePhoto(projectId, componentId, photo);
      setDeleteDialogVisible(false);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      // Error is handled by usePhotoDelete hook
      console.error("Failed to delete photo:", error);
    }
  };

  const isDeletingThisPhoto = isDeleting && deletingPhotoId === photo.id;

  return (
    <>
      <Pressable
        style={styles.container}
        onPress={onPress}
        onLongPress={handleLongPress}
        disabled={isDeletingThisPhoto}
        accessibilityRole="button"
        accessibilityLabel={`Photo: ${photo.filename || "Untitled"}`}
        accessibilityHint={
          editable
            ? "Long press for options, tap to view"
            : "Tap to view full size"
        }
        testID={testID}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: photo.url }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            recyclingKey={photo.id}
          />
          {editable && (
            <>
              {/* Drag Handle */}
              <View style={styles.dragHandle}>
                <MaterialIcons
                  name="drag-handle"
                  size={20}
                  color={theme.colors.text.inverse}
                />
              </View>

              {/* Delete Button Overlay */}
              <View style={styles.overlay}>
                <View style={styles.controls}>
                  <ThemedIconButton
                    icon="delete"
                    variant="overlay"
                    size="small"
                    onPress={() => setDeleteDialogVisible(true)}
                    disabled={isDeletingThisPhoto}
                    accessibilityLabel="Delete photo"
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </Pressable>

      {/* Options Menu */}
      <PhotoOptionsMenu
        photo={photo}
        projectId={projectId}
        componentId={componentId}
        visible={optionsMenuVisible}
        onClose={() => setOptionsMenuVisible(false)}
        onDelete={() => {
          setOptionsMenuVisible(false);
          setDeleteDialogVisible(true);
        }}
        onViewFullSize={onPress}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        visible={deleteDialogVisible}
        photoFilename={photo.filename || "photo"}
        photoUri={photo.url}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogVisible(false)}
        isDeleting={isDeletingThisPhoto}
      />
    </>
  );
}
