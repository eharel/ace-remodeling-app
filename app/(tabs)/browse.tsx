import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/shared/themes";
import { ComponentCategory, CORE_CATEGORIES } from "@/shared/types/ComponentCategory";
import {
  Can,
  EmptyState,
  LoadingState,
  PageHeader,
  ThemedIconButton,
  ThemedText,
  ThemedView,
} from "@/shared/components";
import { useProjects, useTheme } from "@/shared/contexts";
import {
  CATEGORY_DISPLAY_ORDER,
  getAllCategories,
  getCustomCategories,
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
  const { projects, isLoading, error } = useProjects();

  // Whether the "Other categories" section is expanded
  const [showCustom, setShowCustom] = useState(false);

  // Normalize legacy category names (e.g., "outdoor" -> "outdoor-living")
  const normalizeCategory = (category: string): ComponentCategory => {
    if (category === "outdoor") return CORE_CATEGORIES.OUTDOOR_LIVING;
    return category as ComponentCategory;
  };

  // Core categories with projects, sorted by display order
  const coreCategories = useMemo(() => {
    if (!projects) return [];

    const allCategories = getAllCategories();
    const categoryData: CategoryItem[] = allCategories.map((category) => ({
      id: category,
      name: getCategoryDisplayName(category),
      icon: getCategoryIcon(category),
      count: projects.filter((p) =>
        p.components.some(
          (c) => normalizeCategory(c.category) === category
        )
      ).length,
    }));

    return categoryData
      .filter((c) => c.count > 0)
      .sort((a, b) => {
        const orderA = CATEGORY_DISPLAY_ORDER.indexOf(a.id);
        const orderB = CATEGORY_DISPLAY_ORDER.indexOf(b.id);
        if (orderA === -1 && orderB === -1) return 0;
        if (orderA === -1) return 1;
        if (orderB === -1) return -1;
        return orderA - orderB;
      });
  }, [projects]);

  // Custom (non-core) categories with projects, sorted alphabetically
  const customCategories = useMemo(() => {
    if (!projects) return [];

    return getCustomCategories(projects)
      .map((id) => ({
        id,
        name: getCategoryDisplayName(id),
        icon: getCategoryIcon(id),
        count: projects.filter((p) =>
          p.components.some((c) => normalizeCategory(c.category) === id)
        ).length,
      }))
      .filter((item) => item.count > 0);
  }, [projects]);

  const handleCategoryPress = (category: CategoryItem) => {
    // Use params object so Expo Router handles URL encoding of special chars (e.g. "/" in category id)
    router.push({ pathname: "/category/[category]", params: { category: category.id } });
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
        expandRow: {
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
          gap: DesignTokens.spacing[2],
        },
        expandLabelRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: DesignTokens.spacing[1],
        },
        expandDivider: {
          height: 1,
          backgroundColor: theme.colors.border.primary,
        },
        expandLabel: {
          fontSize: DesignTokens.typography.fontSize.sm,
          lineHeight:
            DesignTokens.typography.fontSize.sm *
            DesignTokens.typography.lineHeight.tight,
          color: theme.colors.text.tertiary,
          fontFamily: DesignTokens.typography.fontFamily.medium,
        },
      }),
    [theme]
  );

  const handleCreateProject = () => {
    router.push("/project/create");
  };

  if (isLoading) {
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

  if (coreCategories.length === 0 && customCategories.length === 0) {
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

  // Footer: "Other categories" expand toggle + custom items (only when they exist)
  const listFooter = customCategories.length > 0 ? (
    <View>
      {/* Divider + toggle row */}
      <Pressable
        style={styles.expandRow}
        onPress={() => setShowCustom((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={showCustom ? "Hide other categories" : "Show other categories"}
      >
        <View style={styles.expandDivider} />
        <View style={styles.expandLabelRow}>
          <ThemedText style={styles.expandLabel}>
            Other categories
          </ThemedText>
          <MaterialIcons
            name={showCustom ? "expand-less" : "expand-more"}
            size={20}
            color={theme.colors.text.tertiary}
          />
        </View>
        <View style={styles.expandDivider} />
      </Pressable>

      {/* Custom category items, revealed when expanded */}
      {showCustom && customCategories.map((item) => (
        <View key={item.id} style={{ paddingHorizontal: DesignTokens.spacing[4] }}>
          {renderCategoryItem({ item })}
        </View>
      ))}
    </View>
  ) : null;

  return (
    <ThemedView style={styles.container}>
      <PageHeader
        title="Projects"
        subtitle="Browse our various projects by category"
        rightAction={
          <Can edit>
            <ThemedIconButton
              icon="add"
              onPress={handleCreateProject}
              accessibilityLabel="Create new project"
              variant="secondary"
            />
          </Can>
        }
      />

      <FlatList
        data={coreCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: DesignTokens.spacing[4],
          paddingBottom: DesignTokens.spacing[8],
        }}
        ListFooterComponent={listFooter}
      />
    </ThemedView>
  );
}

