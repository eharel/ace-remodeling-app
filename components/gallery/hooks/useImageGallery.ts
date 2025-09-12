import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ImageGalleryModalProps,
  UseImageGalleryReturn,
} from "../types/gallery.types";

const { width: screenWidth } = Dimensions.get("window");

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
