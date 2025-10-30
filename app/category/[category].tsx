import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ProjectCategory } from "@/core/types";
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
  const validCategory = category as ProjectCategory;
  if (!category || !getAllCategories().includes(category as ProjectCategory)) {
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

  // Filter projects by category
  const categoryProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter((project) => project.category === validCategory);
  }, [projects, validCategory]);

  const categoryDisplayName = getCategoryDisplayName(validCategory);

  const handleProjectPress = (project: any) => {
    router.push(`/project/${project.id}`);
  };

  const handleCategoryChange = (newCategory: ProjectCategory) => {
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
            // In React Native, we can't reload the page like in web
            // Instead, we could trigger a refresh of the projects data
            // For now, we'll just log the retry attempt
            console.log("Retry loading projects requested");
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
