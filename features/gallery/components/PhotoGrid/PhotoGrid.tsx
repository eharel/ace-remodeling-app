import { usePhotoCategoryData } from "@/features/gallery/hooks/usePhotoCategoryData";
import { useProject } from "@/features/projects/hooks/useProject";
import {
  EditButton,
  ThemedButton,
  ThemedText,
  ThemedView,
} from "@/shared/components";
import { type PhotoCategory, PHOTO_CATEGORY_LABELS } from "@/shared/constants";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
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

  const [isEditing, setIsEditing] = useState(false);
  const [isSelectingPhotos, setIsSelectingPhotos] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(
    new Set()
  );

  // Handle edit button press
  const handleEditPress = () => {
    setIsEditing(!isEditing);
    // Clear selection when exiting edit mode
    if (isEditing) {
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

  const allPhotos = useMemo(() => {
    return project?.components.find((c) => c.id === componentId)?.media || [];
  }, [project, componentId]);

  const { photoCounts, filteredPhotos } = usePhotoCategoryData({
    media: allPhotos,
    activePhotoCategory: activePhotoCategory || "all",
  });

  // Get display title based on active category
  const getTitle = () => {
    const count = photoCounts[activePhotoCategory];
    const label = PHOTO_CATEGORY_LABELS[activePhotoCategory];
    return `${label} (${count})`;
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: DesignTokens.spacing[4],
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.secondary,
        },
        title: {
          fontSize: DesignTokens.typography.fontSize["2xl"],
          fontWeight: DesignTokens.typography.fontWeight.semibold,
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

  // Handle add photo press
  const handleAddPhotoPress = () => {
    console.log("Add photo");
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>{getTitle()}</ThemedText>
          {isEditing && (
            <>
              <ThemedText style={styles.title}>
                {selectedPhotoIds.size > 0
                  ? `${selectedPhotoIds.size} selected`
                  : "Editing"}
              </ThemedText>
              <ThemedButton onPress={handleSelectPhotosPress}>
                {isSelectingPhotos ? "Cancel" : "Select"}
              </ThemedButton>
              <ThemedButton onPress={handleAddPhotoPress} icon="add">
                Add Photo
              </ThemedButton>
            </>
          )}
          <EditButton onPress={handleEditPress} />
        </View>

        <PhotoGridList
          photos={filteredPhotos}
          onImagePress={onImagePress}
          isEditing={isEditing}
          isSelectingPhotos={isSelectingPhotos}
          selectedIds={selectedPhotoIds}
          onToggleSelection={handleToggleSelection}
        />
      </View>
    </ThemedView>
  );
}
