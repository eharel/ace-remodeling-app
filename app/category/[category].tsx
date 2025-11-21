import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ComponentCategory, CoreCategory } from "@/core/types/ComponentCategory";
import { ProjectSummary } from "@/core/types";
import { getProjectThumbnail, getProjectCompletionDate } from "@/core/types/ProjectUtils";
import { CategoryPicker } from "@/features/category";
import { ProjectGallery } from "@/features/projects";
import {
  EmptyState,
  LoadingState,
  PageHeader,
  ThemedText,
  ThemedView,
} from "@/shared/components";
import { useProjects, useTheme } from "@/shared/contexts";
import { getAllCategories, getCategoryDisplayName } from "@/shared/utils";

export default function CategoryScreen() {
  const { theme } = useTheme();
  const { projects, loading, error } = useProjects();
  const { category } = useLocalSearchParams<{ category: string }>();

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
        projectCount: {
          fontSize: DesignTokens.typography.fontSize.sm,
          lineHeight:
            DesignTokens.typography.fontSize.sm *
            DesignTokens.typography.lineHeight.tight,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          color: theme.colors.text.secondary,
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

  // Filter projects by category (check if any component matches) and convert to ProjectSummary
  const categoryProjects = useMemo((): ProjectSummary[] => {
    if (!projects) return [];
    return projects
      .filter((project) =>
        project.components.some((c) => c.category === validCategory)
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

  const categoryDisplayName = getCategoryDisplayName(validCategory);

  const handleProjectPress = (projectSummary: any) => {
    // Find the full project object to get component information
    const fullProject = projects.find((p) => p.id === projectSummary.id);
    
    if (fullProject) {
      // Find the component that matches the current category
      const matchingComponent = fullProject.components.find(
        (c) => c.category === validCategory
      );
      
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
        <ProjectGallery
          projects={categoryProjects}
          onProjectPress={handleProjectPress}
          enableRefresh={true}
        />
      </View>
    </ThemedView>
  );
}
