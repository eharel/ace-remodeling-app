import { useProject } from "@/features/projects/hooks/useProject";
import { usePhotoGallery } from "@/features/gallery/hooks/usePhotoGallery";
import type { PhotoTabValue } from "@/features/gallery/components/PhotoPreview";
import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { PhotoGridList } from "./PhotoGridList";

interface PhotoGridProps {
  onImagePress: (index: number) => void;
  activeTab?: PhotoTabValue;
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

  // Filter MediaAsset[] based on active tab (same logic as usePhotoGallery)
  const filteredPhotos = useMemo(() => {
    if (activeTab === "all") {
      return allPhotos.filter((m) => m.mediaType === "image");
    }
    const stageMap: Record<string, string> = {
      before: "before",
      after: "after",
      progress: "in-progress",
    };
    const targetStage = stageMap[activeTab] || activeTab;
    return allPhotos.filter(
      (m) => m.mediaType === "image" && m.stage === targetStage
    );
  }, [allPhotos, activeTab]);

  // Get display title based on active tab
  const getTitle = () => {
    const count = photoCounts[activeTab];
    const tabLabels: Record<PhotoTabValue, string> = {
      all: "All Photos",
      after: "After Photos",
      before: "Before Photos",
      progress: "In Progress Photos",
    };
    return `${tabLabels[activeTab]} (${count})`;
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
