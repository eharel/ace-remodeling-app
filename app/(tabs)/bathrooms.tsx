import { router } from "expo-router";
import { StyleSheet } from "react-native";

import { ProjectGallery } from "@/components/ProjectGallery";
import { ThemedText, ThemedView } from "@/components/themed";
import { getProjectSummariesByCategory } from "@/data/mockProjects";
import { DesignTokens } from "@/themes";

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

      <ThemedView style={styles.galleryHeader}>
        <ThemedText variant="subtitle" style={styles.galleryTitle}>
          Featured Bathroom Renovations
        </ThemedText>
        <ThemedText variant="body" style={styles.gallerySubtitle}>
          See our latest bathroom transformation projects
        </ThemedText>
      </ThemedView>

      <ProjectGallery
        projects={bathroomProjects}
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
