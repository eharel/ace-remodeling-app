import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/shared/themes";
import { ComponentCategory, CORE_CATEGORIES } from "@/shared/types/ComponentCategory";
import {
  EmptyState,
  LoadingState,
  PageHeader,
  ThemedText,
  ThemedView,
} from "@/shared/components";
import { useProjects, useTheme } from "@/shared/contexts";
import { 
  CATEGORY_DISPLAY_ORDER,
  getAllCategories, 
  getCategoryDisplayName, 
  getCategoryIcon 
} from "@/shared/utils";

interface CategoryItem {
  id: ComponentCategory;
  name: string;
  icon: string;
  count: number;
}

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const { projects, loading, error } = useProjects();

  // Get categories with projects, sorted by display order
  const categories = useMemo(() => {
    if (!projects) return [];

    // Normalize category names (e.g., "outdoor" -> "outdoor-living")
    // This handles legacy data where projects may use "outdoor" instead of "outdoor-living"
    const normalizeCategory = (category: string): ComponentCategory => {
      if (category === "outdoor") {
        return CORE_CATEGORIES.OUTDOOR_LIVING;
      }
      return category as ComponentCategory;
    };

    // Dynamically build category list from all available categories
    const allCategories = getAllCategories();
    const categoryData: CategoryItem[] = allCategories.map((category) => ({
      id: category,
      name: getCategoryDisplayName(category),
      icon: getCategoryIcon(category),
      count: projects.filter((p) =>
        p.components.some((c) => {
          const normalizedComponentCategory = normalizeCategory(c.category);
          return normalizedComponentCategory === category;
        })
      ).length,
    }));

    // Filter to only show categories that have projects
    const filtered = categoryData.filter((category) => category.count > 0);
    
    // Sort by display order
    return filtered.sort((a, b) => {
      const orderA = CATEGORY_DISPLAY_ORDER.indexOf(a.id);
      const orderB = CATEGORY_DISPLAY_ORDER.indexOf(b.id);
      // If not in order array, put at end
      if (orderA === -1 && orderB === -1) return 0;
      if (orderA === -1) return 1;
      if (orderB === -1) return -1;
      return orderA - orderB;
    });
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
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={theme.colors.text.inverse}
            />
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
      <PageHeader
        title="Projects"
        subtitle="Browse our various projects by category"
      />

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: DesignTokens.spacing[4],
          paddingBottom: DesignTokens.spacing[8],
        }}
      />
    </ThemedView>
  );
}

