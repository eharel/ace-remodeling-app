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

  const value: ProjectsContextType = useMemo(
    () => ({
      projects,
      loading,
      error,
      bathroomProjects,
      kitchenProjects,
    }),
    [projects, loading, error, bathroomProjects, kitchenProjects]
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
