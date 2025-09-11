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
  const [isSwipeActive, setIsSwipeActive] = useState(false);

  // Animated values
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    console.log(
      `🔄 ImageGalleryModal: initialIndex changed to ${initialIndex}, images.length: ${images.length}`
    );
    if (initialIndex >= 0 && initialIndex < images.length) {
      setCurrentIndex(initialIndex);
      translateX.value = 0;
      opacity.value = 1;
    } else {
      console.log(`⚠️ Invalid initialIndex: ${initialIndex}, setting to 0`);
      setCurrentIndex(0);
    }
  }, [initialIndex, images.length, translateX, opacity]);

  const currentImage = images[currentIndex];

  const styles = useMemo(
    () =>
      StyleSheet.create({
        modal: {
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.95)",
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
          paddingTop: 50,
          paddingHorizontal: DesignTokens.spacing[4],
          paddingBottom: DesignTokens.spacing[4],
        },
        closeButton: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: 20,
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
        },
        imageCounter: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          paddingHorizontal: DesignTokens.spacing[3],
          paddingVertical: DesignTokens.spacing[2],
          borderRadius: DesignTokens.borderRadius.md,
        },
        imageContainer: {
          width: screenWidth,
          height: screenHeight * 0.7,
          justifyContent: "center",
          alignItems: "center",
        },
        image: {
          width: "100%",
          height: "100%",
        },
        imageContainerActive: {
          opacity: 0.8,
        },
        swipeIndicator: {
          position: "absolute",
          top: "50%",
          transform: [{ translateY: -20 }],
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          borderRadius: 20,
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
        },
        swipeIndicatorLeft: {
          left: 20,
        },
        swipeIndicatorRight: {
          right: 20,
        },
        footer: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: DesignTokens.spacing[4],
        },
        imageInfo: {
          alignItems: "center",
          marginBottom: DesignTokens.spacing[4],
        },
        imageType: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.bold,
          color: "white",
          textTransform: "capitalize",
          marginBottom: DesignTokens.spacing[2],
        },
        imageDescription: {
          fontSize: DesignTokens.typography.fontSize.base,
          color: "rgba(255, 255, 255, 0.8)",
          textAlign: "center",
          lineHeight: 22,
        },
        navigationContainer: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        navButton: {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: 25,
          width: 50,
          height: 50,
          justifyContent: "center",
          alignItems: "center",
        },
        navButtonDisabled: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          opacity: 0.5,
        },
        thumbnailContainer: {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: DesignTokens.spacing[2],
          paddingHorizontal: DesignTokens.spacing[4],
        },
        thumbnail: {
          width: 40,
          height: 40,
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

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPreviousAnimated = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      translateX.value = 0;
      opacity.value = 1;
    }
  };

  const goToNextAnimated = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      translateX.value = 0;
      opacity.value = 1;
    }
  };

  const animatedGestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(setIsSwipeActive)(true);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      // Reduce opacity as user swipes further
      opacity.value = Math.max(0.3, 1 - Math.abs(event.translationX) / 200);
    },
    onEnd: (event) => {
      const swipeThreshold = 50;
      const velocity = event.velocityX;

      if (event.translationX > swipeThreshold || velocity > 500) {
        // Swipe right - go to previous image
        if (currentIndex > 0) {
          translateX.value = withSpring(screenWidth, {
            damping: 20,
            stiffness: 300,
          });
          opacity.value = withSpring(0, { damping: 20, stiffness: 300 }, () => {
            runOnJS(goToPreviousAnimated)();
          });
        } else {
          // Bounce back if at first image
          translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
          opacity.value = withSpring(1, { damping: 15, stiffness: 200 });
        }
      } else if (event.translationX < -swipeThreshold || velocity < -500) {
        // Swipe left - go to next image
        if (currentIndex < images.length - 1) {
          translateX.value = withSpring(-screenWidth, {
            damping: 20,
            stiffness: 300,
          });
          opacity.value = withSpring(0, { damping: 20, stiffness: 300 }, () => {
            runOnJS(goToNextAnimated)();
          });
        } else {
          // Bounce back if at last image
          translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
          opacity.value = withSpring(1, { damping: 15, stiffness: 200 });
        }
      } else {
        // Return to center if swipe wasn't far enough
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        opacity.value = withSpring(1, { damping: 15, stiffness: 200 });
      }

      runOnJS(setIsSwipeActive)(false);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
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
            <MaterialIcons name="close" size={24} color="white" />
          </Pressable>

          <View style={styles.imageCounter}>
            <ThemedText style={{ color: "white", fontWeight: "600" }}>
              {currentIndex + 1} of {images.length}
            </ThemedText>
          </View>
        </View>

        {/* Main Image */}
        <View style={styles.container}>
          <PanGestureHandler
            onGestureEvent={animatedGestureHandler}
            activeOffsetX={[-10, 10]}
            failOffsetY={[-20, 20]}
          >
            <Animated.View
              style={[
                styles.imageContainer,
                isSwipeActive && styles.imageContainerActive,
                animatedStyle,
              ]}
            >
              <Image
                source={{ uri: currentImage.url }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
            </Animated.View>
          </PanGestureHandler>
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
