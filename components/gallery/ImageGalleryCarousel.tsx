import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { DesignTokens } from "@/themes";

import { ImageErrorState } from "./ImageErrorState";
import { accessibilityStrings } from "./constants/accessibilityStrings";
import { useImageLoading } from "./hooks/useImageLoading";
import { ImageGalleryCarouselProps } from "./types/gallery.types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const ImageGalleryCarousel = React.memo<ImageGalleryCarouselProps>(
  ({ images, currentIndex, translateX, panGesture, theme }) => {
    const { isLoading, hasError, getImageError, onImageLoad, onImageError } =
      useImageLoading({ images });

    const styles = useMemo(
      () =>
        StyleSheet.create({
          carouselContainer: {
            width: screenWidth,
            height: screenHeight * 0.7,
            overflow: "hidden",
          },
          carousel: {
            flexDirection: "row",
            height: "100%",
          },
          imageContainer: {
            width: screenWidth,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: DesignTokens.spacing[6],
          },
          image: {
            width: "100%",
            height: "100%",
          },
        }),
      []
    );

    const carouselStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });

    // Render all images for proper carousel positioning
    const visibleImages = useMemo(() => {
      return images.map((image, index) => ({
        ...image,
        actualIndex: index,
      }));
    }, [images]);

    return (
      <View style={styles.carouselContainer}>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[styles.carousel, carouselStyle]}
            accessible={true}
            accessibilityLabel={accessibilityStrings.carousel.getLabel(
              currentIndex,
              images.length
            )}
            accessibilityRole="scrollbar"
          >
            {visibleImages.map((image, index) => {
              const isCurrentImage = index === currentIndex;
              const imageLoading = isLoading(image.id);
              const imageError = hasError(image.id);
              const errorMessage = getImageError(image.id);

              return (
                <View
                  key={image.id}
                  style={styles.imageContainer}
                  accessible={isCurrentImage}
                  accessibilityLabel={accessibilityStrings.image.getLabel(
                    index,
                    images.length,
                    image.type,
                    image.description
                  )}
                  accessibilityRole="image"
                  accessibilityHint={accessibilityStrings.image.getHint(
                    isCurrentImage
                  )}
                >
                  {imageError && (
                    <ImageErrorState
                      error={errorMessage}
                      onRetry={() => {
                        // Reset the image state and retry loading
                        onImageError(image.id, "");
                      }}
                    />
                  )}

                  {!imageError && (
                    <Image
                      source={{ uri: image.url }}
                      style={styles.image}
                      contentFit="contain"
                      transition={200}
                      accessibilityIgnoresInvertColors={true}
                      onLoad={() => onImageLoad(image.id)}
                      onError={() =>
                        onImageError(image.id, "Failed to load image")
                      }
                    />
                  )}
                </View>
              );
            })}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);

ImageGalleryCarousel.displayName = "ImageGalleryCarousel";
