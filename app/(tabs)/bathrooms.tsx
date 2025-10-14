import { router } from "expo-router";

import { CategoryPage } from "@/components/CategoryPage";
import { EmptyState } from "@/components/EmptyState";
import { useProjects } from "@/contexts/ProjectsContext";
// Comment out mock data for now (keeping for fallback)
// import { getProjectSummariesByCategory } from "@/data/mockProjects";
import { ProjectSummary } from "@/types";

export default function BathroomsScreen() {
  const { bathroomProjects, loading } = useProjects();

  // Fallback to mock data if needed (commented out for now)
  // const bathroomProjects = getProjectSummariesByCategory("bathroom");

  // Convert Project[] to ProjectSummary[] for the CategoryPage component
  const bathroomProjectSummaries: ProjectSummary[] = bathroomProjects.map(
    (project) => ({
      id: project.id,
      name: project.name,
      category: project.category,
      briefDescription: project.briefDescription,
      thumbnail: project.thumbnail,
      status: project.status,
      completedAt: project.projectDates?.completionDate,
      pmNames: project.pms?.map((pm) => pm.name) || [],
    })
  );

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

  // Simple loading indicator
  if (loading) {
    return (
      <CategoryPage
        category="bathroom"
        title="Bathroom Projects"
        subtitle="Loading bathroom projects..."
        galleryTitle="Featured Bathroom Renovations"
        gallerySubtitle="Loading projects from Firebase..."
        projects={[]}
        onProjectPress={handleProjectPress}
      />
    );
  }

  // Empty state - no bathroom projects found
  if (bathroomProjectSummaries.length === 0) {
    return (
      <EmptyState
        title="No Bathroom Projects Yet"
        message="We haven't completed any bathroom renovation projects yet. Check back soon for our latest work!"
        icon="bathtub"
        testID="bathroom-empty-state"
      />
    );
  }

  return (
    <CategoryPage
      category="bathroom"
      title="Bathroom Projects"
      subtitle="Transform your bathroom with our expert remodeling services"
      galleryTitle="Featured Bathroom Renovations"
      gallerySubtitle="See our latest bathroom transformation projects"
      projects={bathroomProjectSummaries}
      onProjectPress={handleProjectPress}
    />
  );
}
