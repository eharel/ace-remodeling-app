import { PhotoGrid } from "@/features/gallery";
import { useProject } from "@/features/projects/hooks/useProject";
import { PageHeader, ThemedText } from "@/shared/components";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PhotoGridScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();

  const { project, isLoading, error } = useProject(projectId);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
      <PageHeader title="All Photos" showBack={true} layoutMode="inline" />
      <ThemedText style={{ padding: 16 }}>
        Photo Grid Screen, project id: {projectId}
      </ThemedText>
      <PhotoGrid visible={true} onClose={() => {}} onImagePress={() => {}} />
    </SafeAreaView>
  );
}
