import { useProject } from "@/features/projects/hooks/useProject";
import { usePhotoGallery } from "@/features/gallery/hooks/usePhotoGallery";
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
  activeTab?: PhotoCategory;
}

export function PhotoGrid({
  onImagePress,
  activeTab = "all",
}: PhotoGridProps) {
  const { theme } = useTheme();
  const { id: projectId, componentId } = useLocalSearchParams<{
    id?: string;
    componentId?: string;
  }>();

  const { project } = useProject(projectId);

  const allPhotos =
    project?.components.find((c) => c.id === componentId)?.media || [];

  // Filter photos based on active tab using the same logic as PhotoPreviewSection
  const { photoCounts } = usePhotoGallery({
    media: allPhotos,
    activePhotoTab: activeTab,
  });

  // Filter MediaAsset[] based on active category (same logic as usePhotoGallery)
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter((m) => matchesPhotoCategory(m, activeTab));
  }, [allPhotos, activeTab]);

  // Get display title based on active category
  const getTitle = () => {
    const count = photoCounts[activeTab];
    const label = PHOTO_CATEGORY_LABELS[activeTab];
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
