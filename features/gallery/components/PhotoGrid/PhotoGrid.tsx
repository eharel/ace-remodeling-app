import { useMediaActions } from "@/features/gallery/hooks/useMediaActions";
import { usePhotoCategoryData } from "@/features/gallery/hooks/usePhotoCategoryData";
import { useProject } from "@/features/projects/hooks/useProject";
import {
  EditButton,
  ThemedButton,
  ThemedSegmentedControl,
  ThemedText,
  ThemedView,
} from "@/shared/components";
import { type PhotoCategory, PHOTO_CATEGORIES } from "@/shared/constants";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import type { SegmentOption } from "@/shared/components/themed/ThemedSegmentedControl";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { EditModeActionBar } from "./EditModeActionBar";
import { PhotoGridList } from "./PhotoGridList";

interface PhotoGridProps {
  onImagePress: (index: number) => void;
}

export function PhotoGrid({ onImagePress }: PhotoGridProps) {
  const { theme } = useTheme();
  const {
    id: projectId,
    componentId,
    activePhotoCategory = "all",
  } = useLocalSearchParams<{
    id?: string;
    componentId?: string;
    activePhotoCategory?: PhotoCategory;
  }>();

  const { project } = useProject(projectId);

  // Local state for category selection (initialized from URL param if present)
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>(
    activePhotoCategory || "all"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSelectingPhotos, setIsSelectingPhotos] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    new Set()
  );

  // Handle edit button press
  const handleEditPress = () => {
    const exitingEditMode = isEditing;
    setIsEditing(!isEditing);
    // Reset all edit-related state when exiting edit mode
    if (exitingEditMode) {
      setIsSelectingPhotos(false);
      setSelectedPhotoIds(new Set());
    }
  };

  // Handle photo selection toggle
  const handleToggleSelection = useCallback((photoId: string) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  }, []);

  // Get the current component
  const component = useMemo(() => {
    return project?.components.find((c) => c.id === componentId);
  }, [project, componentId]);

  const allPhotos = useMemo(() => {
    return component?.media || [];
  }, [component]);

  // Media actions hook for CRUD operations
  const { isLoading, loadingOperation, addPhotos, deletePhotos, setThumbnail } =
    useMediaActions({
      projectId: projectId || "",
      componentId: componentId || "",
      component,
      currentCategory: selectedCategory,
    });

  const { photoCounts, filteredPhotos } = usePhotoCategoryData({
    media: allPhotos,
    activePhotoCategory: selectedCategory,
  });

  // Build category options for the segmented control
  const categoryOptions: SegmentOption<PhotoCategory>[] = useMemo(
    () => [
      {
        value: PHOTO_CATEGORIES.ALL,
        label: "All",
        count: photoCounts.all,
      },
      {
        value: PHOTO_CATEGORIES.BEFORE,
        label: "Before",
        count: photoCounts.before,
      },
      {
        value: PHOTO_CATEGORIES.PROGRESS,
        label: "Progress",
        count: photoCounts.progress,
      },
      {
        value: PHOTO_CATEGORIES.AFTER,
        label: "After",
        count: photoCounts.after,
      },
    ],
    [photoCounts]
  );

  // Handle category change
  const handleCategoryChange = useCallback((category: PhotoCategory) => {
    setSelectedCategory(category);
    // Clear selection when changing categories
    setSelectedPhotoIds(new Set());
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerContainer: {
          backgroundColor: theme.colors.background.elevated,
          borderBottomWidth: DesignTokens.borderWidth.thin,
          borderBottomColor: theme.colors.border.secondary,
        },
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
        },
        headerLeft: {
          flexDirection: "row",
          alignItems: "center",
          gap: DesignTokens.spacing[3],
          flex: 1,
        },
        headerRight: {
          flexDirection: "row",
          alignItems: "center",
          gap: DesignTokens.spacing[2],
        },
        title: {
          fontSize: DesignTokens.typography.fontSize.xl,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
        },
        selectionCount: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          color: theme.colors.interactive.primary,
          backgroundColor: theme.colors.status.infoLight,
          paddingVertical: DesignTokens.spacing[1],
          paddingHorizontal: DesignTokens.spacing[2],
          borderRadius: DesignTokens.borderRadius.sm,
        },
        categoryFilter: {
          paddingHorizontal: DesignTokens.spacing[4],
          paddingBottom: DesignTokens.spacing[3],
        },
      }),
    [theme]
  );

  // Handle select photos press
  const handleSelectPhotosPress = () => {
    if (isSelectingPhotos) {
      setSelectedPhotoIds(new Set());
    }
    setIsSelectingPhotos(!isSelectingPhotos);
  };

  // Handle action bar buttons
  const handleAddPhotosPress = useCallback(async () => {
    await addPhotos();
  }, [addPhotos]);

  const handleDeletePress = useCallback(async () => {
    const photoIds = Array.from(selectedPhotoIds);
    if (photoIds.length === 0) return;

    // Confirm deletion
    Alert.alert(
      "Delete Photos",
      `Are you sure you want to delete ${photoIds.length} photo${photoIds.length > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deletePhotos(photoIds);
            // Clear selection after delete
            setSelectedPhotoIds(new Set());
          },
        },
      ]
    );
  }, [selectedPhotoIds, deletePhotos]);

  const handleSetThumbnailPress = useCallback(async () => {
    const selectedId = Array.from(selectedPhotoIds)[0];
    if (!selectedId) return;
    await setThumbnail(selectedId);
  }, [selectedPhotoIds, setThumbnail]);

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.title}>Photos</ThemedText>
            {isEditing && isSelectingPhotos && selectedPhotoIds.size > 0 && (
              <ThemedText style={styles.selectionCount}>
                {selectedPhotoIds.size} selected
              </ThemedText>
            )}
          </View>

          <View style={styles.headerRight}>
            {isEditing && (
              <ThemedButton
                variant={isSelectingPhotos ? "ghost" : "secondary"}
                size="small"
                icon={isSelectingPhotos ? "close" : "check-box-outline-blank"}
                onPress={handleSelectPhotosPress}
              >
                {isSelectingPhotos ? "Cancel" : "Select"}
              </ThemedButton>
            )}
            <EditButton onPress={handleEditPress} isEditing={isEditing} />
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categoryFilter}>
          <ThemedSegmentedControl
            options={categoryOptions}
            selectedValue={selectedCategory}
            onValueChange={handleCategoryChange}
            size="small"
          />
        </View>
      </View>

      {/* Photo Grid */}
      <View style={{ flex: 1 }}>
        <PhotoGridList
          photos={filteredPhotos}
          onImagePress={onImagePress}
          isEditing={isEditing}
          isSelectingPhotos={isSelectingPhotos}
          selectedIds={selectedPhotoIds}
          onToggleSelection={handleToggleSelection}
        />
      </View>

      {/* Bottom Action Bar - only visible in edit mode */}
      {isEditing && (
        <EditModeActionBar
          selectedCount={selectedPhotoIds.size}
          onAddPhotos={handleAddPhotosPress}
          onDelete={handleDeletePress}
          onSetThumbnail={handleSetThumbnailPress}
          isLoading={isLoading}
          loadingOperation={loadingOperation}
          canAddPhotos={selectedCategory !== "all"}
        />
      )}
    </ThemedView>
  );
}
