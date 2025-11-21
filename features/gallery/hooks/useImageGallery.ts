import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ImageGalleryModalProps,
  UseImageGalleryReturn,
} from "../types/gallery.types";

/**
 * useImageGallery - Custom hook for managing image gallery state and navigation
 *
 * This hook provides the core state management for the image gallery modal,
 * including current image index, navigation functions, and shared values for animations.
 *
 * @param {Object} params - The hook parameters
 * @param {boolean} params.visible - Whether the gallery modal is visible
 * @param {Array<{uri: string}>} params.images - Array of image objects
 * @param {number} params.initialIndex - Initial image index to display
 *
 * @returns {UseImageGalleryReturn} Object containing gallery state and functions
 * @returns {number} returns.currentIndex - Current image index
 * @returns {React.Dispatch<React.SetStateAction<number>>} returns.setCurrentIndex - Function to set current index
 * @returns {(newIndex: number) => void} returns.updateCurrentIndex - Function to update current index
 * @returns {React.RefObject<View>} returns.modalRef - Reference to modal container
 * @returns {React.RefObject<View>} returns.closeButtonRef - Reference to close button
 * @returns {EdgeInsets} returns.insets - Safe area insets
 *
 * @example
 * ```tsx
 * const { currentIndex, updateCurrentIndex } = useImageGallery({
 *   visible: isModalVisible,
 *   images: projectImages,
 *   initialIndex: 0
 * });
 * ```
 */
export const useImageGallery = ({
  visible,
  images,
  initialIndex,
}: Pick<
  ImageGalleryModalProps,
  "visible" | "images" | "initialIndex"
>): UseImageGalleryReturn => {
  const insets = useSafeAreaInsets();
  
  // Ensure initial index is safe before using it in useState
  const safeInitialIndex =
    images.length > 0
      ? Math.max(0, Math.min(initialIndex || 0, images.length - 1))
      : 0;
  
  const [currentIndex, setCurrentIndex] = useState<number>(safeInitialIndex);
  const modalRef = useRef<View>(null);
  const closeButtonRef = useRef<View>(null);

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    if (images.length === 0) {
      setCurrentIndex(0);
      return;
    }
    
    const safeIndex = Math.max(0, Math.min(initialIndex || 0, images.length - 1));
    setCurrentIndex(safeIndex);
  }, [initialIndex, images.length]);

  const updateCurrentIndex = useCallback((newIndex: number): void => {
    setCurrentIndex(newIndex);
  }, []);

  return {
    currentIndex,
    setCurrentIndex,
    updateCurrentIndex,
    modalRef,
    closeButtonRef,
    insets,
  };
};
