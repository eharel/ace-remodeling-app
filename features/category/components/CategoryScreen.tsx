import { router } from "expo-router";
import React, { useMemo } from "react";

import { EmptyState, LoadingState } from "@/shared/components";
import { useProjects } from "@/shared/contexts";
import { CategoryPage } from "./CategoryPage";
// Comment out mock data for now (keeping for fallback)
// import { getProjectSummariesByCategory } from "@/data/mockProjects";
import { CategoryKey, getCategoryConfig } from "@/core/constants";
import { ProjectCardView, toProjectCardViewsByCategory } from "@/core/types";
import { MaterialIcons } from "@expo/vector-icons";

interface CategoryScreenProps {
  category: CategoryKey;
}

export function CategoryScreen({ category }: CategoryScreenProps) {
  const { bathroomProjects, kitchenProjects, loading } = useProjects();

  // Get the appropriate projects based on category
  const projects = category === "bathroom" ? bathroomProjects : kitchenProjects;

  // Fallback to mock data if needed (commented out for now)
  // const projects = getProjectSummariesByCategory(category);

  // Transform projects to ProjectCardView[] using centralized transformer
  const cardViews = useMemo(
    () => toProjectCardViewsByCategory(projects, category),
    [projects, category]
  );

  const handleCardPress = (cardView: ProjectCardView) => {
    try {
      router.push({
        // @ts-expect-error - Expo Router generated types are overly strict
        pathname: `/project/${cardView.projectId}`,
        params: { componentId: cardView.componentId },
      });
    } catch (error) {
      // Navigation error - silently fail
    }
  };

  // Get configuration for this category
  const config = getCategoryConfig(category);

  // Show loading state while projects are being fetched
  if (loading) {
    return <LoadingState message="Loading projects..." />;
  }

  // Empty state - no projects found for this category
  if (cardViews.length === 0) {
    return (
      <EmptyState
        title={config.emptyTitle}
        message={config.emptyMessage}
        icon={config.emptyIcon as keyof typeof MaterialIcons.glyphMap}
        testID={`${category}-empty-state`}
      />
    );
  }

  return (
    <CategoryPage
      category={category}
      title={config.title}
      subtitle={config.subtitle}
      galleryTitle={config.galleryTitle}
      gallerySubtitle={config.gallerySubtitle}
      cardViews={cardViews}
      onCardPress={handleCardPress}
    />
  );
}
