import { router } from "expo-router";
import { StyleSheet } from "react-native";

import { ProjectGallery } from "@/components/ProjectGallery";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getProjectSummariesByCategory } from "@/data/mockProjects";

export default function KitchensScreen() {
  const kitchenProjects = getProjectSummariesByCategory("kitchen");

  const handleProjectPress = (project: any) => {
    router.push(`/project/${project.id}`);
  };

  console.log(
    "🏠 Kitchens page loaded - Found",
    kitchenProjects.length,
    "projects"
  );

  // Debug: Log each project's details
  kitchenProjects.forEach((project, index) => {
    console.log(`Project ${index + 1}:`, {
      id: project.id,
      name: project.name,
      thumbnail: project.thumbnail,
      status: project.status,
      category: project.category,
    });
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Kitchen Projects</ThemedText>
        <ThemedText type="subtitle">
          Transform your kitchen with our expert remodeling services
        </ThemedText>
      </ThemedView>

      <ProjectGallery
        projects={kitchenProjects}
        title="Featured Kitchen Renovations"
        subtitle="See our latest kitchen transformation projects"
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
