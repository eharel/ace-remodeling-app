import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { usePhotoGallery } from "@/app/project/hooks/usePhotoGallery";
import {
  ImageGalleryModal,
  MorePhotosCard,
  type PhotoTabValue,
} from "@/features/gallery";
import { ThemedText, ThemedView } from "@/shared/components";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import type { MediaAsset } from "@/shared/types";
import { commonStyles } from "@/shared/utils";

interface ProjectPhotoGalleryProps {
  photos: MediaAsset[];
  title?: string;
  subtitle?: string;
  canEdit?: boolean;
}

export function ProjectPhotoGallery({
  photos,
  title = "Project Photos",
  subtitle = "Tap any photo to view gallery",
  canEdit = false,
}: ProjectPhotoGalleryProps) {
  const { theme } = useTheme();

  // Photo gallery state
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [pressedImageIndex, setPressedImageIndex] = useState<number | null>(
    null
  );
  const [activePhotoTab, setActivePhotoTab] = useState<PhotoTabValue>("after");
  const previewCount = 3;

  // Photo gallery logic
  const {
    photoCounts,
    previewPhotos,
    hasMorePhotos,
    remainingCount,
    galleryImages,
  } = usePhotoGallery({
    media: photos,
    activePhotoTab,
    previewCount,
  });

  const styles = useMemo(() => createProjectPhotoGalleryStyles(theme), [theme]);

  const closeGallery = () => {
    setGalleryVisible(false);
  };

  const handleImagePress = (index: number) => {
    // Ensure index is within bounds before opening gallery
    if (galleryImages.length === 0) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, galleryImages.length - 1));

    if (safeIndex < 0 || safeIndex >= galleryImages.length) {
      return;
    }

    setSelectedImageIndex(safeIndex);
    setGalleryVisible(true);
  };

  const handleMoreImagesPress = () => {
    setSelectedImageIndex(0); // Start from first photo in filtered set
    setGalleryVisible(true);
  };

  // OPTIMIZATION 3: Gallery image renderer with optimized image props
  const renderGridImage = (
    item: MediaAsset,
    index: number,
    isMoreCell: boolean = false
  ) => {
    const isPressed = pressedImageIndex === index;

    return (
      <ThemedView key={`grid-image-${index}`} style={styles.gridImageContainer}>
        <Pressable
          onPress={() =>
            isMoreCell ? handleMoreImagesPress() : handleImagePress(index)
          }
          onPressIn={() => setPressedImageIndex(index)}
          onPressOut={() => setPressedImageIndex(null)}
          style={isPressed ? styles.gridImageContainerPressed : undefined}
        >
          <Image
            source={{ uri: item.url }}
            style={styles.gridImage}
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
            priority="normal"
            recyclingKey={item.url}
          />
        </Pressable>
      </ThemedView>
    );
  };

  return (
    <>
      {/* Pictures Section */}
      <ThemedView style={styles.section}>
        <ThemedText
          style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
        >
          {title} ({photos.length})
        </ThemedText>
        <ThemedText
          style={[
            styles.sectionSubtitle,
            { color: theme.colors.text.secondary },
          ]}
        >
          {subtitle}
        </ThemedText>

        {photos.length > 0 ? (
          <>
            {/* Photo Category Tabs */}
            <SegmentedControl
              variant="tabs"
              options={["after", "before", "progress", "all"] as const}
              selected={activePhotoTab}
              onSelect={setActivePhotoTab}
              showCounts={true}
              getCounts={(tab) => photoCounts[tab as PhotoTabValue]}
              getLabel={(tab) => {
                const labels: Record<PhotoTabValue, string> = {
                  after: "After",
                  before: "Before",
                  progress: "In Progress",
                  all: "All Photos",
                };
                return labels[tab as PhotoTabValue] || tab;
              }}
              ariaLabel="Filter photos by stage"
            />

            {/* Photo Grid */}
            {previewPhotos.length > 0 ? (
              <ThemedView variant="ghost" style={styles.picturesGrid}>
                {previewPhotos.map((item, previewIndex) => {
                  // Find the index in the filtered gallery images for correct navigation
                  const galleryIndex = galleryImages.findIndex(
                    (p: { id?: string }) => p.id === item.id
                  );
                  // If not found, use previewIndex as fallback (but ensure it's in bounds)
                  const safeIndex =
                    galleryIndex >= 0
                      ? galleryIndex
                      : Math.min(previewIndex, galleryImages.length - 1);

                  return renderGridImage(item, safeIndex);
                })}
                {/* "+X more" card */}
                {hasMorePhotos && (
                  <MorePhotosCard
                    count={remainingCount}
                    backgroundPhoto={
                      galleryImages[previewPhotos.length] || galleryImages[0]
                    }
                    onPress={handleMoreImagesPress}
                  />
                )}
              </ThemedView>
            ) : (
              <ThemedView style={styles.emptyState}>
                <MaterialIcons
                  name="photo-library"
                  size={48}
                  color={theme.colors.text.tertiary}
                />
                <ThemedText
                  style={[
                    styles.emptyStateText,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  No {activePhotoTab === "all" ? "" : activePhotoTab} photos
                  available
                </ThemedText>
              </ThemedView>
            )}
          </>
        ) : (
          <ThemedView style={styles.emptyState}>
            <MaterialIcons
              name="photo-library"
              size={48}
              color={theme.colors.text.tertiary}
            />
            <ThemedText
              style={[
                styles.emptyStateText,
                { color: theme.colors.text.secondary },
              ]}
            >
              No pictures available
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Image Gallery Modal */}
      {galleryImages.length > 0 && (
        <ImageGalleryModal
          visible={galleryVisible}
          images={galleryImages}
          initialIndex={Math.max(
            0,
            Math.min(selectedImageIndex, galleryImages.length - 1)
          )}
          onClose={closeGallery}
        />
      )}
    </>
  );
}

/**
 * Creates styles for the ProjectPhotoGallery component
 */
const createProjectPhotoGalleryStyles = (theme: any) =>
  StyleSheet.create({
    section: {
      backgroundColor: theme.colors.background.card,
      marginBottom: DesignTokens.spacing[4],
      marginHorizontal: DesignTokens.spacing[4],
      padding: DesignTokens.spacing[6],
      borderRadius: DesignTokens.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      ...DesignTokens.shadows.md,
    },
    sectionTitle: {
      ...commonStyles.text.sectionTitle,
      marginBottom: DesignTokens.spacing[2],
    },
    sectionSubtitle: {
      ...commonStyles.text.smallText,
      marginBottom: DesignTokens.spacing[5],
    },
    picturesGrid: {
      flexDirection: "row",
      gap: DesignTokens.spacing[3],
    },
    gridImageContainer: {
      flex: 1,
      aspectRatio: 4 / 3,
      borderRadius: DesignTokens.borderRadius.lg,
      overflow: "hidden",
      ...DesignTokens.shadows.sm,
    },
    gridImageContainerPressed: {
      transform: [{ scale: 0.95 }],
      ...DesignTokens.shadows.md,
    },
    gridImage: {
      width: "100%",
      height: "100%",
    },
    emptyState: {
      padding: DesignTokens.spacing[8],
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background.secondary,
      borderRadius: DesignTokens.borderRadius.md,
    },
    emptyStateText: {
      fontSize: DesignTokens.typography.fontSize.base,
      opacity: 0.6,
      textAlign: "center",
      marginTop: DesignTokens.spacing[2],
    },
  });
