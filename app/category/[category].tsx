import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ProjectCardView, toProjectCardViewsByCategory } from "@/core/types";
import {
  ComponentCategory,
  CoreCategory,
  getSubcategoryLabel,
} from "@/core/types/ComponentCategory";
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
  filterCardViewsBySubcategory,
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
  const isValidCategory =
    category && allCategories.includes(category as CoreCategory);

  // Transform projects to ProjectCardView[] using centralized transformer
  // Use empty array if category is invalid to avoid errors
  const allCategoryCardViews = useMemo(
    () =>
      isValidCategory
        ? toProjectCardViewsByCategory(projects, validCategory)
        : [],
    [projects, validCategory, isValidCategory]
  );

  // Extract available subcategories for this category
  const subcategories = useMemo(() => {
    if (!projects || !isValidCategory) return [];
    return getSubcategories(projects, validCategory);
  }, [projects, validCategory, isValidCategory]);

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

  // Apply subcategory filter to card views
  const categoryCardViews = useMemo((): ProjectCardView[] => {
    if (!showSubcategoryFilter) {
      return allCategoryCardViews;
    }
    return filterCardViewsBySubcategory(
      allCategoryCardViews,
      selectedSubcategory
    );
  }, [allCategoryCardViews, selectedSubcategory, showSubcategoryFilter]);

  const categoryDisplayName = isValidCategory
    ? getCategoryDisplayName(validCategory)
    : "";

  const handleCardPress = (cardView: ProjectCardView) => {
    try {
      router.push({
        // @ts-expect-error - Expo Router generated types are overly strict
        pathname: `/project/${cardView.projectId}`,
        params: { componentId: cardView.componentId },
      });
    } catch {
      // Navigation error - silently fail
    }
  };

  const handleCategoryChange = (newCategory: ComponentCategory) => {
    // Use replace to avoid building up navigation stack
    router.replace(`/category/${newCategory}`);
  };

  // Validate category parameter - show error if invalid
  if (!isValidCategory) {
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
          backLabel="Browse"
          layoutMode="inline"
        />
        <EmptyState
          title="Category Not Found"
          message="The requested category does not exist."
          actionText="Go to Browse"
          onAction={() => {
            router.push("/(tabs)/browse");
          }}
        />
      </ThemedView>
    );
  }

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
          backLabel="Browse"
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
          backLabel="Browse"
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

  if (categoryCardViews.length === 0) {
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
          backLabel="Browse"
          layoutMode="inline"
        />
        <EmptyState
          title={`No ${categoryDisplayName} Projects`}
          message={`We don't have any ${categoryDisplayName.toLowerCase()} projects to show at the moment.`}
          actionText="Browse Other Projects"
          onAction={() => {
            router.push("/(tabs)/browse");
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
        backLabel="Browse"
        layoutMode="inline"
        subtitle={`Explore our ${categoryDisplayName.toLowerCase()} portfolio`}
      >
        <ThemedText style={styles.projectCount}>
          {categoryCardViews.length} project
          {categoryCardViews.length !== 1 ? "s" : ""}
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
        {categoryCardViews.length === 0 ? (
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
            cardViews={categoryCardViews}
            onCardPress={handleCardPress}
            enableRefresh={true}
          />
        )}
      </View>
    </ThemedView>
  );
}
