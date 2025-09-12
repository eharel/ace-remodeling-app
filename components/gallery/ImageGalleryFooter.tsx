import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed";
import { DesignTokens } from "@/themes";

import { accessibilityStrings } from "./constants/accessibilityStrings";
import { ImageGalleryFooterProps, ThumbnailProps } from "./types/gallery.types";

// Thumbnail Component - extracted for better performance
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

export const ImageGalleryFooter = React.memo<ImageGalleryFooterProps>(
  ({ currentImage, images, currentIndex, onImageSelect, theme }) => {
    const insets = useSafeAreaInsets();

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
