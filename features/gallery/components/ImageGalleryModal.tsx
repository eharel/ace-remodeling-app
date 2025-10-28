import React, { useMemo } from "react";
import { Modal, StyleSheet, View } from "react-native";

import { useTheme } from "@/shared/contexts";

import { accessibilityStrings } from "../constants/accessibilityStrings";
import { useAccessibilityAnnouncements } from "../hooks/useAccessibilityAnnouncements";
import { useImageGallery } from "../hooks/useImageGallery";
import { useImageNavigation } from "../hooks/useImageNavigation";
import { ImageGalleryCarousel } from "./ImageGalleryCarousel";
import { ImageGalleryFooter } from "./ImageGalleryFooter";
import { ImageGalleryHeader } from "./ImageGalleryHeader";
import { GalleryStyles, ImageGalleryModalProps } from "../types/gallery.types";

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

    const { currentIndex, translateX, updateCurrentIndex, modalRef } =
      useImageGallery({ visible, images, initialIndex });

    const currentImage = images[currentIndex];

    useAccessibilityAnnouncements({
      visible,
      currentIndex,
      images,
      currentImage,
      modalRef,
    });

    const { goToImage: navigateToImage, panGesture } = useImageNavigation({
      currentIndex,
      imagesLength: images.length,
      translateX,
      onIndexChange: updateCurrentIndex,
    });

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

    if (!visible || !currentImage) {
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
            currentIndex={currentIndex}
            totalImages={images.length}
            onClose={onClose}
            theme={theme}
          />

          <View style={styles.container}>
            <ImageGalleryCarousel
              images={images}
              currentIndex={currentIndex}
              translateX={translateX}
              panGesture={panGesture}
              theme={theme}
            />
          </View>

          <ImageGalleryFooter
            currentImage={currentImage}
            images={images}
            currentIndex={currentIndex}
            onImageSelect={navigateToImage}
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
