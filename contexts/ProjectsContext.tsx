import { collection, getDocs } from "firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { db } from "../config/firebase";
import { Project } from "../types/Project";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log("🔄 Fetching projects from Firebase...");
        setLoading(true);
        setError(null);

        const projectsCollection = collection(db, "projects");
        const querySnapshot = await getDocs(projectsCollection);

        const projectsData: Project[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          projectsData.push({
            id: doc.id,
            ...data,
          } as Project);
        });

        console.log(`✅ Loaded ${projectsData.length} projects from Firebase`);
        setProjects(projectsData);
      } catch (err) {
        console.error("❌ Error fetching projects:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch projects"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Calculate filtered projects
  const bathroomProjects = projects.filter(
    (project) => project.category === "bathroom"
  );
  const kitchenProjects = projects.filter(
    (project) => project.category === "kitchen"
  );

  const value: ProjectsContextType = {
    projects,
    loading,
    error,
    bathroomProjects,
    kitchenProjects,
  };

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
