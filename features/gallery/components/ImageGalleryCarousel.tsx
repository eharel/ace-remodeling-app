import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  Dimensions,
  FlatList,
  InteractionManager,
  StyleSheet,
  View,
} from "react-native";

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
 * Ref methods exposed by ImageGalleryCarousel
 */
export interface ImageGalleryCarouselRef {
  scrollToIndex: (index: number) => void;
}

/**
 * ImageGalleryCarousel - Main carousel component for displaying and navigating images
 *
 * This component uses FlatList for native scroll performance, providing smooth
 * 60fps animations on the UI thread with built-in virtualization.
 *
 * Features:
 * - Native horizontal scrolling with paging
 * - Virtualization (only renders visible images)
 * - Loading states and error handling for individual images
 * - Performance optimizations (preloading, lazy loading)
 * - Accessibility support with screen reader announcements
 * - Memory management and cleanup
 *
 * @component
 * @param {ImageGalleryCarouselProps} props - The component props
 * @param {Picture[]} props.images - Array of images to display
 * @param {number} props.currentIndex - Current image index
 * @param {(index: number) => void} props.onIndexChange - Callback when index changes
 * @param {Theme} props.theme - Current theme object
 *
 * @example
 * ```tsx
 * const carouselRef = useRef<ImageGalleryCarouselRef>(null);
 *
 * <ImageGalleryCarousel
 *   ref={carouselRef}
 *   images={projectImages}
 *   currentIndex={2}
 *   onIndexChange={setCurrentIndex}
 *   theme={currentTheme}
 * />
 *
 * // Programmatic navigation
 * carouselRef.current?.scrollToIndex(5);
 * ```
 *
 * @returns {JSX.Element} The carousel component
 */
const ImageGalleryCarouselComponent = React.forwardRef<
  ImageGalleryCarouselRef,
  ImageGalleryCarouselProps
>(({ images, currentIndex, onIndexChange, theme }, ref) => {
  const flatListRef = useRef<FlatList<Picture>>(null);
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

  // Expose scrollToIndex method via ref for programmatic navigation
  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number) => {
        if (flatListRef.current && index >= 0 && index < images.length) {
          flatListRef.current.scrollToIndex({
            index,
            animated: true,
          });
        }
      },
    }),
    [images.length]
  );

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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        carouselContainer: {
          width: screenWidth,
          height: screenHeight * 0.7,
          overflow: "hidden",
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

  // Handle scroll end to update current index
  const handleMomentumScrollEnd = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / screenWidth);

      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < images.length
      ) {
        onIndexChange(newIndex);
      }
    },
    [currentIndex, images.length, onIndexChange]
  );

  // Render individual image item
  const renderItem = useCallback(
    ({ item: image, index }: { item: Picture; index: number }) => {
      const isCurrentImage = index === currentIndex;
      const imageError = hasError(image.id);
      const errorMessage = getImageError(image.id);
      const shouldRender = shouldRenderImage(index);

      return (
        <View
          style={styles.imageContainer}
          accessible={isCurrentImage}
          accessibilityLabel={accessibilityStrings.image.getLabel(
            index,
            images.length,
            image.type,
            image.description
          )}
          accessibilityRole="image"
          accessibilityHint={accessibilityStrings.image.getHint(isCurrentImage)}
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
              onLoad={() => deferredOnImageLoad(image.id)}
              onError={() => onImageError(image.id, "Failed to load image")}
            />
          )}
        </View>
      );
    },
    [
      currentIndex,
      images.length,
      hasError,
      getImageError,
      shouldRenderImage,
      styles,
      deferredOnImageLoad,
      onImageError,
    ]
  );

  // Get item layout for consistent scroll performance
  const getItemLayout = useCallback(
    (_data: ArrayLike<Picture> | null | undefined, index: number) => ({
      length: screenWidth,
      offset: screenWidth * index,
      index,
    }),
    []
  );

  // Key extractor
  const keyExtractor = useCallback((item: Picture) => item.id, []);

  // Sync scroll position when currentIndex changes externally (e.g., thumbnail tap)
  useEffect(() => {
    if (
      flatListRef.current &&
      currentIndex >= 0 &&
      currentIndex < images.length
    ) {
      // Use a small delay to ensure FlatList is ready
      const timeout = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: currentIndex,
          animated: true,
        });
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, images.length]);

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth}
        snapToAlignment="center"
        decelerationRate="fast"
        initialScrollIndex={currentIndex}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        keyExtractor={keyExtractor}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={3}
        accessible={true}
        accessibilityLabel={accessibilityStrings.carousel.getLabel(
          currentIndex,
          images.length
        )}
        accessibilityRole="scrollbar"
      />
    </View>
  );
});

ImageGalleryCarouselComponent.displayName = "ImageGalleryCarousel";

// Memoize with custom comparison
export const ImageGalleryCarousel = React.memo(
  ImageGalleryCarouselComponent,
  (prevProps, nextProps) => {
    // Optimized memo: Only re-render when images array or theme changes
    // currentIndex changes are handled by FlatList's scroll position
    return (
      prevProps.images === nextProps.images &&
      prevProps.theme === nextProps.theme &&
      prevProps.onIndexChange === nextProps.onIndexChange
    );
  }
);

ImageGalleryCarousel.displayName = "ImageGalleryCarousel";
