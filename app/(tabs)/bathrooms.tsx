import { router } from "expo-router";

import { CategoryPage } from "@/components/CategoryPage";
import { getProjectSummariesByCategory } from "@/data/mockProjects";
import { ProjectSummary } from "@/types";

export default function BathroomsScreen() {
  const bathroomProjects = getProjectSummariesByCategory("bathroom");

  const handleProjectPress = (project: ProjectSummary) => {
    router.push(`/project/${project.id}`);
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
