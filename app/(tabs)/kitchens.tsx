import { router } from "expo-router";

import { CategoryPage } from "@/components/CategoryPage";
import { getProjectSummariesByCategory } from "@/data/mockProjects";
import { ProjectSummary } from "@/types";

export default function KitchensScreen() {
  const kitchenProjects = getProjectSummariesByCategory("kitchen");

  const handleProjectPress = (project: ProjectSummary) => {
    router.push(`/project/${project.id}`);
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
