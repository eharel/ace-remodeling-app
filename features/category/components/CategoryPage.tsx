import { StyleSheet } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ProjectCardView } from "@/core/types";
import { ComponentCategory } from "@/core/types/ComponentCategory";
import { ProjectGallery } from "@/features/projects";
import { ThemedText, ThemedView } from "@/shared/components";
import { commonStyles } from "@/shared/utils";

interface CategoryPageProps {
  category: ComponentCategory;
  title: string;
  subtitle: string;
  galleryTitle: string;
  gallerySubtitle: string;
  cardViews: ProjectCardView[];
  onCardPress: (cardView: ProjectCardView) => void;
}

export function CategoryPage({
  title,
  subtitle,
  galleryTitle,
  gallerySubtitle,
  cardViews,
  onCardPress,
}: CategoryPageProps) {
  // Error handling: Ensure cardViews is an array and onCardPress is a function
  const safeCardViews = Array.isArray(cardViews) ? cardViews : [];
  const safeOnCardPress =
    typeof onCardPress === "function" ? onCardPress : () => {};

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
        cardViews={safeCardViews}
        onCardPress={safeOnCardPress}
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
