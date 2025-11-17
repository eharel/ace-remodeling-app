import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getCategoryConfig } from "@/core/constants/categoryConfig";
import { DesignTokens } from "@/core/themes";
import { ProjectCategory } from "@/core/types";
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
    const grouped = new Map<ProjectCategory, typeof featuredProjects>();

    featuredProjects.forEach((project) => {
      const existing = grouped.get(project.category) || [];
      grouped.set(project.category, [...existing, project]);
    });

    // Debug logging
    console.log("🔍 Featured Projects Debug:");
    console.log(`  Total featured projects: ${featuredProjects.length}`);
    console.log("  Featured projects by category:");
    grouped.forEach((projects, category) => {
      console.log(`    ${category}: ${projects.length} project(s)`);
      projects.forEach((p) => {
        console.log(`      - ${p.name} (${p.id}) - featured: ${p.featured}`);
      });
    });

    return grouped;
  }, [featuredProjects]);

  /**
   * Get sorted array of categories with featured projects
   * Sorted by category name for consistent ordering
   */
  const categoriesWithFeatured = useMemo(() => {
    const categories = Array.from(featuredByCategory.keys()).sort();
    console.log("📋 Categories with featured projects:", categories);
    return categories;
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
    },
    emptyStateContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: DesignTokens.spacing[16],
      paddingHorizontal: DesignTokens.spacing[8],
    },
    emptyStateIcon: {
      marginBottom: DesignTokens.spacing[4],
    },
    emptyStateTitle: {
      fontSize: DesignTokens.typography.fontSize.xl,
      fontWeight: DesignTokens.typography.fontWeight.semibold,
      fontFamily: DesignTokens.typography.fontFamily.semibold,
      color: theme.colors.text.primary,
      textAlign: "center",
      marginBottom: DesignTokens.spacing[2],
    },
    emptyStateMessage: {
      fontSize: DesignTokens.typography.fontSize.base,
      lineHeight:
        DesignTokens.typography.fontSize.base *
        DesignTokens.typography.lineHeight.normal,
      color: theme.colors.text.secondary,
      textAlign: "center",
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
              console.log(`⚠️  Skipping ${category}: no projects`);
              return null;
            }

            // Check if category has config, skip if not
            const categoryConfig = getCategoryConfig(category);
            if (!categoryConfig) {
              console.log(`⚠️  Skipping ${category}: no category config found`);
              return null;
            }

            // Skip internal categories (management tools, etc.)
            if (
              "internal" in categoryConfig &&
              categoryConfig.internal === true
            ) {
              console.log(`⚠️  Skipping ${category}: internal category`);
              return null;
            }

            console.log(
              `✅ Rendering section for ${category} with ${projects.length} project(s)`
            );
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
              size={64}
              color={theme.colors.showcase.accent}
              style={styles.emptyStateIcon}
            />
            <ThemedText style={styles.emptyStateTitle}>
              Building our showcase
            </ThemedText>
            <ThemedText style={styles.emptyStateMessage}>
              Featured projects will appear here as we curate our portfolio
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
