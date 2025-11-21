import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from "react-native";

import { getCategoryConfig } from "@/core/constants/categoryConfig";
import { DesignTokens } from "@/core/themes";
import { Project, ProjectSummary, getProjectThumbnail } from "@/core/types";
import {
  getProjectCompletionDate,
} from "@/core/types/ProjectUtils";
import { ComponentCategory, CoreCategory } from "@/core/types/ComponentCategory";
import { ProjectCard } from "@/features/projects";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { getCategoryIcon } from "@/shared/utils";

const CARD_WIDTH = 300; // ~280-320px for iPad
const CARD_SPACING = DesignTokens.spacing[4];
const LIST_PADDING_LEFT = DesignTokens.spacing[6];
const BLURHASH_PLACEHOLDER = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface FeaturedCategorySectionProps {
  category: ComponentCategory;
  projects: Project[];
}

const staticSectionStyles = StyleSheet.create({
  section: {
    marginTop: DesignTokens.spacing[8],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: LIST_PADDING_LEFT,
    marginBottom: DesignTokens.spacing[4],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: DesignTokens.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: DesignTokens.spacing[3],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize["2xl"],
    lineHeight:
      DesignTokens.typography.fontSize["2xl"] *
      DesignTokens.typography.lineHeight.tight,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: DesignTokens.typography.fontFamily.bold,
    flex: 1,
  },
  listContainer: {
    paddingLeft: LIST_PADDING_LEFT,
  },
  cardWrapper: {
    marginRight: CARD_SPACING,
  },
});

/**
 * Convert Project to ProjectSummary for use with ProjectCard
 */
function convertProjectToSummary(
  project: Project,
  category: ComponentCategory
): ProjectSummary {
  // Find the matching component for this category
  const matchingComponent = project.components.find(
    (c) => c.category === category
  );

  return {
    id: project.id,
    projectNumber: project.number,
    name: project.name,
    category: category,
    subcategory: matchingComponent?.subcategory,
    briefDescription: project.summary,
    thumbnail: getProjectThumbnail(project),
    status: project.status,
    isFeatured: project.isFeatured,
    completedAt: getProjectCompletionDate(project),
  };
}

/**
 * FeaturedCategorySection - Horizontal scrolling section for featured projects by category
 *
 * Displays a section header with category icon and title, followed by a
 * horizontal FlatList of featured project cards. Only renders if projects array
 * has items.
 *
 * @param {ProjectCategory} category - The category for this section
 * @param {Project[]} projects - Featured projects in this category
 */
export function FeaturedCategorySection({
  category,
  projects,
}: FeaturedCategorySectionProps) {
  const { theme } = useTheme();

  // Get category config and icon - use fallbacks if not found
  const categoryConfig = getCategoryConfig(category as CoreCategory);
  const categoryIcon = getCategoryIcon(category);

  // Dynamic styles - only theme-dependent colors
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        iconContainer: {
          ...staticSectionStyles.iconContainer,
          backgroundColor: theme.colors.background.secondary,
        },
        title: {
          ...staticSectionStyles.title,
          color: theme.colors.text.primary,
        },
      }),
    [theme]
  );

  const handleProjectPress = useCallback(
    (projectSummary: ProjectSummary) => {
      // Find the original project to get component information
      const project = projects.find((p) => p.id === projectSummary.id);
      if (!project) return;

      // Find the component that matches the category for this section
      const matchingComponent = project.components.find(
        (c) => c.category === category
      );

      if (matchingComponent) {
        // Navigate with componentId param to open directly to that component
        router.push({
          pathname: `/project/${project.id}`,
          params: { componentId: matchingComponent.id },
        });
      } else {
        // Fallback: no matching component found, just navigate to project
        router.push(`/project/${project.id}`);
      }
    },
    [projects, category]
  );

  const renderCard = useCallback(
    ({ item }: ListRenderItemInfo<Project>) => {
      const projectSummary = convertProjectToSummary(item, category);
      return (
        <View style={staticSectionStyles.cardWrapper}>
          <ProjectCard
            project={projectSummary}
            onPress={handleProjectPress}
            variant="horizontal"
            blurhashPlaceholder={BLURHASH_PLACEHOLDER}
          />
        </View>
      );
    },
    [category, handleProjectPress]
  );

  // Fixed getItemLayout - accounts for listContainer paddingLeft
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_WIDTH + CARD_SPACING,
      // First item starts at paddingLeft, subsequent items are offset by card width + spacing
      offset: LIST_PADDING_LEFT + (CARD_WIDTH + CARD_SPACING) * index,
      index,
    }),
    []
  );

  // Early returns after all hooks
  if (projects.length === 0) {
    return null;
  }

  if (!categoryConfig) {
    // Skip categories without config
    return null;
  }

  return (
    <View style={staticSectionStyles.section}>
      {/* Section Header */}
      <View style={staticSectionStyles.header}>
        <View style={dynamicStyles.iconContainer}>
          <MaterialIcons
            name={categoryIcon as any}
            size={24}
            color={theme.colors.interactive.primary}
          />
        </View>
        <ThemedText style={dynamicStyles.title}>
          Featured {categoryConfig.title}
        </ThemedText>
      </View>

      {/* Horizontal Project List */}
      <FlatList
        data={projects}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={staticSectionStyles.listContainer}
        getItemLayout={getItemLayout}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
        pagingEnabled={false}
      />
    </View>
  );
}
