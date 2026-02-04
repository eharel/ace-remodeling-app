import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { usePhotoCategoryData } from "@/features/gallery/hooks/usePhotoCategoryData";
import { Can, ThemedText, ThemedView } from "@/shared/components";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import type { MediaAsset } from "@/shared/types";
import { commonStyles } from "@/shared/utils";
import {
  PHOTO_CATEGORIES,
  PHOTO_CATEGORY_LABELS,
  type PhotoCategory,
} from "@/shared/constants";

import { MorePhotosCard } from "./MorePhotosCard";

interface PhotoPreviewSectionProps {
  photos: MediaAsset[];
  title?: string;
  subtitle?: string;
  canEdit?: boolean;
  /** When true, shows edit affordances (managed by parent's edit mode) */
  isEditMode?: boolean;

  activePhotoCategory: PhotoCategory;
  onPhotoCategoryChange: (activeCategory: PhotoCategory) => void;

  onOpenGrid: (activeCategory?: PhotoCategory, editMode?: boolean) => void;
  onOpenImage: (index: number) => void;
}

export function PhotoPreviewSection({
  photos,
  title = "Photos",
  subtitle = "Tap any photo to view gallery",
  canEdit = false,
  isEditMode = false,
  activePhotoCategory,
  onPhotoCategoryChange,
  onOpenGrid = () => {},
  onOpenImage = (index: number) => {},
}: PhotoPreviewSectionProps) {
  const { theme } = useTheme();

  const [pressedImageIndex, setPressedImageIndex] = useState<number | null>(
    null,
  );
  const previewCount = 3;

  // Photo gallery logic
  const {
    photoCounts,
    previewPhotos,
    hasMorePhotos,
    remainingCount,
    galleryImages,
  } = usePhotoCategoryData({
    media: photos,
    activePhotoCategory: activePhotoCategory,
    previewCount,
  });

  const styles = useMemo(() => createPhotoGalleryStyles(theme), [theme]);

  const handleImagePress = (index: number) => {
    onOpenImage(index);
  };

  const showPhotoGrid = (editMode: boolean = false) => {
    onOpenGrid(activePhotoCategory, editMode);
  };

  // Gallery image renderer with optimized image props
  const renderGridImage = (
    item: MediaAsset,
    index: number,
    isMoreCell: boolean = false,
  ) => {
    const isPressed = pressedImageIndex === index;

    return (
      <ThemedView key={`grid-image-${index}`} style={styles.gridImageContainer}>
        <Pressable
          onPress={() =>
            isMoreCell ? showPhotoGrid(false) : handleImagePress(index)
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
        {/* Header Row - Title + Edit Button (only in edit mode) */}
        <View style={styles.sectionHeader}>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            {title} ({photos.length})
          </ThemedText>
          {isEditMode && (
            <Can edit>
              <Pressable
                onPress={() => showPhotoGrid(true)}
                style={styles.editPhotosButton}
                accessibilityLabel="Edit photos"
                accessibilityRole="button"
              >
                <MaterialIcons
                  name="edit"
                  size={16}
                  color={theme.colors.interactive.primary}
                />
                <ThemedText style={styles.editPhotosText}>Edit</ThemedText>
              </Pressable>
            </Can>
          )}
        </View>
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
              options={Object.values(PHOTO_CATEGORIES) as PhotoCategory[]}
              selected={activePhotoCategory}
              onSelect={onPhotoCategoryChange}
              showCounts={true}
              getCounts={(tab) => photoCounts[tab as PhotoCategory]}
              getLabel={(tab) => {
                return PHOTO_CATEGORY_LABELS[tab as PhotoCategory] || tab;
              }}
              ariaLabel="Filter photos by stage"
            />

            {/* Photo Grid */}
            {previewPhotos.length > 0 ? (
              <ThemedView variant="ghost" style={styles.picturesGrid}>
                {previewPhotos.map((item, previewIndex) => {
                  // Find the index in the filtered gallery images for correct navigation
                  const galleryIndex = galleryImages.findIndex(
                    (p: { id?: string }) => p.id === item.id,
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
                    onPress={() => showPhotoGrid(false)}
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
                  No {activePhotoCategory === "all" ? "" : activePhotoCategory}{" "}
                  photos available
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
    </>
  );
}

/**
 * Creates styles for the PhotoGallery component
 */
const createPhotoGalleryStyles = (theme: any) =>
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
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: DesignTokens.spacing[2], // Space before subtitle
    },
    sectionTitle: {
      ...commonStyles.text.sectionTitle,
      marginBottom: 0, // Remove bottom margin (row handles spacing now)
    },
    editPhotosButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: DesignTokens.spacing[1],
      paddingVertical: DesignTokens.spacing[1],
      paddingHorizontal: DesignTokens.spacing[2],
    },
    editPhotosText: {
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.interactive.primary,
      fontWeight: DesignTokens.typography.fontWeight.medium,
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
