import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import { Project, ProjectCategory } from "@/core/types";
import { getCategoryConfig } from "@/core/constants/categoryConfig";
import { getCategoryIcon } from "@/shared/utils";
import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = 300; // ~280-320px for iPad
const CARD_HEIGHT = 240; // ~200-240px tall
const CARD_SPACING = DesignTokens.spacing[4];

interface FeaturedCategorySectionProps {
  category: ProjectCategory;
  projects: Project[];
}

/**
 * FeaturedProjectCard - Card component for horizontal scrolling featured projects
 *
 * Displays project thumbnail, name, brief description, and featured badge.
 * Optimized for horizontal FlatList with consistent sizing.
 */
function FeaturedProjectCard({ project }: { project: Project }) {
  const { theme } = useTheme();

  const handlePress = useCallback(() => {
    router.push(`/project/${project.id}`);
  }, [project.id]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.lg,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.md,
        },
        imageContainer: {
          width: "100%",
          height: 160,
          position: "relative",
        },
        image: {
          width: "100%",
          height: "100%",
        },
        featuredBadge: {
          position: "absolute",
          top: DesignTokens.spacing[2],
          right: DesignTokens.spacing[2],
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          paddingHorizontal: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[1],
          borderRadius: DesignTokens.borderRadius.md,
        },
        featuredIcon: {
          marginRight: DesignTokens.spacing[1],
        },
        content: {
          padding: DesignTokens.spacing[3],
          flex: 1,
          justifyContent: "space-between",
        },
        title: {
          fontSize: DesignTokens.typography.fontSize.base,
          lineHeight:
            DesignTokens.typography.fontSize.base *
            DesignTokens.typography.lineHeight.tight,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          color: theme.colors.text.primary,
          marginBottom: DesignTokens.spacing[1],
        },
        description: {
          fontSize: DesignTokens.typography.fontSize.sm,
          lineHeight:
            DesignTokens.typography.fontSize.sm *
            DesignTokens.typography.lineHeight.normal,
          color: theme.colors.text.secondary,
          numberOfLines: 2,
        },
      }),
    [theme]
  );

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: DesignTokens.interactions.activeOpacity },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`View ${project.name} project details`}
      accessibilityHint="Double tap to view full project details"
    >
      {/* Project Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: project.thumbnail }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
          transition={200}
        />
        {/* Featured Badge */}
        <View style={styles.featuredBadge}>
          <MaterialIcons
            name="star"
            size={14}
            color={theme.colors.showcase.accent}
            style={styles.featuredIcon}
          />
          <ThemedText
            style={{
              fontSize: DesignTokens.typography.fontSize.xs,
              color: "#ffffff",
              fontWeight: DesignTokens.typography.fontWeight.semibold,
            }}
          >
            Featured
          </ThemedText>
        </View>
      </View>

      {/* Project Info */}
      <View style={styles.content}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {project.name}
        </ThemedText>
        <ThemedText style={styles.description} numberOfLines={2}>
          {project.briefDescription}
        </ThemedText>
      </View>
    </Pressable>
  );
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

  // Don't render if no projects
  if (projects.length === 0) {
    return null;
  }

  // Get category config and icon - use fallbacks if not found
  const categoryConfig = getCategoryConfig(category);
  if (!categoryConfig) {
    // Skip categories without config
    return null;
  }

  const categoryIcon = getCategoryIcon(category);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: {
          marginTop: DesignTokens.spacing[8],
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: DesignTokens.spacing[6],
          marginBottom: DesignTokens.spacing[4],
        },
        iconContainer: {
          width: 40,
          height: 40,
          borderRadius: DesignTokens.borderRadius.md,
          backgroundColor: theme.colors.background.secondary,
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
          color: theme.colors.text.primary,
          flex: 1,
        },
        listContainer: {
          paddingLeft: DesignTokens.spacing[6],
        },
        cardWrapper: {
          marginRight: CARD_SPACING,
        },
      }),
    [theme]
  );

  const renderCard = useCallback(
    ({ item }: ListRenderItemInfo<Project>) => (
      <View style={styles.cardWrapper}>
        <FeaturedProjectCard project={item} />
      </View>
    ),
    [styles]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_WIDTH + CARD_SPACING,
      offset: (CARD_WIDTH + CARD_SPACING) * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={categoryIcon as any}
            size={24}
            color={theme.colors.interactive.primary}
          />
        </View>
        <ThemedText style={styles.title}>
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
        contentContainerStyle={styles.listContainer}
        getItemLayout={getItemLayout}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
}

