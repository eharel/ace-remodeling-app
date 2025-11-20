import { router } from "expo-router";
import React from "react";

import { EmptyState } from "@/shared/components";
import { useProjects } from "@/shared/contexts";
import { CategoryPage } from "./CategoryPage";
// Comment out mock data for now (keeping for fallback)
// import { getProjectSummariesByCategory } from "@/data/mockProjects";
import { CategoryKey, getCategoryConfig } from "@/core/constants";
import {
  ProjectSummary,
  getProjectCompletionDate,
  getProjectThumbnail,
} from "@/core/types";
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

  // Convert Project[] to ProjectSummary[] for the CategoryPage component
  const projectSummaries: ProjectSummary[] = projects.map((project) => ({
    id: project.id,
    projectNumber: project.number, // Use new field name
    name: project.name,
    category: project.components[0]?.category || "miscellaneous", // Use first component's category
    briefDescription: project.summary, // Use new field name
    thumbnail: getProjectThumbnail(project), // Use thumbnail with fallback
    status: project.status,
    completedAt: getProjectCompletionDate(project),
    // REMOVED: pmNames - computed field no longer stored
  }));

  const handleProjectPress = (projectSummary: ProjectSummary) => {
    try {
      if (!projectSummary?.id) {
        throw new Error("Invalid project data");
      }
      
      // Find the full project object to get component information
      const fullProject = projects.find((p) => p.id === projectSummary.id);
      
      if (fullProject) {
        // Find the component that matches the current category
        const matchingComponent = fullProject.components.find(
          (c) => c.category === category
        );
        
        if (matchingComponent) {
          // Navigate with componentId param to open directly to that component
          router.push({
            // @ts-expect-error - Expo Router generated types are overly strict
            pathname: `/project/${fullProject.id}`,
            params: { componentId: matchingComponent.id },
          });
        } else {
          // Fallback: no matching component found, just navigate to project
          router.push(`/project/${fullProject.id}`);
        }
      } else {
        // Fallback: project not found, use summary ID
        router.push(`/project/${projectSummary.id}` as any);
      }
    } catch (error) {
      // Navigation error - silently fail
    }
  };

  // Get configuration for this category
  const config = getCategoryConfig(category);

  // Simple loading indicator
  if (loading) {
    return (
      <CategoryPage
        category={category}
        title={config.title}
        subtitle="Loading projects..."
        galleryTitle={config.galleryTitle}
        gallerySubtitle="Loading projects from Firebase..."
        projects={[]}
        onProjectPress={handleProjectPress}
      />
    );
  }

  // Empty state - no projects found for this category
  if (projectSummaries.length === 0) {
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
      projects={projectSummaries}
      onProjectPress={handleProjectPress}
    />
  );
}
