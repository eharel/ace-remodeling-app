import React, { useMemo } from "react";
import { Dimensions, Modal, StyleSheet, View } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

import { accessibilityStrings } from "./constants/accessibilityStrings";
import { useAccessibilityAnnouncements } from "./hooks/useAccessibilityAnnouncements";
import { useImageGallery } from "./hooks/useImageGallery";
import { useImageNavigation } from "./hooks/useImageNavigation";
import { ImageGalleryCarousel } from "./ImageGalleryCarousel";
import { ImageGalleryFooter } from "./ImageGalleryFooter";
import { ImageGalleryHeader } from "./ImageGalleryHeader";
import { ImageGalleryModalProps } from "./types/gallery.types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const ImageGalleryModal = React.memo<ImageGalleryModalProps>(
  ({ visible, images, initialIndex, onClose }) => {
    const { theme } = useTheme();

    const {
      currentIndex,
      setCurrentIndex,
      translateX,
      goToImage,
      updateCurrentIndex,
      modalRef,
      closeButtonRef,
      insets,
    } = useImageGallery({ visible, images, initialIndex });

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
      () =>
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
      console.log(
        `🚫 ImageGalleryModal not rendering - visible: ${visible}, currentImage: ${!!currentImage}`
      );
      return null;
    }

    console.log(
      `✅ ImageGalleryModal rendering - visible: ${visible}, currentIndex: ${currentIndex}, images.length: ${images.length}`
    );

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
