import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/shared/components";
import { DesignTokens } from "@/core/themes";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { accessibilityStrings } from "../constants/accessibilityStrings";
import { ImageGalleryHeaderProps } from "../types/gallery.types";

/**
 * ImageGalleryHeader - Header component for the image gallery modal
 *
 * This component displays the gallery header with image counter, close button,
 * and proper safe area handling. It provides accessibility support and
 * follows the app's design system.
 *
 * Features:
 * - Image counter display (e.g., "1 of 5")
 * - Close button with haptic feedback
 * - Safe area handling for different devices
 * - Accessibility support with screen reader labels
 * - Theme-aware styling
 *
 * @component
 * @param {ImageGalleryHeaderProps} props - The component props
 * @param {number} props.currentIndex - Current image index (0-based)
 * @param {number} props.totalImages - Total number of images
 * @param {() => void} props.onClose - Callback function for close button
 * @param {Theme} props.theme - Current theme object
 *
 * @example
 * ```tsx
 * <ImageGalleryHeader
 *   currentIndex={2}
 *   totalImages={10}
 *   onClose={() => setIsModalVisible(false)}
 *   theme={currentTheme}
 * />
 * ```
 *
 * @returns {JSX.Element} The header component
 */
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
            backgroundColor: "transparent",
            paddingHorizontal: DesignTokens.spacing[3],
            paddingVertical: DesignTokens.spacing[2],
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
              fontSize: DesignTokens.typography.fontSize.base,
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
