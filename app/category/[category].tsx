import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ComponentCategory } from "@/core/types/ComponentCategory";
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

  // Validate category parameter
  const validCategory = category as ComponentCategory;
  if (!category || !getAllCategories().includes(category as ComponentCategory)) {
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
          onAction={() => router.push("/(tabs)/portfolio")}
        />
      </ThemedView>
    );
  }

  // Filter projects by category (check if any component matches)
  const categoryProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project) =>
      project.components.some((c) => c.category === validCategory)
    );
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
          pathname: `/project/${fullProject.id}`,
          params: { componentId: matchingComponent.id },
        });
      } else {
        // Fallback: no matching component found, just navigate to project
        router.push(`/project/${fullProject.id}`);
      }
    } else {
      // Fallback: project not found in full list, use summary ID
      router.push(`/project/${projectSummary.id}`);
    }
  };

  const handleCategoryChange = (newCategory: ComponentCategory) => {
    // Use replace to avoid building up navigation stack
    router.replace(`/category/${newCategory}`);
  };

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

  if (loading) {
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
          onAction={() => router.push("/(tabs)/portfolio")}
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
        />
      </View>
    </ThemedView>
  );
}
