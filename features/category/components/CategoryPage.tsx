import { StyleSheet } from "react-native";

import { DesignTokens } from "@/core/themes";
import { commonStyles } from "@/shared/utils";
import { ProjectCategory, ProjectSummary } from "@/core/types";
import { ProjectGallery } from "@/features/projects";
import { ThemedText, ThemedView } from "@/shared/components";

interface CategoryPageProps {
  category: ProjectCategory;
  title: string;
  subtitle: string;
  galleryTitle: string;
  gallerySubtitle: string;
  projects: ProjectSummary[];
  onProjectPress: (project: ProjectSummary) => void;
}

export function CategoryPage({
  title,
  subtitle,
  galleryTitle,
  gallerySubtitle,
  projects,
  onProjectPress,
}: CategoryPageProps) {
  // Error handling: Ensure projects is an array and onProjectPress is a function
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeOnProjectPress =
    typeof onProjectPress === "function" ? onProjectPress : () => {};

  return (
    <ThemedView
      style={styles.container}
      testID={`${title.toLowerCase().replace(/\s+/g, "-")}-page`}
      accessibilityLabel={`${title} page`}
    >
      <ThemedView
        style={styles.header}
        testID={`${title.toLowerCase().replace(/\s+/g, "-")}-header`}
        accessibilityLabel="Page header"
      >
        <ThemedText
          variant="title"
          testID={`${title.toLowerCase().replace(/\s+/g, "-")}-title`}
          accessibilityRole="header"
        >
          {title}
        </ThemedText>
        <ThemedText
          variant="subtitle"
          testID={`${title.toLowerCase().replace(/\s+/g, "-")}-subtitle`}
        >
          {subtitle}
        </ThemedText>
      </ThemedView>

      <ThemedView
        style={styles.galleryHeader}
        testID={`${title.toLowerCase().replace(/\s+/g, "-")}-gallery-header`}
        accessibilityLabel="Gallery section header"
      >
        <ThemedText
          variant="subtitle"
          style={styles.galleryTitle}
          testID={`${title.toLowerCase().replace(/\s+/g, "-")}-gallery-title`}
          accessibilityRole="header"
        >
          {galleryTitle}
        </ThemedText>
        <ThemedText
          variant="body"
          style={styles.gallerySubtitle}
          testID={`${title
            .toLowerCase()
            .replace(/\s+/g, "-")}-gallery-subtitle`}
        >
          {gallerySubtitle}
        </ThemedText>
      </ThemedView>

      <ProjectGallery
        projects={safeProjects}
        onProjectPress={safeOnProjectPress}
        testID={`${title.toLowerCase().replace(/\s+/g, "-")}-gallery`}
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
    gap: DesignTokens.spacing[2],
  },
  galleryHeader: {
    marginBottom: DesignTokens.spacing[6],
    paddingHorizontal: DesignTokens.spacing[5],
    gap: DesignTokens.spacing[2],
  },
  galleryTitle: {
    ...commonStyles.text.sectionTitle,
    // Override lineHeight to tight for compact layout
    lineHeight:
      DesignTokens.typography.fontSize["2xl"] *
      DesignTokens.typography.lineHeight.tight,
  },
  gallerySubtitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    lineHeight: DesignTokens.typography.lineHeight.relaxed,
  },
});
