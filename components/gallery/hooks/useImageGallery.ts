import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ImageGalleryModalProps,
  UseImageGalleryReturn,
} from "../types/gallery.types";

const { width: screenWidth } = Dimensions.get("window");

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
 * @returns {SharedValue<number>} returns.translateX - Shared value for carousel translation
 * @returns {(index: number) => void} returns.goToImage - Function to navigate to specific image
 * @returns {(newIndex: number) => void} returns.updateCurrentIndex - Function to update current index
 * @returns {React.RefObject<View>} returns.modalRef - Reference to modal container
 * @returns {React.RefObject<View>} returns.closeButtonRef - Reference to close button
 * @returns {EdgeInsets} returns.insets - Safe area insets
 *
 * @example
 * ```tsx
 * const { currentIndex, translateX, goToImage } = useImageGallery({
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
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const modalRef = useRef<View>(null);
  const closeButtonRef = useRef<View>(null);

  // Single animated value for the entire carousel
  const translateX = useSharedValue<number>(0);

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < images.length) {
      setCurrentIndex(initialIndex);
      translateX.value = -initialIndex * screenWidth;
    } else {
      setCurrentIndex(0);
      translateX.value = 0;
    }
  }, [initialIndex, images.length, translateX]);

  const goToImage = useCallback(
    (index: number): void => {
      const targetX = -index * screenWidth;
      setCurrentIndex(index);
      translateX.value = targetX;
    },
    [translateX]
  );

  const updateCurrentIndex = useCallback((newIndex: number): void => {
    setCurrentIndex(newIndex);
  }, []);

  return {
    currentIndex,
    setCurrentIndex,
    translateX,
    goToImage,
    updateCurrentIndex,
    modalRef,
    closeButtonRef,
    insets,
  };
};
