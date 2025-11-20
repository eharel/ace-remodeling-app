import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Dimensions,
  ImageStyle,
  InteractionManager,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { DesignTokens } from "@/core/themes";
import { Picture } from "@/core/types";
import { Image } from "expo-image";
import { accessibilityStrings } from "../constants/accessibilityStrings";
import { useImageLoading } from "../hooks/useImageLoading";
import { useImagePreloading } from "../hooks/useImagePreloading";
import { useLazyLoading } from "../hooks/useLazyLoading";
import { ImageGalleryCarouselProps } from "../types/gallery.types";
import { ImageErrorState } from "./ImageErrorState";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

/**
 * Memoized image item component to prevent unnecessary re-renders
 * Only re-renders when its own props change, not when currentIndex changes
 */
const CarouselImageItem = React.memo<{
  image: Picture & { actualIndex: number };
  index: number;
  isCurrentImage: boolean;
  shouldRender: boolean;
  hasError: boolean;
  errorMessage: string | undefined;
  onImageLoad: (id: string) => void;
  onImageError: (id: string, error: string) => void;
  imageContainerStyle: ViewStyle;
  imageStyle: ImageStyle;
  totalImages: number;
}>(
  ({
    image,
    index,
    isCurrentImage,
    shouldRender,
    hasError,
    errorMessage,
    onImageLoad,
    onImageError,
    imageContainerStyle,
    imageStyle,
    totalImages,
  }) => {
    return (
      <View
        key={image.id}
        style={imageContainerStyle}
        accessible={isCurrentImage}
        accessibilityLabel={accessibilityStrings.image.getLabel(
          index,
          totalImages,
          image.type,
          image.description
        )}
        accessibilityRole="image"
        accessibilityHint={accessibilityStrings.image.getHint(isCurrentImage)}
      >
        {shouldRender && hasError && (
          <ImageErrorState
            error={errorMessage}
            onRetry={() => {
              // Reset the image state and retry loading
              onImageError(image.id, "");
            }}
          />
        )}

        {shouldRender && !hasError && (
          <Image
            source={{ uri: image.uri }}
            style={imageStyle}
            contentFit="contain"
            // Performance optimizations
            cachePolicy="memory-disk"
            priority={isCurrentImage ? "high" : "normal"}
            transition={200}
            recyclingKey={image.id}
            // Accessibility
            accessibilityLabel={accessibilityStrings.image.getLabel(
              index,
              totalImages,
              image.type,
              image.description
            )}
            accessibilityHint={accessibilityStrings.image.getHint(
              isCurrentImage
            )}
            accessibilityRole="image"
            // Event handlers
            onLoad={() => onImageLoad(image.id)}
            onError={() => onImageError(image.id, "Failed to load image")}
          />
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if:
    // - Image data changes
    // - Should render status changes
    // - Error state changes
    // - Current image status changes (for priority/accessibility)
    return (
      prevProps.image.id === nextProps.image.id &&
      prevProps.image.uri === nextProps.image.uri &&
      prevProps.shouldRender === nextProps.shouldRender &&
      prevProps.hasError === nextProps.hasError &&
      prevProps.errorMessage === nextProps.errorMessage &&
      prevProps.isCurrentImage === nextProps.isCurrentImage
    );
  }
);

CarouselImageItem.displayName = "CarouselImageItem";

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

    // Track pending image load callbacks to batch them and avoid blocking gestures
    const pendingLoadCallbacksRef = useRef<Set<string>>(new Set());
    const pendingLoadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

    // Deferred image load callback that batches updates to avoid blocking gestures
    const deferredOnImageLoad = useCallback(
      (imageId: string) => {
        // Always defer using InteractionManager to avoid blocking UI thread
        // This ensures callbacks don't fire during active animations/gestures
        pendingLoadCallbacksRef.current.add(imageId);

        // Clear existing timeout
        if (pendingLoadTimeoutRef.current) {
          clearTimeout(pendingLoadTimeoutRef.current);
        }

        // Batch callbacks and execute after interactions complete
        pendingLoadTimeoutRef.current = setTimeout(() => {
          InteractionManager.runAfterInteractions(() => {
            // Execute all pending callbacks
            pendingLoadCallbacksRef.current.forEach((id) => {
              onImageLoad(id);
            });
            pendingLoadCallbacksRef.current.clear();
            pendingLoadTimeoutRef.current = null;
          });
        }, 150); // Small delay to batch multiple loads that happen during swipe
      },
      [onImageLoad]
    );

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (pendingLoadTimeoutRef.current) {
          clearTimeout(pendingLoadTimeoutRef.current);
        }
      };
    }, []);

    // Performance optimizations - preloading happens in background
    useImagePreloading({
      images,
      currentIndex,
      preloadRadius: 2,
    });

    // For performance: Always render images for small/medium galleries
    // This eliminates re-renders from lazy loading state changes
    // Only use conditional rendering for very large galleries (20+ images)
    const shouldUseLazyLoading = images.length > 20;

    // Use lazy loading hook only for very large galleries
    // For smaller galleries, always render to avoid re-render stutters
    const { shouldRenderImage: lazyShouldRenderImage } = useLazyLoading({
      images,
      currentIndex,
      visibleRange: shouldUseLazyLoading ? 8 : images.length, // Wider range for large galleries
      loadThreshold: shouldUseLazyLoading ? 4 : images.length,
    });

    // Wrapper that always returns true for small galleries
    const shouldRenderImage = useCallback(
      (index: number) => {
        if (!shouldUseLazyLoading) return true;
        return lazyShouldRenderImage(index);
      },
      [shouldUseLazyLoading, lazyShouldRenderImage]
    );

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
              const shouldRender = shouldRenderImage(index);

              return (
                <CarouselImageItem
                  key={image.id}
                  image={image}
                  index={index}
                  isCurrentImage={isCurrentImage}
                  shouldRender={shouldRender}
                  hasError={imageError}
                  errorMessage={errorMessage}
                  onImageLoad={deferredOnImageLoad}
                  onImageError={onImageError}
                  imageContainerStyle={styles.imageContainer}
                  imageStyle={styles.image}
                  totalImages={images.length}
                />
              );
            })}
          </Animated.View>
        </GestureDetector>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Optimized memo: Don't re-render on currentIndex changes
    // Individual image components handle their own currentIndex updates
    // Only re-render when images array or theme changes
    return (
      prevProps.images === nextProps.images &&
      prevProps.theme === nextProps.theme &&
      prevProps.translateX === nextProps.translateX &&
      prevProps.panGesture === nextProps.panGesture
    );
  }
);

ImageGalleryCarousel.displayName = "ImageGalleryCarousel";
