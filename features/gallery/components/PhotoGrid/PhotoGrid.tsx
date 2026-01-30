import { useProject } from "@/features/projects/hooks/useProject";
import { usePhotoCategoryData } from "@/features/gallery/hooks/usePhotoCategoryData";
import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  type PhotoCategory,
  PHOTO_CATEGORY_LABELS,
  matchesPhotoCategory,
} from "@/shared/constants";
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

  const allPhotos =
    project?.components.find((c) => c.id === componentId)?.media || [];

  const { photoCounts } = usePhotoCategoryData({
    media: allPhotos,
    activePhotoCategory: activePhotoCategory || "all",
  });

  // Filter MediaAsset[] based on active category (same logic as usePhotoCategoryData)
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter((m) =>
      matchesPhotoCategory(m, activePhotoCategory),
    );
  }, [allPhotos, activePhotoCategory]);

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
    [theme],
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>{getTitle()}</ThemedText>
        </View>

        <PhotoGridList photos={filteredPhotos} onImagePress={onImagePress} />
      </View>
    </ThemedView>
  );
}

export default PhotoGrid;
