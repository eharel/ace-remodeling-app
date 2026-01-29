import { useProjects } from "@/shared/contexts/ProjectsContext";
import { useMemo } from "react";

export function useProject(id: string | undefined) {
  const { projects, isLoading, error } = useProjects();
  const project = useMemo(() => {
    return projects.find((project) => project.id === id) || null;
  }, [projects, id]);

  return { project, isLoading, error };
}
