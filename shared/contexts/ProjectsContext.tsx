import {
  fetchAllProjects,
  updateProject as updateProjectService,
} from "@/services/projects";
import { MediaAsset, Project, ProjectComponent } from "@/shared/types";
import { CORE_CATEGORIES } from "@/shared/types/ComponentCategory";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Constants

/**
 * Gets all media assets from a project's components
 *
 * Collects all media from all components in a project.
 *
 * @param project - The project to get media from
 * @returns Array of MediaAsset objects from all components
 */
export function getProjectMedia(project: Project): MediaAsset[] {
  const allMedia: MediaAsset[] = [];
  project.components.forEach((component) => {
    if (component.media && component.media.length > 0) {
      allMedia.push(...component.media);
    }
  });
  return allMedia;
}

// Context state interface
interface ProjectsContextType {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  bathroomProjects: Project[];
  kitchenProjects: Project[];
  /**
   * All featured projects across all categories.
   * Used for the Showcase tab to display curated, high-quality projects.
   */
  featuredProjects: Project[];
  /**
   * Featured bathroom projects.
   * Subset of featuredProjects filtered by bathroom category.
   */
  featuredBathroomProjects: Project[];
  /**
   * Featured kitchen projects.
   * Subset of featuredProjects filtered by kitchen category.
   */
  featuredKitchenProjects: Project[];
  /**
   * Featured projects from all other categories (excluding bathroom and kitchen).
   * Includes full-home, adu-addition, outdoor, pools, commercial, new-construction.
   */
  featuredGeneralProjects: Project[];
  /**
   * Refetch projects from Firestore.
   * Manually triggers a refresh of project data.
   * Useful for pull-to-refresh functionality.
   */
  refetchProjects: () => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  updateComponent: (
    projectId: string,
    componentId: string,
    updates: Partial<ProjectComponent>
  ) => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined
);

interface ProjectsProviderProps {
  children: ReactNode;
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const projects = await fetchAllProjects();
      setProjects(projects);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to fetch projects";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refetch projects from Firestore.
   * Exposed for pull-to-refresh functionality.
   * Uses useCallback to avoid unnecessary re-creates.
   */
  const refetchProjects = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Memoized filtered projects to prevent unnecessary recalculations
  const bathroomProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.components.some((c) => c.category === CORE_CATEGORIES.BATHROOM)
      ),
    [projects]
  );

  const kitchenProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.components.some((c) => c.category === CORE_CATEGORIES.KITCHEN)
      ),
    [projects]
  );

  /**
   * Updates a project with optimistic UI updates and error handling.
   *
   * This function performs an optimistic update pattern:
   * 1. Immediately updates the local state with the new values
   * 2. Attempts to persist the changes to the backend
   * 3. Rolls back and refetches on error
   *
   * The optimistic update includes an automatically generated `updatedAt` timestamp
   * to keep the UI in sync, even if the backend response is delayed.
   *
   * @param id - The unique identifier of the project to update
   * @param updates - Partial project object containing the fields to update.
   *                 Only the provided fields will be updated; other fields remain unchanged.
   *
   * @example
   * ```tsx
   * // Update just the description
   * await updateProject('project-123', { description: 'New description' });
   *
   * // Update multiple fields
   * await updateProject('project-123', {
   *   description: 'New description',
   *   status: 'completed'
   * });
   * ```
   *
   * @throws Sets error state and refetches projects if the update fails.
   *         The error message is available via the context's error state.
   */
  const updateProject = useCallback(
    async (id: string, updates: Partial<Project>) => {
      try {
        // Optimistic update with best-guess timestamp
        setProjects((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          )
        );

        await updateProjectService(id, updates);
      } catch (error) {
        // Rollback on error
        setError(
          error instanceof Error ? error.message : "Failed to update project"
        );
        await fetchProjects();
      }
    },
    [fetchProjects]
  );

  const updateComponent = useCallback(
    async (
      projectId: string,
      componentId: string,
      updates: Partial<ProjectComponent>
    ) => {
      try {
        const now = new Date().toISOString();

        // 1. Optimistic update with best-guess timestamp
        let updatedProject: Project | undefined;
        setProjects((prev) => {
          const updated = prev.map((p) => {
            if (p.id === projectId) {
              const updatedProjectData = {
                ...p,
                components: p.components.map((c) =>
                  c.id === componentId
                    ? { ...c, ...updates, updatedAt: now }
                    : c
                ),
                updatedAt: now,
              };
              updatedProject = updatedProjectData;
              return updatedProjectData;
            }
            return p;
          });
          return updated;
        });

        // 2. Use the updated project from the state update
        if (!updatedProject) {
          throw new Error("Project not found");
        }

        // 3. Update Firestore with modified components array
        const updatedComponents = updatedProject.components.map((c) =>
          c.id === componentId ? { ...c, ...updates, updatedAt: now } : c
        );

        await updateProjectService(projectId, {
          components: updatedComponents,
        });
      } catch (error) {
        // Rollback on error
        setError(
          error instanceof Error ? error.message : "Failed to update component"
        );
        await fetchProjects();
      }
    },
    [fetchProjects]
  );

  /**
   * All featured projects across all categories.
   * A project is featured if project.isFeatured is true OR any component.isFeatured is true.
   * Memoized to prevent unnecessary recalculations.
   */
  const featuredProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.isFeatured === true ||
          project.components.some((c) => c.isFeatured === true)
      ),
    [projects]
  );

  /**
   * Featured bathroom projects.
   * Memoized to prevent unnecessary recalculations.
   */
  const featuredBathroomProjects = useMemo(
    () =>
      featuredProjects.filter((project) =>
        project.components.some((c) => c.category === CORE_CATEGORIES.BATHROOM)
      ),
    [featuredProjects]
  );

  /**
   * Featured kitchen projects.
   * Memoized to prevent unnecessary recalculations.
   */
  const featuredKitchenProjects = useMemo(
    () =>
      featuredProjects.filter((project) =>
        project.components.some((c) => c.category === CORE_CATEGORIES.KITCHEN)
      ),
    [featuredProjects]
  );

  /**
   * Featured projects from all other categories (excluding bathroom and kitchen).
   * Memoized to prevent unnecessary recalculations.
   */
  const featuredGeneralProjects = useMemo(
    () =>
      featuredProjects.filter(
        (project) =>
          !project.components.some(
            (c) => c.category === CORE_CATEGORIES.BATHROOM
          ) &&
          !project.components.some(
            (c) => c.category === CORE_CATEGORIES.KITCHEN
          )
      ),
    [featuredProjects]
  );

  const value: ProjectsContextType = useMemo(
    () => ({
      projects,
      isLoading,
      error,
      bathroomProjects,
      kitchenProjects,
      featuredProjects,
      featuredBathroomProjects,
      featuredKitchenProjects,
      featuredGeneralProjects,
      refetchProjects,
      updateProject,
      updateComponent,
    }),
    [
      projects,
      isLoading,
      error,
      bathroomProjects,
      kitchenProjects,
      featuredProjects,
      featuredBathroomProjects,
      featuredKitchenProjects,
      featuredGeneralProjects,
      refetchProjects,
      updateProject,
      updateComponent,
    ]
  );

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = (): ProjectsContextType => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
};
