import React, { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/shared/contexts";

import { accessibilityStrings } from "../../constants/accessibilityStrings";
import { useAccessibilityAnnouncements } from "../../hooks/useAccessibilityAnnouncements";
import { useImageGallery } from "../../hooks/useImageGallery";
import { GalleryStyles, ImageGalleryProps } from "../../types/gallery.types";
import {
  ImageGalleryCarousel,
  ImageGalleryCarouselRef,
} from "./ImageGalleryCarousel";
import { ImageGalleryFooter } from "./ImageGalleryFooter";
import { ImageGalleryHeader } from "./ImageGalleryHeader";

/**
 * ImageGallery - Full-screen image gallery viewer (non-modal)
 *
 * Features:
 * - Full-screen image viewing with swipe navigation
 * - Thumbnail navigation in footer
 * - Accessibility support with screen reader announcements
 * - Smooth gesture-based navigation
 * - Performance optimizations with lazy loading and preloading
 * - Loading states and error handling
 *
 * Use this component directly for screen routes. For modal overlays,
 * use ImageGalleryModal instead.
 *
 * @component
 * @param {ImageGalleryProps} props - The component props
 * @param {Array<{uri: string}>} props.images - Array of image objects with uri property
 * @param {number} props.initialIndex - Initial image index to display (default: 0)
 * @param {() => void} props.onClose - Callback function called when gallery should be closed
 *
 * @example
 * ```tsx
 * <ImageGallery
 *   images={projectImages}
 *   initialIndex={selectedImageIndex}
 *   onClose={() => router.back()}
 * />
 * ```
 *
 * @returns {JSX.Element | null} The gallery component or null if no images
 */
export const ImageGallery = React.memo<ImageGalleryProps>(
  function ImageGallery({ images, initialIndex, onClose }) {
    const { theme } = useTheme();

    // Ensure initialIndex is within bounds before passing to hook
    const safeInitialIndex =
      images.length > 0
        ? Math.max(0, Math.min(initialIndex || 0, images.length - 1))
        : 0;

    // For non-modal use, we always consider it "visible"
    const { currentIndex, updateCurrentIndex, modalRef } = useImageGallery({
      visible: true,
      images,
      initialIndex: safeInitialIndex,
    });

    // Safety check: ensure currentIndex is valid before accessing array
    const safeCurrentIndex =
      images.length > 0
        ? Math.max(0, Math.min(currentIndex, images.length - 1))
        : 0;
    const currentImage =
      images.length > 0 ? images[safeCurrentIndex] : undefined;

    // Ref for programmatic carousel navigation (e.g., thumbnail taps)
    const carouselRef = useRef<ImageGalleryCarouselRef>(null);

    useAccessibilityAnnouncements({
      visible: true,
      currentIndex: safeCurrentIndex,
      images,
      currentImage,
      modalRef,
    });

    // Handle thumbnail navigation
    const handleThumbnailPress = React.useCallback(
      (index: number) => {
        carouselRef.current?.scrollToIndex(index);
        updateCurrentIndex(index);
      },
      [updateCurrentIndex]
    );

    const styles = useMemo(
      (): GalleryStyles =>
        StyleSheet.create({
          container: {
            flex: 1,
            backgroundColor: theme.colors.background.overlay,
          },
          carouselContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          },
        }),
      [theme]
    );

    // Safety checks: don't render if no images or invalid index
    if (images.length === 0 || !currentImage) {
      return null;
    }

    return (
      <View
        style={styles.container}
        ref={modalRef}
        accessible={true}
        accessibilityRole="none"
        accessibilityLabel={accessibilityStrings.modal.label}
      >
        <ImageGalleryHeader
          currentIndex={safeCurrentIndex}
          totalImages={images.length}
          onClose={onClose}
          theme={theme}
        />

        <View style={styles.carouselContainer}>
          <ImageGalleryCarousel
            ref={carouselRef}
            images={images}
            currentIndex={safeCurrentIndex}
            onIndexChange={updateCurrentIndex}
            theme={theme}
          />
        </View>

        <ImageGalleryFooter
          currentImage={currentImage}
          images={images}
          currentIndex={safeCurrentIndex}
          onImageSelect={handleThumbnailPress}
          theme={theme}
        />
      </View>
    );
  }
);

ImageGallery.displayName = "ImageGallery";
