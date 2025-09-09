import { router } from "expo-router";
import { StyleSheet } from "react-native";

import { ProjectGallery } from "@/components/ProjectGallery";
import { ThemedText, ThemedView } from "@/components/themed";
import { getProjectSummariesByCategory } from "@/data/mockProjects";
import { DesignTokens } from "@/themes";

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
        <ThemedText variant="title">Kitchen Projects</ThemedText>
        <ThemedText variant="subtitle">
          Transform your kitchen with our expert remodeling services
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.galleryHeader}>
        <ThemedText variant="subtitle" style={styles.galleryTitle}>
          Featured Kitchen Renovations
        </ThemedText>
        <ThemedText variant="body" style={styles.gallerySubtitle}>
          See our latest kitchen transformation projects
        </ThemedText>
      </ThemedView>

      <ProjectGallery
        projects={kitchenProjects}
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
    marginTop: DesignTokens.spacing[16],
    marginBottom: DesignTokens.spacing[8],
    paddingHorizontal: DesignTokens.spacing[5],
    gap: 8,
  },
  galleryHeader: {
    marginBottom: DesignTokens.spacing[6],
    paddingHorizontal: DesignTokens.spacing[5],
    gap: DesignTokens.spacing[2],
  },
  galleryTitle: {
    fontSize: DesignTokens.typography.fontSize["2xl"],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    lineHeight: DesignTokens.typography.lineHeight.tight,
  },
  gallerySubtitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    lineHeight: DesignTokens.typography.lineHeight.relaxed,
  },
});
