import React from "react";
import { Modal, StyleSheet } from "react-native";

import { accessibilityStrings } from "../../constants/accessibilityStrings";
import { ImageGalleryModalProps } from "../../types/gallery.types";
import { ImageGallery } from "./ImageGallery";

/**
 * ImageGalleryModal - Modal wrapper for ImageGallery component
 *
 * This component wraps ImageGallery with a Modal for use as an overlay.
 * For screen routes, use ImageGallery directly instead.
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
  function ImageGalleryModal({ visible, images, initialIndex, onClose }) {
    // Safety checks: don't render if not visible or no images
    if (!visible || images.length === 0) {
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
        <ImageGallery
          images={images}
          initialIndex={initialIndex}
          onClose={onClose}
        />
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
