import { useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ImageGalleryModalProps } from "../types/gallery.types";

const { width: screenWidth } = Dimensions.get("window");

export const useImageGallery = ({
  visible,
  images,
  initialIndex,
}: Pick<ImageGalleryModalProps, "visible" | "images" | "initialIndex">) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const modalRef = useRef<any>(null);
  const closeButtonRef = useRef<any>(null);

  // Single animated value for the entire carousel
  const translateX = useSharedValue(0);

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    console.log(
      `🔄 ImageGalleryModal: initialIndex changed to ${initialIndex}, images.length: ${images.length}`
    );
    if (initialIndex >= 0 && initialIndex < images.length) {
      setCurrentIndex(initialIndex);
      translateX.value = -initialIndex * screenWidth;
    } else {
      console.log(`⚠️ Invalid initialIndex: ${initialIndex}, setting to 0`);
      setCurrentIndex(0);
      translateX.value = 0;
    }
  }, [initialIndex, images.length, translateX]);

  const goToImage = (index: number) => {
    const targetX = -index * screenWidth;
    setCurrentIndex(index);
    translateX.value = targetX;
  };

  const updateCurrentIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
  };

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
