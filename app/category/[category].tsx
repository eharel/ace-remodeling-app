import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ProjectSummary } from "@/core/types";
import {
  ComponentCategory,
  CORE_CATEGORIES,
  CoreCategory,
  getSubcategoryLabel,
} from "@/core/types/ComponentCategory";
import {
  getProjectCompletionDate,
  getProjectThumbnail,
} from "@/core/types/ProjectUtils";
import { CategoryPicker } from "@/features/category";
import { ProjectGallery } from "@/features/projects";
import {
  EmptyState,
  LoadingState,
  PageHeader,
  ThemedText,
  ThemedView,
} from "@/shared/components";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { useProjects, useTheme } from "@/shared/contexts";
import {
  filterSummariesBySubcategory,
  getAllCategories,
  getCategoryDisplayName,
  getSubcategories,
  getSubcategoryCount,
  shouldShowSubcategoryFilter,
} from "@/shared/utils";

export default function CategoryScreen() {
  const { theme } = useTheme();
  const { projects, loading, error } = useProjects();
  const { category } = useLocalSearchParams<{ category: string }>();

  // State for selected subcategory
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");

  // Define styles early to avoid hoisting issues
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background.primary,
        },
        content: {
          flex: 1,
          paddingHorizontal: DesignTokens.spacing[4],
          paddingBottom: DesignTokens.spacing[8],
        },
        filterContainer: {
          paddingHorizontal: DesignTokens.spacing[4],
          paddingTop: DesignTokens.spacing[4],
          paddingBottom: DesignTokens.spacing[2],
        },
        projectCount: {
          fontSize: DesignTokens.typography.fontSize.sm,
          lineHeight:
            DesignTokens.typography.fontSize.sm *
            DesignTokens.typography.lineHeight.tight,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          color: theme.colors.text.secondary,
        },
        emptyState: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: DesignTokens.spacing[6],
        },
      }),
    [theme]
  );

  // Validate category parameter
  const validCategory = category as ComponentCategory;
  const allCategories = getAllCategories();

  if (!category || !allCategories.includes(category as CoreCategory)) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false, // Hide React Navigation header
          }}
        />
        <PageHeader
          title="Category Not Found"
          showBack={true}
          backLabel="Portfolio"
          layoutMode="inline"
        />
        <EmptyState
          title="Category Not Found"
          message="The requested category does not exist."
          actionText="Go to Portfolio"
          onAction={() => {
            // @ts-expect-error - Expo Router generated types are overly strict
            router.push("/(tabs)/portfolio");
          }}
        />
      </ThemedView>
    );
  }

  // Normalize category names (e.g., "outdoor" -> "outdoor-living")
  // This handles legacy data where projects may use "outdoor" instead of "outdoor-living"
  const normalizeCategory = (category: string): ComponentCategory => {
    if (category === "outdoor") {
      return CORE_CATEGORIES.OUTDOOR_LIVING;
    }
    return category as ComponentCategory;
  };

  // Filter projects by category (check if any component matches) and convert to ProjectSummary
  const allCategoryProjects = useMemo((): ProjectSummary[] => {
    if (!projects) return [];
    return projects
      .filter((project) =>
        project.components.some((c) => {
          const normalizedComponentCategory = normalizeCategory(c.category);
          return normalizedComponentCategory === validCategory;
        })
      )
      .map((project) => ({
        id: project.id,
        projectNumber: project.number,
        name: project.name,
        category: validCategory,
        briefDescription: project.summary,
        thumbnail: getProjectThumbnail(project),
        status: project.status,
        completedAt: getProjectCompletionDate(project),
      }));
  }, [projects, validCategory]);

  // Extract available subcategories for this category
  const subcategories = useMemo(() => {
    if (!projects) return [];
    return getSubcategories(projects, validCategory);
  }, [projects, validCategory]);

  // Determine if we should show the subcategory filter
  const showSubcategoryFilter = useMemo(() => {
    return shouldShowSubcategoryFilter(subcategories);
  }, [subcategories]);

  // Reset selected subcategory if it's no longer available
  useEffect(() => {
    if (!subcategories.includes(selectedSubcategory)) {
      setSelectedSubcategory("all");
    }
  }, [subcategories, selectedSubcategory]);

  // Apply subcategory filter to projects
  const categoryProjects = useMemo((): ProjectSummary[] => {
    if (!projects || !showSubcategoryFilter) {
      return allCategoryProjects;
    }
    return filterSummariesBySubcategory(
      allCategoryProjects,
      projects,
      validCategory,
      selectedSubcategory
    );
  }, [
    allCategoryProjects,
    projects,
    validCategory,
    selectedSubcategory,
    showSubcategoryFilter,
  ]);

  const categoryDisplayName = getCategoryDisplayName(validCategory);

  const handleProjectPress = (projectSummary: any) => {
    // Find the full project object to get component information
    const fullProject = projects.find((p) => p.id === projectSummary.id);

    if (fullProject) {
      // Find the component that matches the current category
      // Use normalization to handle legacy "outdoor" category
      const matchingComponent = fullProject.components.find((c) => {
        const normalizedComponentCategory = normalizeCategory(c.category);
        return normalizedComponentCategory === validCategory;
      });

      if (matchingComponent) {
        // Navigate with componentId param to open directly to that component
        router.push({
          pathname: `/project/${fullProject.id}` as any,
          params: { componentId: matchingComponent.id },
        });
      } else {
        // Fallback: no matching component found, just navigate to project
        router.push(`/project/${fullProject.id}` as any);
      }
    } else {
      // Fallback: project not found in full list, use summary ID
      router.push(`/project/${projectSummary.id}` as any);
    }
  };

  const handleCategoryChange = (newCategory: ComponentCategory) => {
    // Use replace to avoid building up navigation stack
    router.replace(`/category/${newCategory}`);
  };

  // Show loading state only on initial load (when no projects exist yet)
  // During refresh, keep content visible and just show refresh spinner
  if (loading && projects.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false, // Hide React Navigation header
          }}
        />
        <PageHeader
          customTitle={
            <CategoryPicker
              currentCategory={validCategory}
              onCategoryChange={handleCategoryChange}
            />
          }
          showBack={true}
          backLabel="Portfolio"
          layoutMode="inline"
        />
        <LoadingState />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false, // Hide React Navigation header
          }}
        />
        <PageHeader
          customTitle={
            <CategoryPicker
              currentCategory={validCategory}
              onCategoryChange={handleCategoryChange}
            />
          }
          showBack={true}
          backLabel="Portfolio"
          layoutMode="inline"
        />
        <EmptyState
          title="Error Loading Projects"
          message="There was an error loading the projects. Please try again."
          actionText="Retry"
          onAction={() => {
            // TODO: trigger projects refresh when available
          }}
        />
      </ThemedView>
    );
  }

  if (categoryProjects.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false, // Hide React Navigation header
          }}
        />
        <PageHeader
          customTitle={
            <CategoryPicker
              currentCategory={validCategory}
              onCategoryChange={handleCategoryChange}
            />
          }
          showBack={true}
          backLabel="Portfolio"
          layoutMode="inline"
        />
        <EmptyState
          title={`No ${categoryDisplayName} Projects`}
          message={`We don't have any ${categoryDisplayName.toLowerCase()} projects to show at the moment.`}
          actionText="Browse Other Categories"
          onAction={() => {
            // @ts-expect-error - Expo Router generated types are overly strict
            router.push("/(tabs)/portfolio");
          }}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false, // Hide React Navigation header
        }}
      />
      <PageHeader
        customTitle={
          <CategoryPicker
            currentCategory={validCategory}
            onCategoryChange={handleCategoryChange}
          />
        }
        showBack={true}
        backLabel="Portfolio"
        layoutMode="inline"
        subtitle={`Explore our ${categoryDisplayName.toLowerCase()} portfolio`}
      >
        <ThemedText style={styles.projectCount}>
          {categoryProjects.length} project
          {categoryProjects.length !== 1 ? "s" : ""}
        </ThemedText>
      </PageHeader>

      <View style={styles.content}>
        {/* Subcategory filter - only shown if multiple subcategories exist */}
        {showSubcategoryFilter && (
          <View style={styles.filterContainer}>
            <SegmentedControl
              variant="tabs"
              options={subcategories as readonly string[]}
              selected={selectedSubcategory}
              onSelect={setSelectedSubcategory}
              showCounts={true}
              getCounts={(subcategory) =>
                getSubcategoryCount(projects, validCategory, subcategory)
              }
              getLabel={(subcategory) => {
                if (subcategory === "all") {
                  return "All";
                }
                return getSubcategoryLabel(subcategory);
              }}
              ariaLabel="Filter by project type"
              testID={`${validCategory}-subcategory-filter`}
            />
          </View>
        )}

        {/* Project gallery or empty state */}
        {categoryProjects.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText
              style={{
                fontSize: DesignTokens.typography.fontSize.lg,
                color: theme.colors.text.secondary,
                textAlign: "center",
              }}
            >
              {selectedSubcategory === "all"
                ? `No ${categoryDisplayName.toLowerCase()} projects available yet.`
                : `No ${getSubcategoryLabel(
                    selectedSubcategory
                  ).toLowerCase()} projects available yet.`}
            </ThemedText>
          </ThemedView>
        ) : (
          <ProjectGallery
            projects={categoryProjects}
            onProjectPress={handleProjectPress}
            enableRefresh={true}
          />
        )}
      </View>
    </ThemedView>
  );
}
