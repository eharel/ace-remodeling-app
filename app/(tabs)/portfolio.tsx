import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ThemedText, ThemedView } from "@/components/themed";
import { useProjects, useTheme } from "@/contexts";
import { DesignTokens } from "@/themes";
import { ProjectCategory } from "@/types/Category";
import { getCategoryDisplayName, getCategoryIcon } from "@/utils/categoryUtils";

interface CategoryItem {
  id: ProjectCategory;
  name: string;
  icon: string;
  count: number;
}

export default function PortfolioScreen() {
  const { theme } = useTheme();
  const { projects, loading, error } = useProjects();

  // Get categories with projects
  const categories = useMemo(() => {
    if (!projects) return [];

    const categoryData: CategoryItem[] = [
      {
        id: "bathroom",
        name: getCategoryDisplayName("bathroom"),
        icon: getCategoryIcon("bathroom"),
        count: projects.filter((p) => p.category === "bathroom").length,
      },
      {
        id: "kitchen",
        name: getCategoryDisplayName("kitchen"),
        icon: getCategoryIcon("kitchen"),
        count: projects.filter((p) => p.category === "kitchen").length,
      },
      {
        id: "deck",
        name: getCategoryDisplayName("deck"),
        icon: getCategoryIcon("deck"),
        count: projects.filter((p) => p.category === "deck").length,
      },
      {
        id: "pool",
        name: getCategoryDisplayName("pool"),
        icon: getCategoryIcon("pool"),
        count: projects.filter((p) => p.category === "pool").length,
      },
      {
        id: "full-house",
        name: getCategoryDisplayName("full-house"),
        icon: getCategoryIcon("full-house"),
        count: projects.filter((p) => p.category === "full-house").length,
      },
    ];

    // Only show categories that have projects
    return categoryData.filter((category) => category.count > 0);
  }, [projects]);

  const handleCategoryPress = (category: CategoryItem) => {
    router.push(`/category/${category.id}`);
  };

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.categoryItem,
        { backgroundColor: theme.colors.background.card },
        pressed && styles.categoryItemPressed,
      ]}
      onPress={() => handleCategoryPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.count} projects`}
      accessibilityHint={`View all ${item.name.toLowerCase()} projects`}
    >
      <View style={styles.categoryContent}>
        <View style={styles.categoryLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.interactive.primary },
            ]}
          >
            <MaterialIcons name={item.icon as any} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.categoryInfo}>
            <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
            <ThemedText style={styles.categoryCount}>
              {item.count} project{item.count !== 1 ? "s" : ""}
            </ThemedText>
          </View>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={theme.colors.text.tertiary}
        />
      </View>
    </Pressable>
  );

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
          lineHeight:
            DesignTokens.typography.fontSize["3xl"] *
            DesignTokens.typography.lineHeight.tight,
          fontWeight: DesignTokens.typography.fontWeight.bold,
          fontFamily: DesignTokens.typography.fontFamily.bold,
          color: theme.colors.text.primary,
          marginBottom: DesignTokens.spacing[2],
        },
        subtitle: {
          fontSize: DesignTokens.typography.fontSize.lg,
          lineHeight:
            DesignTokens.typography.fontSize.lg *
            DesignTokens.typography.lineHeight.normal,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          color: theme.colors.text.secondary,
        },
        categoryItem: {
          borderRadius: DesignTokens.borderRadius.lg,
          marginBottom: DesignTokens.spacing[3],
          ...DesignTokens.shadows.sm,
        },
        categoryItemPressed: {
          transform: [{ scale: 0.98 }],
          ...DesignTokens.shadows.md,
        },
        categoryContent: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: DesignTokens.spacing[4],
        },
        categoryLeft: {
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        },
        iconContainer: {
          width: 48,
          height: 48,
          borderRadius: DesignTokens.borderRadius.lg,
          alignItems: "center",
          justifyContent: "center",
          marginRight: DesignTokens.spacing[3],
        },
        categoryInfo: {
          flex: 1,
        },
        categoryName: {
          fontSize: DesignTokens.typography.fontSize.lg,
          lineHeight:
            DesignTokens.typography.fontSize.lg *
            DesignTokens.typography.lineHeight.tight,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          color: theme.colors.text.primary,
          marginBottom: DesignTokens.spacing[1],
        },
        categoryCount: {
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
        <LoadingState />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          title="Error Loading Projects"
          message="There was an error loading the projects. Please try again."
          actionText="Retry"
          onAction={() => window.location.reload()}
        />
      </ThemedView>
    );
  }

  if (categories.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          title="No Projects Available"
          message="We don't have any projects to show at the moment."
          actionText="Check Back Later"
          onAction={() => {}}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Portfolio</ThemedText>
          <ThemedText style={styles.subtitle}>
            Browse our projects by category
          </ThemedText>
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: DesignTokens.spacing[8] }}
        />
      </View>
    </ThemedView>
  );
}
