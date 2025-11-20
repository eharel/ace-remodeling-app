import React, { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { DesignTokens } from "@/core/themes";
import { Image } from "expo-image";
import { accessibilityStrings } from "../constants/accessibilityStrings";
import { useImageLoading } from "../hooks/useImageLoading";
import { useImagePreloading } from "../hooks/useImagePreloading";
import { useLazyLoading } from "../hooks/useLazyLoading";
import { ImageGalleryCarouselProps } from "../types/gallery.types";
import { ImageErrorState } from "./ImageErrorState";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * ImageGalleryCarousel - Main carousel component for displaying and navigating images
 *
 * This component renders the horizontal scrollable carousel of images with
 * gesture-based navigation, loading states, and performance optimizations.
 *
 * Features:
 * - Horizontal scrollable carousel with smooth animations
 * - Gesture-based navigation (swipe, pan)
 * - Loading states and error handling for individual images
 * - Performance optimizations (preloading, lazy loading)
 * - Accessibility support with screen reader announcements
 * - Memory management and cleanup
 *
 * @component
 * @param {ImageGalleryCarouselProps} props - The component props
 * @param {Picture[]} props.images - Array of images to display
 * @param {number} props.currentIndex - Current image index
 * @param {SharedValue<number>} props.translateX - Shared value for carousel translation
 * @param {PanGesture} props.panGesture - Pan gesture handler for navigation
 * @param {Theme} props.theme - Current theme object
 *
 * @example
 * ```tsx
 * <ImageGalleryCarousel
 *   images={projectImages}
 *   currentIndex={2}
 *   translateX={translateXValue}
 *   panGesture={panGesture}
 *   theme={currentTheme}
 * />
 * ```
 *
 * @returns {JSX.Element} The carousel component
 */
export const ImageGalleryCarousel = React.memo<ImageGalleryCarouselProps>(
  ({ images, currentIndex, translateX, panGesture, theme }) => {
    const { hasError, getImageError, onImageLoad, onImageError } =
      useImageLoading({ images });

    // Performance optimizations - preloading happens in background
    useImagePreloading({
      images,
      currentIndex,
      preloadRadius: 2,
    });

    // Only use lazy loading for galleries with more than 10 images
    const { shouldRenderImage } = useLazyLoading({
      images,
      currentIndex,
      visibleRange: images.length > 10 ? 5 : images.length, // Render all images for small galleries
      loadThreshold: 2,
    });

    // const {
    //   startRenderTiming,
    //   endRenderTiming,
    //   startImageLoadTiming,
    //   endImageLoadTiming,
    //   startGestureTiming,
    //   endGestureTiming,
    // } = usePerformanceMonitoring();

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
              const imageError = hasError(image.id);
              const errorMessage = getImageError(image.id);

              // Performance optimizations - testing preloading + lazy loading
              const shouldRender = shouldRenderImage(index);

              // Always render a container to maintain carousel positioning
              // but only load the actual image if in visible range
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
                  {shouldRender && imageError && (
                    <ImageErrorState
                      error={errorMessage}
                      onRetry={() => {
                        // Reset the image state and retry loading
                        onImageError(image.id, "");
                      }}
                    />
                  )}

                  {shouldRender && !imageError && (
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.image}
                      contentFit="contain"
                      // Performance optimizations
                      cachePolicy="memory-disk"
                      priority={isCurrentImage ? "high" : "normal"}
                      transition={200}
                      recyclingKey={image.id}
                      // Accessibility
                      accessibilityLabel={accessibilityStrings.image.getLabel(
                        index,
                        images.length,
                        image.type,
                        image.description
                      )}
                      accessibilityHint={accessibilityStrings.image.getHint(
                        isCurrentImage
                      )}
                      accessibilityRole="image"
                      // Event handlers
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
  },
  (prevProps, nextProps) => {
    // Re-render only when images array reference changes
    // currentIndex changes are handled by animated transforms, not re-renders
    // Note: We still need to re-render on currentIndex changes for accessibility
    // but the images themselves don't need to re-render
    return (
      prevProps.images === nextProps.images &&
      prevProps.currentIndex === nextProps.currentIndex &&
      prevProps.theme === nextProps.theme
    );
  }
);

ImageGalleryCarousel.displayName = "ImageGalleryCarousel";
