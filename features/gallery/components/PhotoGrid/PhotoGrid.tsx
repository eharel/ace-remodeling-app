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
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
          borderBottomWidth: DesignTokens.borderWidth.thin,
          borderBottomColor: theme.colors.border.secondary,
          backgroundColor: theme.colors.background.elevated,
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

  // Handle action bar buttons (placeholders for now)
  const handleAddPhotosPress = () => {
    console.log("Add photos");
  };

  const handleDeletePress = () => {
    console.log("Delete photos:", Array.from(selectedPhotoIds));
  };

  const handleSetThumbnailPress = () => {
    const selectedId = Array.from(selectedPhotoIds)[0];
    console.log("Set thumbnail:", selectedId);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.title}>{getTitle()}</ThemedText>
          {isEditing && isSelectingPhotos && selectedPhotoIds.size > 0 && (
            <ThemedText style={styles.selectionCount}>
              {selectedPhotoIds.size} selected
            </ThemedText>
          )}
        </View>

        <View style={styles.headerRight}>
          {isEditing && (
            <ThemedButton
              variant={isSelectingPhotos ? "primary" : "secondary"}
              size="small"
              onPress={handleSelectPhotosPress}
            >
              {isSelectingPhotos ? "Done" : "Select"}
            </ThemedButton>
          )}
          <EditButton onPress={handleEditPress} />
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
        />
      )}
    </ThemedView>
  );
}
