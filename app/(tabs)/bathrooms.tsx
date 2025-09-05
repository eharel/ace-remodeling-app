import { router } from "expo-router";
import { StyleSheet } from "react-native";

import { ProjectGallery } from "@/components/ProjectGallery";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getProjectSummariesByCategory } from "@/data/mockProjects";

export default function BathroomsScreen() {
  const bathroomProjects = getProjectSummariesByCategory("bathroom");

  const handleProjectPress = (project: any) => {
    router.push(`/project/${project.id}`);
  };

  console.log(
    "🚿 Bathrooms page loaded - Found",
    bathroomProjects.length,
    "projects"
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText variant="title">Bathroom Projects</ThemedText>
        <ThemedText variant="subtitle">
          Transform your bathroom with our expert remodeling services
        </ThemedText>
      </ThemedView>

      <ProjectGallery
        projects={bathroomProjects}
        title="Featured Bathroom Renovations"
        subtitle="See our latest bathroom transformation projects"
        onProjectPress={handleProjectPress}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
    paddingHorizontal: 20,
    gap: 8,
  },
});
