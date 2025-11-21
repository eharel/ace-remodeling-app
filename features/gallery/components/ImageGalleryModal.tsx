import React, { useMemo, useRef } from "react";
import { Modal, StyleSheet, View } from "react-native";

import { useTheme } from "@/shared/contexts";

import { accessibilityStrings } from "../constants/accessibilityStrings";
import { useAccessibilityAnnouncements } from "../hooks/useAccessibilityAnnouncements";
import { useImageGallery } from "../hooks/useImageGallery";
import { GalleryStyles, ImageGalleryModalProps } from "../types/gallery.types";
import {
  ImageGalleryCarousel,
  ImageGalleryCarouselRef,
} from "./ImageGalleryCarousel";
import { ImageGalleryFooter } from "./ImageGalleryFooter";
import { ImageGalleryHeader } from "./ImageGalleryHeader";

/**
 * ImageGalleryModal - A full-screen modal for viewing and navigating through images
 *
 * Features:
 * - Full-screen image viewing with swipe navigation
 * - Thumbnail navigation in footer
 * - Accessibility support with screen reader announcements
 * - Smooth gesture-based navigation
 * - Performance optimizations with lazy loading and preloading
 * - Loading states and error handling
 *
 * @component
 * @param {ImageGalleryModalProps} props - The component props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Array<{uri: string}>} props.images - Array of image objects with uri property
 * @param {number} props.initialIndex - Initial image index to display (default: 0)
 * @param {() => void} props.onClose - Callback function called when modal is closed
 *
 * @example
 * ```tsx
 * <ImageGalleryModal
 *   visible={isModalVisible}
 *   images={projectImages}
 *   initialIndex={selectedImageIndex}
 *   onClose={() => setIsModalVisible(false)}
 * />
 * ```
 *
 * @returns {JSX.Element | null} The modal component or null if not visible
 */
export const ImageGalleryModal = React.memo<ImageGalleryModalProps>(
  ({ visible, images, initialIndex, onClose }) => {
    const { theme } = useTheme();

    // Ensure initialIndex is within bounds before passing to hook
    const safeInitialIndex =
      images.length > 0
        ? Math.max(0, Math.min(initialIndex || 0, images.length - 1))
        : 0;

    const { currentIndex, updateCurrentIndex, modalRef } = useImageGallery({
      visible,
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
      visible,
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
          modal: {
            flex: 1,
            backgroundColor: theme.colors.background.overlay,
          },
          container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          },
        }),
      [theme]
    );

    // Safety checks: don't render if not visible, no images, or invalid index
    if (!visible || images.length === 0 || !currentImage) {
      return null;
    }

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
        accessibilityViewIsModal={true}
        accessibilityLabel={accessibilityStrings.modal.label}
        accessibilityRole="none"
        accessibilityHint={accessibilityStrings.modal.hint}
        statusBarTranslucent={true}
      >
        <View
          style={styles.modal}
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

          <View style={styles.container}>
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
      </Modal>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return (
      prevProps.visible === nextProps.visible &&
      prevProps.initialIndex === nextProps.initialIndex &&
      prevProps.images.length === nextProps.images.length &&
      prevProps.onClose === nextProps.onClose
    );
  }
);

ImageGalleryModal.displayName = "ImageGalleryModal";
