import { db } from "@/core/config";
import { Project, PROJECT_CATEGORIES } from "@/core/types";
import { collection, getDocs } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Constants
const PROJECTS_COLLECTION = "projects";

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

  useEffect(() => {
    const fetchProjects = async () => {
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
            // Default featured to false if not present in Firestore
            featured: data.featured ?? false,
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
    };

    fetchProjects();
  }, []);

  // Memoized filtered projects to prevent unnecessary recalculations
  const bathroomProjects = useMemo(
    () =>
      projects.filter(
        (project) => project.category === PROJECT_CATEGORIES.BATHROOM
      ),
    [projects]
  );

  const kitchenProjects = useMemo(
    () =>
      projects.filter(
        (project) => project.category === PROJECT_CATEGORIES.KITCHEN
      ),
    [projects]
  );

  /**
   * All featured projects across all categories.
   * Memoized to prevent unnecessary recalculations.
   */
  const featuredProjects = useMemo(
    () => projects.filter((project) => project.featured === true),
    [projects]
  );

  /**
   * Featured bathroom projects.
   * Memoized to prevent unnecessary recalculations.
   */
  const featuredBathroomProjects = useMemo(
    () =>
      featuredProjects.filter(
        (project) => project.category === PROJECT_CATEGORIES.BATHROOM
      ),
    [featuredProjects]
  );

  /**
   * Featured kitchen projects.
   * Memoized to prevent unnecessary recalculations.
   */
  const featuredKitchenProjects = useMemo(
    () =>
      featuredProjects.filter(
        (project) => project.category === PROJECT_CATEGORIES.KITCHEN
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
          project.category !== PROJECT_CATEGORIES.BATHROOM &&
          project.category !== PROJECT_CATEGORIES.KITCHEN
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
