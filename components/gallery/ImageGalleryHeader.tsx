import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed";
import { DesignTokens } from "@/themes";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { accessibilityStrings } from "./constants/accessibilityStrings";
import { ImageGalleryHeaderProps } from "./types/gallery.types";

export const ImageGalleryHeader = React.memo<ImageGalleryHeaderProps>(
  ({ currentIndex, totalImages, onClose, theme }) => {
    const insets = useSafeAreaInsets();

    const styles = React.useMemo(
      () =>
        StyleSheet.create({
          header: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: insets.top + DesignTokens.spacing[4],
            paddingHorizontal: DesignTokens.spacing[4],
            paddingBottom: DesignTokens.spacing[4],
          },
          closeButton: {
            backgroundColor: theme.colors.background.overlay,
            borderRadius: DesignTokens.borderRadius.full,
            width: DesignTokens.componentSizes.iconButton,
            height: DesignTokens.componentSizes.iconButton,
            justifyContent: "center",
            alignItems: "center",
          },
          imageCounter: {
            backgroundColor: theme.colors.background.overlay,
            paddingHorizontal: DesignTokens.spacing[3],
            paddingVertical: DesignTokens.spacing[2],
            borderRadius: DesignTokens.borderRadius.md,
          },
        }),
      [theme, insets]
    );

    return (
      <View style={styles.header}>
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel={accessibilityStrings.closeButton.label}
          accessibilityHint={accessibilityStrings.closeButton.hint}
          accessibilityRole="button"
        >
          <MaterialIcons
            name="close"
            size={DesignTokens.typography.fontSize.lg}
            color={theme.colors.text.inverse}
          />
        </Pressable>

        <View
          style={styles.imageCounter}
          accessibilityLabel={accessibilityStrings.imageCounter.getLabel(
            currentIndex,
            totalImages
          )}
          accessibilityRole="text"
        >
          <ThemedText
            style={{
              color: theme.colors.text.inverse,
              fontWeight: DesignTokens.typography.fontWeight.semibold,
            }}
          >
            {currentIndex + 1} of {totalImages}
          </ThemedText>
        </View>
      </View>
    );
  }
);

ImageGalleryHeader.displayName = "ImageGalleryHeader";
