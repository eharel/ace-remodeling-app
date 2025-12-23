import { db } from "@/shared/config";
import { Project, MediaAsset } from "@/shared/types";
import { CORE_CATEGORIES } from "@/shared/types/ComponentCategory";
import { collection, getDocs } from "firebase/firestore";
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
const PROJECTS_COLLECTION = "projects";

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
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch projects from Firestore.
   * Extracted into a separate function so it can be reused for refetch.
   */
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const projectsCollection = collection(db, PROJECTS_COLLECTION);
      const querySnapshot = await getDocs(projectsCollection);

      const projectsData: Project[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projectsData.push({
          id: doc.id,
          ...data,
          // Default isFeatured to false if not present in Firestore
          isFeatured: data.isFeatured ?? false,
        } as Project);
      });

      setProjects(projectsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch projects";
      setError(errorMessage);
    } finally {
      setLoading(false);
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
        project.components.some(
          (c) => c.category === CORE_CATEGORIES.BATHROOM
        )
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
        project.components.some(
          (c) => c.category === CORE_CATEGORIES.BATHROOM
        )
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
      loading,
      error,
      bathroomProjects,
      kitchenProjects,
      featuredProjects,
      featuredBathroomProjects,
      featuredKitchenProjects,
      featuredGeneralProjects,
      refetchProjects,
    }),
    [
      projects,
      loading,
      error,
      bathroomProjects,
      kitchenProjects,
      featuredProjects,
      featuredBathroomProjects,
      featuredKitchenProjects,
      featuredGeneralProjects,
      refetchProjects,
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
