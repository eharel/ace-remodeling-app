import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed";
import { DesignTokens } from "@/themes";

import { accessibilityStrings } from "./constants/accessibilityStrings";
import { MAX_PAGINATION_DOTS } from "./constants/gestureConstants";
import { ImageGalleryFooterProps, ThumbnailProps } from "./types/gallery.types";

/**
 * Thumbnail - Individual thumbnail component for the gallery footer
 *
 * This component renders a single thumbnail image with active state styling
 * and accessibility support. It's optimized for performance with React.memo.
 *
 * @component
 * @param {ThumbnailProps} props - The component props
 * @param {Picture} props.image - Image object to display
 * @param {number} props.index - Image index
 * @param {boolean} props.isActive - Whether this thumbnail is currently active
 * @param {(index: number) => void} props.onPress - Callback for thumbnail press
 * @param {Theme} props.theme - Current theme object
 *
 * @returns {JSX.Element} The thumbnail component
 */
const Thumbnail = React.memo<ThumbnailProps>(
  ({ image, index, isActive, onPress, theme }) => {
    const handlePress = React.useCallback(() => {
      onPress(index);
    }, [index, onPress]);

    const styles = React.useMemo(
      () =>
        StyleSheet.create({
          thumbnail: {
            width: DesignTokens.componentSizes.thumbnail,
            height: DesignTokens.componentSizes.thumbnail,
            borderRadius: DesignTokens.borderRadius.sm,
            borderWidth: 2,
            borderColor: "transparent",
          },
          thumbnailActive: {
            borderColor: theme.colors.interactive.primary,
          },
        }),
      [theme]
    );

    return (
      <Pressable
        onPress={handlePress}
        accessibilityLabel={accessibilityStrings.thumbnail.getLabel(
          index,
          image.type
        )}
        accessibilityHint={accessibilityStrings.thumbnail.getHint(isActive)}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        style={[
          styles.thumbnail,
          isActive && styles.thumbnailActive,
          { minWidth: 44, minHeight: 44 }, // Ensure minimum touch target size
        ]}
      >
        <Image
          source={{ uri: image.thumbnailUrl || image.url }}
          style={[styles.thumbnail, isActive && styles.thumbnailActive]}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
      </Pressable>
    );
  }
);

Thumbnail.displayName = "Thumbnail";

/**
 * ImageGalleryFooter - Footer component for the image gallery modal
 *
 * This component displays the gallery footer with image information, thumbnail
 * navigation, and proper safe area handling. It provides accessibility support
 * and follows the app's design system.
 *
 * Features:
 * - Image type and description display
 * - Thumbnail navigation strip
 * - Active thumbnail highlighting
 * - Safe area handling for different devices
 * - Accessibility support with screen reader labels
 * - Theme-aware styling
 *
 * @component
 * @param {ImageGalleryFooterProps} props - The component props
 * @param {Picture} props.currentImage - Current image object
 * @param {Picture[]} props.images - Array of all images
 * @param {number} props.currentIndex - Current image index
 * @param {(index: number) => void} props.onImageSelect - Callback for thumbnail selection
 * @param {Theme} props.theme - Current theme object
 *
 * @example
 * ```tsx
 * <ImageGalleryFooter
 *   currentImage={projectImages[2]}
 *   images={projectImages}
 *   currentIndex={2}
 *   onImageSelect={setCurrentIndex}
 *   theme={currentTheme}
 * />
 * ```
 *
 * @returns {JSX.Element} The footer component
 */
export const ImageGalleryFooter = React.memo<ImageGalleryFooterProps>(
  ({ currentImage, images, currentIndex, onImageSelect, theme }) => {
    const insets = useSafeAreaInsets();

    // Calculate pagination dots
    const paginationDots = useMemo(() => {
      const totalImages = images.length;
      if (totalImages <= MAX_PAGINATION_DOTS) {
        // Show all dots if we have few images
        return Array.from({ length: totalImages }, (_, i) => i);
      } else {
        // Show subset of dots for many images
        const startIndex = Math.max(
          0,
          currentIndex - Math.floor(MAX_PAGINATION_DOTS / 2)
        );
        const endIndex = Math.min(
          totalImages,
          startIndex + MAX_PAGINATION_DOTS
        );
        return Array.from(
          { length: endIndex - startIndex },
          (_, i) => startIndex + i
        );
      }
    }, [images.length, currentIndex]);

    const styles = useMemo(
      () =>
        StyleSheet.create({
          footer: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.background.overlay,
            padding: DesignTokens.spacing[4],
            paddingBottom: insets.bottom + DesignTokens.spacing[4],
          },
          imageInfo: {
            alignItems: "center",
            marginBottom: DesignTokens.spacing[4],
          },
          imageType: {
            fontSize: DesignTokens.typography.fontSize.lg,
            fontWeight: DesignTokens.typography.fontWeight.bold,
            color: theme.colors.text.inverse,
            textTransform: "capitalize",
            marginBottom: DesignTokens.spacing[2],
          },
          imageDescription: {
            fontSize: DesignTokens.typography.fontSize.base,
            color: theme.colors.text.inverse,
            textAlign: "center",
            lineHeight:
              DesignTokens.typography.lineHeight.normal *
              DesignTokens.typography.fontSize.base,
          },
          paginationContainer: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: DesignTokens.spacing[4],
            gap: 12,
          },
          paginationDot: {
            width: 8,
            height: 8,
            borderRadius: DesignTokens.borderRadius.sm,
            backgroundColor: "#ffffff",
            opacity: 0.4,
          },
          paginationDotActive: {
            opacity: 1,
          },
          thumbnailContainer: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: DesignTokens.spacing[2],
            paddingHorizontal: DesignTokens.spacing[4],
          },
        }),
      [theme, insets]
    );

    return (
      <View
        style={styles.footer}
        accessible={true}
        accessibilityLabel={accessibilityStrings.footer.label}
        accessibilityRole="toolbar"
      >
        {/* Image Info */}
        <View
          style={styles.imageInfo}
          accessible={true}
          accessibilityLabel={accessibilityStrings.imageInfo.getLabel(
            currentImage.type,
            currentImage.description
          )}
          accessibilityRole="text"
        >
          <ThemedText style={styles.imageType}>{currentImage.type}</ThemedText>
          {currentImage.description && (
            <ThemedText style={styles.imageDescription}>
              {currentImage.description}
            </ThemedText>
          )}
        </View>

        {/* Pagination Dots */}
        {images.length > 1 && (
          <View
            style={styles.paginationContainer}
            accessible={true}
            accessibilityLabel={`Page ${currentIndex + 1} of ${images.length}`}
            accessibilityRole="tablist"
          >
            {paginationDots.map((dotIndex) => (
              <View
                key={dotIndex}
                style={[
                  styles.paginationDot,
                  dotIndex === currentIndex && styles.paginationDotActive,
                ]}
                accessible={true}
                accessibilityLabel={`Page ${dotIndex + 1}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: dotIndex === currentIndex }}
              />
            ))}
          </View>
        )}

        {/* Thumbnails */}
        <View
          style={styles.thumbnailContainer}
          accessible={true}
          accessibilityLabel={accessibilityStrings.thumbnailContainer.label}
          accessibilityRole="tablist"
        >
          {images
            .slice(
              Math.max(0, currentIndex - 2),
              Math.min(images.length, currentIndex + 3)
            )
            .map((image, index) => {
              const actualIndex = Math.max(0, currentIndex - 2) + index;
              return (
                <Thumbnail
                  key={image.id}
                  image={image}
                  index={actualIndex}
                  isActive={actualIndex === currentIndex}
                  onPress={onImageSelect}
                  theme={theme}
                />
              );
            })}
        </View>
      </View>
    );
  }
);

ImageGalleryFooter.displayName = "ImageGalleryFooter";
