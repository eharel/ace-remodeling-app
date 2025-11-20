import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getCategoryConfig,
  isValidCategoryKey,
} from "@/core/constants/categoryConfig";
import { DesignTokens } from "@/core/themes";
import {
  ComponentCategory,
  CORE_CATEGORIES,
} from "@/core/types/ComponentCategory";
import { FeaturedCategorySection, HeroCarousel } from "@/features/showcase";
import { PageHeader, ThemedText, ThemedView } from "@/shared/components";
import { useProjects, useTheme } from "@/shared/contexts";

/**
 * Showcase Tab - Portfolio Showcase Screen
 *
 * Primary entry point for the app, displaying featured projects.
 * This is the new home screen that showcases our finest work.
 */
export default function ShowcaseScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { featuredProjects } = useProjects();

  /**
   * Group featured projects by category dynamically
   * Only includes categories that have at least 1 featured project
   * Returns a Map for efficient lookups and iteration
   */
  const featuredByCategory = useMemo(() => {
    const grouped = new Map<ComponentCategory, typeof featuredProjects>();

    // Normalize category names (e.g., "outdoor" -> "outdoor-living")
    const normalizeCategory = (category: string): ComponentCategory => {
      if (category === "outdoor") {
        return CORE_CATEGORIES.OUTDOOR_LIVING;
      }
      return category as ComponentCategory;
    };

    featuredProjects.forEach((project) => {
      // Group by ALL component categories - show project in each category it belongs to
      // This way a project with [bathroom, kitchen, full-home] appears in all three sections
      const categories = project.components.map((c) => c.category);
      if (categories.length === 0) {
        // Fallback if no components
        const defaultCategory = normalizeCategory("miscellaneous");
        const existing = grouped.get(defaultCategory) || [];
        grouped.set(defaultCategory, [...existing, project]);
      } else {
        // Add project to each category it belongs to
        categories.forEach((rawCategory) => {
          const normalizedCategory = normalizeCategory(rawCategory);
          const existing = grouped.get(normalizedCategory) || [];
          // Only add if not already in this category (avoid duplicates)
          if (!existing.includes(project)) {
            grouped.set(normalizedCategory, [...existing, project]);
          }
        });
      }
    });

    return grouped;
  }, [featuredProjects]);

  /**
   * Get sorted array of categories with featured projects
   * Sorted by category name for consistent ordering
   */
  const categoriesWithFeatured = useMemo(() => {
    return Array.from(featuredByCategory.keys()).sort();
  }, [featuredByCategory]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      paddingBottom: DesignTokens.spacing[8] + insets.bottom,
    },
    accentContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: DesignTokens.spacing[2],
    },
    accentLine: {
      width: 40,
      height: 3,
      backgroundColor: theme.colors.showcase.accent,
      borderRadius: DesignTokens.borderRadius.full,
      marginRight: DesignTokens.spacing[2],
    },
    accentIcon: {
      marginRight: DesignTokens.spacing[1],
    },
    carouselContainer: {
      marginTop: DesignTokens.spacing[6],
      marginBottom: DesignTokens.spacing[2],
    },
    emptyStateContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: DesignTokens.spacing[20],
      paddingHorizontal: DesignTokens.spacing[8],
      minHeight: 300,
    },
    emptyStateIcon: {
      marginBottom: DesignTokens.spacing[6],
      opacity: 0.9,
    },
    emptyStateTitle: {
      fontSize: DesignTokens.typography.fontSize["2xl"],
      fontWeight: DesignTokens.typography.fontWeight.semibold,
      fontFamily: DesignTokens.typography.fontFamily.semibold,
      color: theme.colors.text.primary,
      textAlign: "center",
      marginBottom: DesignTokens.spacing[3],
    },
    emptyStateMessage: {
      fontSize: DesignTokens.typography.fontSize.base,
      lineHeight:
        DesignTokens.typography.fontSize.base *
        DesignTokens.typography.lineHeight.relaxed,
      color: theme.colors.text.secondary,
      textAlign: "center",
      maxWidth: 500,
    },
  });

  return (
    <ThemedView style={styles.container}>
      <PageHeader
        title="Portfolio Showcase"
        subtitle="Our finest work"
        variant="default"
      >
        {/* Subtle showcase accent - gold line with star icon */}
        <View style={styles.accentContainer}>
          <View style={styles.accentLine} />
          <MaterialIcons
            name="star"
            size={16}
            color={theme.colors.showcase.accent}
            style={styles.accentIcon}
          />
        </View>
      </PageHeader>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero Carousel - Auto-advancing featured projects */}
        <View style={styles.carouselContainer}>
          <HeroCarousel projects={featuredProjects} />
        </View>

        {/* Dynamic Category Sections - Only render if we have featured projects */}
        {featuredProjects.length > 0 ? (
          categoriesWithFeatured.map((category) => {
            const projects = featuredByCategory.get(category);
            if (!projects || projects.length === 0) {
              return null;
            }

            // Check if category has config, skip if not
            // getCategoryConfig expects CoreCategory, so we need to check if it's a core category
            const categoryConfig = isValidCategoryKey(category)
              ? getCategoryConfig(category)
              : null;
            if (!categoryConfig) {
              return null;
            }

            // Skip internal categories (management tools, etc.)
            if (
              "internal" in categoryConfig &&
              categoryConfig.internal === true
            ) {
              return null;
            }
            return (
              <FeaturedCategorySection
                key={category}
                category={category}
                projects={projects}
              />
            );
          })
        ) : (
          /* Empty State - No featured projects at all */
          <View style={styles.emptyStateContainer}>
            <MaterialIcons
              name="star-border"
              size={72}
              color={theme.colors.showcase.accent}
              style={styles.emptyStateIcon}
            />
            <ThemedText style={styles.emptyStateTitle}>
              Building our showcase
            </ThemedText>
            <ThemedText style={styles.emptyStateMessage}>
              Featured projects will appear here as we curate our finest work.
              Check back soon to see our portfolio highlights.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
