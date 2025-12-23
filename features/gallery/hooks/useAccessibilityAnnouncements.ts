import { useEffect } from "react";
import { AccessibilityInfo, View } from "react-native";

import { Picture } from "@/shared/types";

interface UseAccessibilityAnnouncementsProps {
  visible: boolean;
  currentIndex: number;
  images: Picture[];
  currentImage?: Picture;
  modalRef: React.RefObject<View>;
}

/**
 * useAccessibilityAnnouncements - Custom hook for managing accessibility announcements
 *
 * This hook provides screen reader support for the image gallery by announcing
 * modal state changes and image navigation events. It ensures the gallery is
 * accessible to users with visual impairments.
 *
 * Features:
 * - Announces modal opening with navigation instructions
 * - Announces image changes with context information
 * - Manages focus for screen readers
 * - Provides descriptive announcements for image content
 *
 * @param {UseAccessibilityAnnouncementsProps} params - The hook parameters
 * @param {boolean} params.visible - Whether the gallery modal is visible
 * @param {number} params.currentIndex - Current image index
 * @param {Picture[]} params.images - Array of images in the gallery
 * @param {Picture} [params.currentImage] - Current image object
 * @param {React.RefObject<View>} params.modalRef - Reference to modal container
 *
 * @example
 * ```tsx
 * useAccessibilityAnnouncements({
 *   visible: isModalVisible,
 *   currentIndex: 2,
 *   images: projectImages,
 *   currentImage: projectImages[2],
 *   modalRef: modalRef
 * });
 * ```
 */
export const useAccessibilityAnnouncements = ({
  visible,
  currentIndex,
  images,
  currentImage,
  modalRef,
}: UseAccessibilityAnnouncementsProps) => {
  // Focus management and accessibility announcements
  useEffect(() => {
    if (visible) {
      // Focus the modal when it opens
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);

      // Announce modal opening
      AccessibilityInfo.announceForAccessibility(
        `Image gallery opened. Showing image ${currentIndex + 1} of ${
          images.length
        }. Swipe left or right to navigate, or tap thumbnails below.`
      );
    }
  }, [visible, currentIndex, images.length, modalRef]);

  // Announce image changes for screen readers
  useEffect(() => {
    if (visible && currentImage) {
      const announcement = currentImage.description
        ? `Image ${currentIndex + 1} of ${images.length}: ${
            currentImage.type
          }. ${currentImage.description}`
        : `Image ${currentIndex + 1} of ${images.length}: ${currentImage.type}`;

      AccessibilityInfo.announceForAccessibility(announcement);
    }
  }, [currentIndex, visible, currentImage, images.length]);
};
