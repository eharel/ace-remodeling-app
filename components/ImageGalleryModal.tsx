import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";

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

  if (!visible || !currentImage) {
    return null;
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
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: currentImage.url }}
              style={styles.image}
              contentFit="contain"
              transition={200}
            />
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

          {/* Navigation */}
          <View style={styles.navigationContainer}>
            <Pressable
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={goToPrevious}
              disabled={currentIndex === 0}
            >
              <MaterialIcons
                name="chevron-left"
                size={24}
                color={
                  currentIndex === 0 ? "rgba(255, 255, 255, 0.3)" : "white"
                }
              />
            </Pressable>

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
                          actualIndex === currentIndex &&
                            styles.thumbnailActive,
                        ]}
                        contentFit="cover"
                      />
                    </Pressable>
                  );
                })}
            </View>

            <Pressable
              style={[
                styles.navButton,
                currentIndex === images.length - 1 && styles.navButtonDisabled,
              ]}
              onPress={goToNext}
              disabled={currentIndex === images.length - 1}
            >
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={
                  currentIndex === images.length - 1
                    ? "rgba(255, 255, 255, 0.3)"
                    : "white"
                }
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
