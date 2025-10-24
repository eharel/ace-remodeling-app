import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ThemedText, ThemedView } from "@/components/themed";
import { useProjects } from "@/contexts/ProjectsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";
import { ProjectCategory } from "@/types/Category";

const CATEGORY_NAMES: Record<ProjectCategory, string> = {
  bathroom: "Bathrooms",
  kitchen: "Kitchens",
  deck: "Decks",
  pool: "Pools",
  "full-house": "Full House",
  "general-remodeling": "General Remodeling",
  outdoor: "Outdoor",
  basement: "Basement",
  attic: "Attic",
};

export default function CategoryScreen() {
  const { theme } = useTheme();
  const { projects, loading, error } = useProjects();
  const { category } = useLocalSearchParams<{ category: string }>();

  // Validate category parameter
  const validCategory = category as ProjectCategory;
  if (!category || !Object.keys(CATEGORY_NAMES).includes(category)) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: "Category Not Found",
            headerShown: true,
            headerBackTitle: "Portfolio",
          }}
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

  const categoryDisplayName = CATEGORY_NAMES[validCategory];

  const handleProjectPress = (project: any) => {
    router.push(`/project/${project.id}`);
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
          padding: DesignTokens.spacing[4],
        },
        header: {
          marginBottom: DesignTokens.spacing[6],
        },
        title: {
          fontSize: DesignTokens.typography.fontSize["3xl"],
          fontWeight: DesignTokens.typography.fontWeight.bold,
          fontFamily: DesignTokens.typography.fontFamily.bold,
          color: theme.colors.text.primary,
          marginBottom: DesignTokens.spacing[2],
        },
        subtitle: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          color: theme.colors.text.secondary,
        },
        projectCount: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          color: theme.colors.text.tertiary,
          marginTop: DesignTokens.spacing[1],
        },
      }),
    [theme]
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: categoryDisplayName,
            headerShown: true,
            headerBackTitle: "Portfolio",
          }}
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
            title: categoryDisplayName,
            headerShown: true,
            headerBackTitle: "Portfolio",
          }}
        />
        <EmptyState
          title="Error Loading Projects"
          message="There was an error loading the projects. Please try again."
          actionText="Retry"
          onAction={() => window.location.reload()}
        />
      </ThemedView>
    );
  }

  if (categoryProjects.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: categoryDisplayName,
            headerShown: true,
            headerBackTitle: "Portfolio",
          }}
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
          title: categoryDisplayName,
          headerShown: true,
          headerBackTitle: "Portfolio",
        }}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{categoryDisplayName}</ThemedText>
          <ThemedText style={styles.subtitle}>
            Explore our {categoryDisplayName.toLowerCase()} portfolio
          </ThemedText>
          <ThemedText style={styles.projectCount}>
            {categoryProjects.length} project
            {categoryProjects.length !== 1 ? "s" : ""}
          </ThemedText>
        </View>

        <ProjectGallery
          projects={categoryProjects}
          onProjectPress={handleProjectPress}
        />
      </View>
    </ThemedView>
  );
}
