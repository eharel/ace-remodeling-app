import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";
import { Picture } from "@/types";

interface ImageGalleryModalProps {
  visible: boolean;
  images: Picture[];
  initialIndex: number;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Gesture constants
const SWIPE_THRESHOLD = screenWidth * 0.2; // 20% of screen width
const VELOCITY_THRESHOLD = 500;
const ANIMATION_CONFIG = {
  damping: 20,
  stiffness: 300,
} as const;

// Thumbnail Component - extracted for better performance
const Thumbnail = React.memo<{
  image: Picture;
  index: number;
  isActive: boolean;
  onPress: (index: number) => void;
  theme: any;
}>(({ image, index, isActive, onPress, theme }) => {
  const handlePress = React.useCallback(() => {
    onPress(index);
  }, [index, onPress]);

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        thumbnail: {
          width: DesignTokens.componentSizes.thumbnail,
          height: DesignTokens.componentSizes.thumbnail,
          borderRadius: DesignTokens.borderRadius.sm,
          borderWidth: 2,
          borderColor: "transparent",
        },
        thumbnailActive: {
          borderColor: theme.colors.interactive.primary,
        },
      }),
    [theme]
  );

  return (
    <Pressable
      onPress={handlePress}
      accessibilityLabel={`View image ${index + 1}${
        image.description ? `: ${image.type}` : ""
      }`}
      accessibilityHint={
        isActive ? "Currently selected image" : "Double tap to view this image"
      }
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      style={[
        styles.thumbnail,
        isActive && styles.thumbnailActive,
        { minWidth: 44, minHeight: 44 }, // Ensure minimum touch target size
      ]}
    >
      <Image
        source={{ uri: image.thumbnailUrl || image.url }}
        style={[styles.thumbnail, isActive && styles.thumbnailActive]}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
    </Pressable>
  );
});

Thumbnail.displayName = "Thumbnail";

export const ImageGalleryModal = React.memo<ImageGalleryModalProps>(
  ({ visible, images, initialIndex, onClose }) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const modalRef = useRef<View>(null);
    const closeButtonRef = useRef<View>(null);

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

    const currentImage = images[currentIndex];

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
    }, [visible, currentIndex, images.length]);

    // Announce image changes for screen readers
    useEffect(() => {
      if (visible && currentImage) {
        const announcement = currentImage.description
          ? `Image ${currentIndex + 1} of ${images.length}: ${
              currentImage.type
            }. ${currentImage.description}`
          : `Image ${currentIndex + 1} of ${images.length}: ${
              currentImage.type
            }`;

        AccessibilityInfo.announceForAccessibility(announcement);
      }
    }, [currentIndex, visible, currentImage, images.length]);

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
          header: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: insets.top + DesignTokens.spacing[4],
            paddingHorizontal: DesignTokens.spacing[4],
            paddingBottom: DesignTokens.spacing[4],
          },
          closeButton: {
            backgroundColor: theme.colors.background.overlay,
            borderRadius: DesignTokens.borderRadius.full,
            width: DesignTokens.componentSizes.iconButton,
            height: DesignTokens.componentSizes.iconButton,
            justifyContent: "center",
            alignItems: "center",
          },
          imageCounter: {
            backgroundColor: theme.colors.background.overlay,
            paddingHorizontal: DesignTokens.spacing[3],
            paddingVertical: DesignTokens.spacing[2],
            borderRadius: DesignTokens.borderRadius.md,
          },
          carouselContainer: {
            width: screenWidth,
            height: screenHeight * 0.7,
            overflow: "hidden",
          },
          carousel: {
            flexDirection: "row",
            height: "100%",
          },
          imageContainer: {
            width: screenWidth,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: DesignTokens.spacing[2],
          },
          image: {
            width: "100%",
            height: "100%",
          },
          footer: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.background.overlay,
            padding: DesignTokens.spacing[4],
            paddingBottom: insets.bottom + DesignTokens.spacing[4],
          },
          imageInfo: {
            alignItems: "center",
            marginBottom: DesignTokens.spacing[4],
          },
          imageType: {
            fontSize: DesignTokens.typography.fontSize.lg,
            fontWeight: DesignTokens.typography.fontWeight.bold,
            color: theme.colors.text.inverse,
            textTransform: "capitalize",
            marginBottom: DesignTokens.spacing[2],
          },
          imageDescription: {
            fontSize: DesignTokens.typography.fontSize.base,
            color: theme.colors.text.inverse,
            textAlign: "center",
            lineHeight:
              DesignTokens.typography.lineHeight.normal *
              DesignTokens.typography.fontSize.base,
          },
          thumbnailContainer: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: DesignTokens.spacing[2],
            paddingHorizontal: DesignTokens.spacing[4],
          },
        }),
      [theme, insets]
    );

    const goToImage = React.useCallback(
      (index: number) => {
        const targetX = -index * screenWidth;
        setCurrentIndex(index);
        translateX.value = withSpring(targetX, ANIMATION_CONFIG);

        // Haptic feedback for thumbnail clicks
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      [translateX]
    );

    const updateCurrentIndex = React.useCallback((newIndex: number) => {
      setCurrentIndex(newIndex);
    }, []);

    // Note: Keyboard navigation would require a different approach in React Native
    // For now, we rely on gesture navigation and touch interactions

    const handleGestureEvent = (event: any) => {
      "worklet";
      const velocity = event.velocityX;
      const translation = event.translationX;

      // Calculate which image we should snap to
      let targetIndex = currentIndex;

      if (translation > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
        // Swipe right - go to previous image
        if (currentIndex > 0) {
          targetIndex = currentIndex - 1;
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        } else {
          // Edge bounce effect - at first image
          runOnJS(Haptics.notificationAsync)(
            Haptics.NotificationFeedbackType.Warning
          );
        }
      } else if (
        translation < -SWIPE_THRESHOLD ||
        velocity < -VELOCITY_THRESHOLD
      ) {
        // Swipe left - go to next image
        if (currentIndex < images.length - 1) {
          targetIndex = currentIndex + 1;
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        } else {
          // Edge bounce effect - at last image
          runOnJS(Haptics.notificationAsync)(
            Haptics.NotificationFeedbackType.Warning
          );
        }
      }

      // Update the index immediately for instant text updates
      if (targetIndex !== currentIndex) {
        runOnJS(updateCurrentIndex)(targetIndex);
      }

      // Animate to the target position
      const targetX = -targetIndex * screenWidth;
      translateX.value = withSpring(targetX, ANIMATION_CONFIG);
    };

    const handleGestureStateChange = (event: any) => {
      "worklet";
      if (event.state === 5) {
        // END state
        handleGestureEvent(event);
      }
    };

    const carouselStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });

    // Render all images for proper carousel positioning
    const visibleImages = React.useMemo(() => {
      return images.map((image, index) => ({
        ...image,
        actualIndex: index,
      }));
    }, [images]);

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
        accessibilityLabel="Image Gallery"
        accessibilityRole="none"
        accessibilityHint="Image gallery with swipe navigation and thumbnail controls"
      >
        <View
          style={styles.modal}
          ref={modalRef}
          accessible={true}
          accessibilityRole="none"
          accessibilityLabel="Image Gallery"
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              ref={closeButtonRef}
              accessibilityLabel="Close image gallery"
              accessibilityHint="Double tap to close the image gallery"
              accessibilityRole="button"
            >
              <MaterialIcons
                name="close"
                size={DesignTokens.typography.fontSize.lg}
                color={theme.colors.text.inverse}
              />
            </Pressable>

            <View
              style={styles.imageCounter}
              accessibilityLabel={`Image ${currentIndex + 1} of ${
                images.length
              }`}
              accessibilityRole="text"
            >
              <ThemedText
                style={{
                  color: theme.colors.text.inverse,
                  fontWeight: DesignTokens.typography.fontWeight.semibold,
                }}
              >
                {currentIndex + 1} of {images.length}
              </ThemedText>
            </View>
          </View>

          {/* Carousel Container */}
          <View style={styles.container}>
            <View style={styles.carouselContainer}>
              <PanGestureHandler
                onGestureEvent={handleGestureEvent}
                onHandlerStateChange={handleGestureStateChange}
                activeOffsetX={[-10, 10]}
                failOffsetY={[-20, 20]}
              >
                <Animated.View
                  style={[styles.carousel, carouselStyle]}
                  accessible={true}
                  accessibilityLabel={`Image carousel. Swipe left or right to navigate. Currently showing image ${
                    currentIndex + 1
                  } of ${images.length}`}
                  accessibilityRole="scrollbar"
                >
                  {visibleImages.map((image, index) => (
                    <View
                      key={image.id}
                      style={styles.imageContainer}
                      accessible={index === currentIndex}
                      accessibilityLabel={
                        image.description
                          ? `Image ${index + 1} of ${images.length}: ${
                              image.type
                            }. ${image.description}`
                          : `Image ${index + 1} of ${images.length}: ${
                              image.type
                            }`
                      }
                      accessibilityRole="image"
                      accessibilityHint={
                        index === currentIndex
                          ? "Currently displayed image"
                          : "Tap to view this image"
                      }
                    >
                      <Image
                        source={{ uri: image.url }}
                        style={styles.image}
                        contentFit="contain"
                        transition={200}
                        accessibilityIgnoresInvertColors={true}
                      />
                    </View>
                  ))}
                </Animated.View>
              </PanGestureHandler>
            </View>
          </View>

          {/* Footer */}
          <View
            style={styles.footer}
            accessible={true}
            accessibilityLabel="Image information and navigation controls"
            accessibilityRole="toolbar"
          >
            {/* Image Info */}
            <View
              style={styles.imageInfo}
              accessible={true}
              accessibilityLabel={
                currentImage.description
                  ? `Image type: ${currentImage.type}. Description: ${currentImage.description}`
                  : `Image type: ${currentImage.type}`
              }
              accessibilityRole="text"
            >
              <ThemedText style={styles.imageType}>
                {currentImage.type}
              </ThemedText>
              {currentImage.description && (
                <ThemedText style={styles.imageDescription}>
                  {currentImage.description}
                </ThemedText>
              )}
            </View>

            {/* Thumbnails */}
            <View
              style={styles.thumbnailContainer}
              accessible={true}
              accessibilityLabel="Image thumbnails for navigation"
              accessibilityRole="tablist"
            >
              {images
                .slice(
                  Math.max(0, currentIndex - 2),
                  Math.min(images.length, currentIndex + 3)
                )
                .map((image, index) => {
                  const actualIndex = Math.max(0, currentIndex - 2) + index;
                  return (
                    <Thumbnail
                      key={image.id}
                      image={image}
                      index={actualIndex}
                      isActive={actualIndex === currentIndex}
                      onPress={goToImage}
                      theme={theme}
                    />
                  );
                })}
            </View>
          </View>
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
