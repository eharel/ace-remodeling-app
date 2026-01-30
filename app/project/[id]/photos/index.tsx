import { PhotoGrid } from "@/features/gallery";
import { useProject } from "@/features/projects/hooks/useProject";
import { PageHeader, ThemedText } from "@/shared/components";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { type PhotoCategory } from "@/shared/constants";

export default function PhotoGridScreen() {
  const { id: projectId, componentId, activeTab } = useLocalSearchParams<{
    id: string;
    componentId: string;
    activeTab?: string;
  }>();

  const { project, isLoading, error } = useProject(projectId);

  // Get component name or fallback to project name
  const selectedComponent = project?.components.find(
    (c) => c.id === componentId,
  );
  const headerTitle =
    selectedComponent?.name ?? project?.name ?? "Project Photos";

  // Parse and validate activeTab from route params
  const photoCategory: PhotoCategory =
    activeTab && ["all", "before", "progress", "after"].includes(activeTab)
      ? (activeTab as PhotoCategory)
      : "all";

  const handleImagePress = (index: number) => {
    router.navigate({
      pathname: "/project/[id]/photos/viewer",
      params: {
        id: projectId,
        initialIndex: index,
        componentId: componentId,
        activeTab: photoCategory, // Pass category to viewer for consistency
      },
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <PageHeader title={headerTitle} showBack={true} layoutMode="inline" />
      <PhotoGrid onImagePress={handleImagePress} activeTab={photoCategory} />
    </SafeAreaView>
  );
}
