import { router } from "expo-router";

import { CategoryPage } from "@/components/CategoryPage";
import { getProjectSummariesByCategory } from "@/data/mockProjects";
import { ProjectSummary } from "@/types";

export default function KitchensScreen() {
  const kitchenProjects = getProjectSummariesByCategory("kitchen");

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

  return (
    <CategoryPage
      category="kitchen"
      title="Kitchen Projects"
      subtitle="Transform your kitchen with our expert remodeling services"
      galleryTitle="Featured Kitchen Renovations"
      gallerySubtitle="See our latest kitchen transformation projects"
      projects={kitchenProjects}
      onProjectPress={handleProjectPress}
    />
  );
}
