import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

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

export function ImageGalleryModal({
  visible,
  images,
  initialIndex,
  onClose,
}: ImageGalleryModalProps) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

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
          paddingTop: DesignTokens.spacing[12] + DesignTokens.spacing[2], // 50px equivalent
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

  const goToImage = (index: number) => {
    const targetX = -index * screenWidth;
    setCurrentIndex(index);
    translateX.value = withSpring(targetX, {
      damping: 20,
      stiffness: 300,
    });
  };

  const updateCurrentIndex = (newIndex: number) => {
    setCurrentIndex(newIndex);
  };

  const animatedGestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: { startX: number }) => {
      // Store the starting position
      context.startX = translateX.value;
    },
    onActive: (event, context: { startX: number }) => {
      // Move the carousel based on gesture
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      const swipeThreshold = screenWidth * 0.2; // 20% of screen width
      const velocity = event.velocityX;
      const translation = event.translationX;

      // Calculate which image we should snap to
      let targetIndex = currentIndex;

      if (translation > swipeThreshold || velocity > 500) {
        // Swipe right - go to previous image
        if (currentIndex > 0) {
          targetIndex = currentIndex - 1;
        }
      } else if (translation < -swipeThreshold || velocity < -500) {
        // Swipe left - go to next image
        if (currentIndex < images.length - 1) {
          targetIndex = currentIndex + 1;
        }
      }

      // Update the index immediately for instant text updates
      if (targetIndex !== currentIndex) {
        runOnJS(updateCurrentIndex)(targetIndex);
      }

      // Animate to the target position
      const targetX = -targetIndex * screenWidth;
      translateX.value = withSpring(targetX, {
        damping: 20,
        stiffness: 300,
      });
    },
  });

  const carouselStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  if (!visible || !currentImage) {
    console.log(
      `🚫 ImageGalleryModal not rendering - visible: ${visible}, currentImage: ${!!currentImage}`
    );
    return null;
  }

  console.log(
    `✅ ImageGalleryModal rendering - visible: ${visible}, currentIndex: ${currentIndex}, images.length: ${images.length}`
  );

  // Render images around the current index for smooth scrolling
  const visibleImages = [];
  const startIndex = Math.max(0, currentIndex - 1);
  const endIndex = Math.min(images.length - 1, currentIndex + 1);

  for (let i = startIndex; i <= endIndex; i++) {
    visibleImages.push({ ...images[i], index: i });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <MaterialIcons
              name="close"
              size={DesignTokens.typography.fontSize.lg}
              color={theme.colors.text.inverse}
            />
          </Pressable>

          <View style={styles.imageCounter}>
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
              onGestureEvent={animatedGestureHandler}
              activeOffsetX={[-10, 10]}
              failOffsetY={[-20, 20]}
            >
              <Animated.View style={[styles.carousel, carouselStyle]}>
                {images.map((image, index) => (
                  <View key={image.id} style={styles.imageContainer}>
                    <Image
                      source={{ uri: image.url }}
                      style={styles.image}
                      contentFit="contain"
                      transition={200}
                    />
                  </View>
                ))}
              </Animated.View>
            </PanGestureHandler>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Image Info */}
          <View style={styles.imageInfo}>
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
          <View style={styles.thumbnailContainer}>
            {images
              .slice(
                Math.max(0, currentIndex - 2),
                Math.min(images.length, currentIndex + 3)
              )
              .map((image, index) => {
                const actualIndex = Math.max(0, currentIndex - 2) + index;
                return (
                  <Pressable
                    key={image.id}
                    onPress={() => goToImage(actualIndex)}
                  >
                    <Image
                      source={{ uri: image.thumbnailUrl || image.url }}
                      style={[
                        styles.thumbnail,
                        actualIndex === currentIndex && styles.thumbnailActive,
                      ]}
                      contentFit="cover"
                    />
                  </Pressable>
                );
              })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
