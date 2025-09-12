import { useEffect } from "react";
import { AccessibilityInfo } from "react-native";

import { Picture } from "@/types";

interface UseAccessibilityAnnouncementsProps {
  visible: boolean;
  currentIndex: number;
  images: Picture[];
  currentImage?: Picture;
  modalRef: React.RefObject<any>;
}

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
