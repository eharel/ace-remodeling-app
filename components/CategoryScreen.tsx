import { router } from "expo-router";
import React from "react";

import { CategoryPage } from "@/components/CategoryPage";
import { EmptyState } from "@/components/EmptyState";
import { CategoryKey, getCategoryConfig } from "@/config/categoryConfig";
import { useProjects } from "@/contexts/ProjectsContext";
// Comment out mock data for now (keeping for fallback)
// import { getProjectSummariesByCategory } from "@/data/mockProjects";
import { ProjectSummary, getProjectCompletionDate } from "@/types";

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
    projectNumber: project.projectNumber,
    name: project.name,
    category: project.category,
    briefDescription: project.briefDescription,
    thumbnail: project.thumbnail,
    status: project.status,
    completedAt: getProjectCompletionDate(project),
    // REMOVED: pmNames - computed field no longer stored
  }));

  const handleProjectPress = (project: ProjectSummary) => {
    try {
      if (!project?.id) {
        throw new Error("Invalid project data");
      }
      router.push(`/project/${project.id}`);
    } catch (error) {
      console.error("Navigation error:", error);
      // In a real app, you might show a toast or alert here
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
        icon={config.emptyIcon}
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
