import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import { MediaStage } from "@/core/types";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { usePhotoUpload } from "@/shared/hooks";

/**
 * Props for AddPhotoCard component
 */
export interface AddPhotoCardProps {
  /** Project ID */
  projectId: string;
  /** Component ID */
  componentId: string;
  /** Media stage */
  stage: MediaStage;
  /** Card size variant */
  size?: "small" | "medium" | "large";
  /** Optional caption for uploaded photos */
  caption?: string;
  /** Test ID for testing */
  testID?: string;
}

/**
 * AddPhotoCard - Card component that fits into gallery grids
 *
 * Displays a dashed border card with plus icon and "Add Photo" text.
 * Tapping opens the image picker and starts upload.
 * Shows upload progress inline when uploading.
 *
 * @component
 */
export function AddPhotoCard({
  projectId,
  componentId,
  stage,
  size = "medium",
  caption,
  testID = "add-photo-card",
}: AddPhotoCardProps) {
  const { theme } = useTheme();
  const { uploadPhoto, isUploading } = usePhotoUpload();
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const sizeConfig = useMemo(() => {
    switch (size) {
      case "small":
        return {
          iconSize: 24,
          fontSize: DesignTokens.typography.fontSize.sm,
          padding: DesignTokens.spacing[3],
        };
      case "large":
        return {
          iconSize: 48,
          fontSize: DesignTokens.typography.fontSize.lg,
          padding: DesignTokens.spacing[6],
        };
      default: // medium
        return {
          iconSize: 32,
          fontSize: DesignTokens.typography.fontSize.base,
          padding: DesignTokens.spacing[4],
        };
    }
  }, [size]);

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
  const handlePress = useCallback(async () => {
    // Request permissions first
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return;
    }

    try {
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled) {
        return; // User canceled
      }

      const uri = result.assets[0].uri;
      await uploadPhoto(uri, {
        projectId,
        componentId,
        stage,
        caption,
      });
    } catch (err) {
      const caughtError =
        err instanceof Error ? err : new Error("Upload failed");
      Alert.alert("Upload Failed", caughtError.message, [{ text: "OK" }]);
    }
  }, [requestPermissions, projectId, componentId, stage, caption, uploadPhoto]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flex: 1,
          aspectRatio: 4 / 3,
          borderRadius: DesignTokens.borderRadius.lg,
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: theme.colors.border.secondary,
          backgroundColor: theme.colors.background.secondary,
          justifyContent: "center",
          alignItems: "center",
          gap: DesignTokens.spacing[2],
          padding: sizeConfig.padding,
          ...DesignTokens.shadows.sm,
        },
        cardPressed: {
          opacity: DesignTokens.interactions.activeOpacity,
        },
        iconContainer: {
          width: sizeConfig.iconSize + DesignTokens.spacing[4],
          height: sizeConfig.iconSize + DesignTokens.spacing[4],
          borderRadius: (sizeConfig.iconSize + DesignTokens.spacing[4]) / 2,
          backgroundColor: theme.colors.background.elevated,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
        },
        text: {
          fontSize: sizeConfig.fontSize,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          color: theme.colors.text.secondary,
          textAlign: "center",
        },
      }),
    [theme, sizeConfig]
  );

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
      disabled={isUploading}
      accessibilityRole="button"
      accessibilityLabel="Add photo"
      accessibilityHint="Opens photo picker to add a new photo"
      testID={testID}
    >
      {isUploading ? (
        <MaterialIcons
          name="cloud-upload"
          size={sizeConfig.iconSize}
          color={theme.colors.interactive.primary}
        />
      ) : (
        <>
          <View style={styles.iconContainer}>
            <MaterialIcons
              name="add"
              size={sizeConfig.iconSize}
              color={theme.colors.interactive.primary}
            />
          </View>
          <ThemedText style={styles.text}>Add Photo</ThemedText>
        </>
      )}
    </Pressable>
  );
}
