import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  InteractionManager,
  StyleSheet,
  View,
} from "react-native";

import { DesignTokens } from "@/shared/themes";
import { Picture } from "@/shared/types";
import { accessibilityStrings } from "../../constants/accessibilityStrings";
import { useImageLoading } from "../../hooks/useImageLoading";
import { useImagePreloading } from "../../hooks/useImagePreloading";
import { useLazyLoading } from "../../hooks/useLazyLoading";
import { ImageGalleryCarouselProps } from "../../types/gallery.types";
import { VideoPlayer } from "../VideoPlayer/VideoPlayer";
import { ImageErrorState } from "./ImageErrorState";
import { ZoomableImage } from "./ZoomableImage";

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
 * - Pinch-to-zoom, pan, and double-tap zoom on each image
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

  // When the active image is zoomed in, block FlatList paging so pan works instead
  const [isZoomed, setIsZoomed] = useState(false);

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

  // useLazyLoading is kept for API compatibility but its output is not used for
  // rendering decisions. FlatList's windowSize virtualization + expo-image's
  // memory-disk cache make a separate lazy rendering layer unnecessary.
  useLazyLoading({
    images,
    currentIndex,
    visibleRange: images.length,
    loadThreshold: images.length,
  });

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
          {imageError && (
            <ImageErrorState
              error={errorMessage}
              onRetry={() => {
                onImageError(image.id, "");
              }}
            />
          )}

          {!imageError && image.mediaType === "video" && (
            <VideoPlayer
              uri={image.uri}
              containerStyle={StyleSheet.absoluteFill}
              isActive={isCurrentImage}
            />
          )}

          {!imageError && image.mediaType !== "video" && (
            <ZoomableImage
              uri={image.uri}
              containerStyle={StyleSheet.absoluteFill}
              cachePolicy="memory-disk"
              priority={isCurrentImage ? "high" : "normal"}
              recyclingKey={image.id}
              accessibilityLabel={accessibilityStrings.image.getLabel(
                index,
                images.length,
                image.type,
                image.description
              )}
              accessibilityHint={accessibilityStrings.image.getHint(
                isCurrentImage
              )}
              onLoad={() => deferredOnImageLoad(image.id)}
              onError={() => onImageError(image.id, "Failed to load image")}
              onZoomChange={setIsZoomed}
              isActive={isCurrentImage}
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
        // Block paging while an image is zoomed so pan gesture takes over
        scrollEnabled={!isZoomed}
        initialScrollIndex={currentIndex}
        getItemLayout={getItemLayout}
        renderItem={renderItem}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        keyExtractor={keyExtractor}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            offset: info.index * screenWidth,
            animated: true,
          });
        }}
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

// Default React.memo (shallow prop comparison). The previous custom comparison
// intentionally excluded currentIndex, which caused ZoomableImage's isActive
// prop to never update and broke zoom auto-reset on navigation.
export const ImageGalleryCarousel = React.memo(ImageGalleryCarouselComponent);

ImageGalleryCarousel.displayName = "ImageGalleryCarousel";
