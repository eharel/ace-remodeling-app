import { router } from "expo-router";

import { CategoryPage } from "@/components/CategoryPage";
import { getProjectSummariesByCategory } from "@/data/mockProjects";
import { ProjectSummary } from "@/types";

export default function BathroomsScreen() {
  const bathroomProjects = getProjectSummariesByCategory("bathroom");

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
      category="bathroom"
      title="Bathroom Projects"
      subtitle="Transform your bathroom with our expert remodeling services"
      galleryTitle="Featured Bathroom Renovations"
      gallerySubtitle="See our latest bathroom transformation projects"
      projects={bathroomProjects}
      onProjectPress={handleProjectPress}
    />
  );
}
