import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { MediaAsset } from "@/core/types";
import { ThemedIconButton } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { ThumbnailPickerModal } from "./ThumbnailPickerModal";

/**
 * Props for ThumbnailEditor component
 */
export interface ThumbnailEditorProps {
  /** Project ID */
  projectId: string;
  /** Component ID */
  componentId: string;
  /** Current thumbnail URL (from component.thumbnail) */
  currentThumbnail?: string;
  /** Gallery photos to choose from */
  media: MediaAsset[];
  /** Whether editing is enabled */
  editable?: boolean;
  /** Display size */
  size?: "small" | "medium" | "large";
  /** Aspect ratio for the thumbnail */
  aspectRatio?: number;
  /** Callback when thumbnail changes */
  onThumbnailChange?: () => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * ThumbnailEditor - Component for viewing and editing component thumbnail
 *
 * Displays the current thumbnail with an optional edit button overlay.
 * When editable, tapping opens ThumbnailPickerModal to select a new thumbnail.
 *
 * @component
 */
export function ThumbnailEditor({
  projectId,
  componentId,
  currentThumbnail,
  media,
  editable = false,
  size = "large",
  aspectRatio = 16 / 9,
  onThumbnailChange,
  testID = "thumbnail-editor",
}: ThumbnailEditorProps) {
  const { theme } = useTheme();
  const [pickerVisible, setPickerVisible] = useState(false);

  const sizeConfig = useMemo(() => {
    switch (size) {
      case "small":
        return { height: 120, iconSize: 20 };
      case "medium":
        return { height: 200, iconSize: 24 };
      default: // large
        return { height: 300, iconSize: 28 };
    }
  }, [size]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: "100%",
          height: sizeConfig.height,
          borderRadius: DesignTokens.borderRadius.lg,
          overflow: "hidden",
          backgroundColor: theme.colors.background.secondary,
          ...DesignTokens.shadows.sm,
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
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          justifyContent: "center",
          alignItems: "center",
          opacity: editable ? 1 : 0,
        },
        editButton: {
          position: "absolute",
          top: DesignTokens.spacing[3],
          right: DesignTokens.spacing[3],
        },
        placeholder: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background.secondary,
        },
        placeholderIcon: {
          opacity: 0.3,
        },
        placeholderText: {
          marginTop: DesignTokens.spacing[2],
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.text.tertiary,
        },
      }),
    [theme, sizeConfig, editable]
  );

  const handleEdit = () => {
    if (editable) {
      setPickerVisible(true);
    }
  };

  return (
    <>
      <Pressable
        style={styles.container}
        onPress={handleEdit}
        disabled={!editable}
        accessibilityRole={editable ? "button" : "image"}
        accessibilityLabel={
          editable
            ? "Edit thumbnail image"
            : currentThumbnail
            ? "Component thumbnail"
            : "No thumbnail set"
        }
        accessibilityHint={
          editable
            ? "Opens thumbnail picker to select or upload new image"
            : undefined
        }
        testID={testID}
      >
        {currentThumbnail ? (
          <>
            <Image
              source={{ uri: currentThumbnail }}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
              recyclingKey={currentThumbnail}
            />
            {editable && (
              <View style={styles.overlay}>
                <View style={styles.editButton}>
                  <ThemedIconButton
                    icon="edit"
                    variant="overlay"
                    size="medium"
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    accessibilityLabel="Edit thumbnail"
                  />
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholder}>
            <MaterialIcons
              name="image"
              size={sizeConfig.iconSize * 2}
              color={theme.colors.text.tertiary}
              style={styles.placeholderIcon}
            />
            {editable && (
              <ThemedIconButton
                icon="add-photo-alternate"
                variant="primary"
                size="medium"
                onPress={handleEdit}
                accessibilityLabel="Set thumbnail"
              />
            )}
          </View>
        )}
      </Pressable>

      {/* Thumbnail Picker Modal */}
      <ThumbnailPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        projectId={projectId}
        componentId={componentId}
        currentThumbnail={currentThumbnail}
        media={media}
        onThumbnailSelected={() => {
          setPickerVisible(false);
          if (onThumbnailChange) {
            onThumbnailChange();
          }
        }}
      />
    </>
  );
}
