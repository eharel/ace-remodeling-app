import { db } from "@/core/config";
import { Picture, Project, PROJECT_CATEGORIES } from "@/core/types";
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

/**
 * Aggregates photos for a project, with special handling for Full Home projects.
 * 
 * For Full Home projects, this function finds all related projects sharing the same
 * projectNumber and combines their pictures with the Full Home project's own pictures.
 * For all other projects, it returns the project's pictures as-is.
 * 
 * @param project - The project to get aggregated photos for
 * @param allProjects - Array of all projects to search for related projects
 * @returns Array of Picture objects with duplicates removed based on URL
 * 
 * @example
 * ```ts
 * const aggregatedPhotos = getAggregatedProjectPhotos(fullHomeProject, allProjects);
 * ```
 * 
 * Edge cases handled:
 * - Missing or empty pictures array: returns empty array
 * - Missing or empty projectNumber: returns project's own pictures (graceful degradation)
 * - No matching projects: returns only the Full Home project's pictures
 * - Duplicate URLs: first occurrence is kept, preserving type categorization
 * - Pictures without URLs: safely skipped during deduplication
 * - Large photo sets (30+ photos): uses efficient Set-based deduplication (O(n))
 */
export function getAggregatedProjectPhotos(
  project: Project,
  allProjects: Project[]
): Picture[] {
  // Handle missing or empty pictures array
  if (!project.pictures || project.pictures.length === 0) {
    return [];
  }

  // For non-Full Home projects, return pictures as-is
  if (project.category !== PROJECT_CATEGORIES.FULL_HOME) {
    return project.pictures;
  }

  // Handle missing or empty projectNumber - graceful degradation
  if (!project.projectNumber || project.projectNumber.trim() === "") {
    console.warn(
      `Full Home project "${project.name}" (${project.id}) is missing projectNumber. Returning only its own pictures.`
    );
    return project.pictures;
  }

  // For Full Home projects, aggregate photos from related projects
  // Find all projects with matching projectNumber (excluding the current project)
  const relatedProjects = allProjects.filter(
    (p) =>
      p.projectNumber &&
      p.projectNumber === project.projectNumber &&
      p.id !== project.id &&
      p.pictures &&
      p.pictures.length > 0
  );

  // Collect all pictures from related projects
  const relatedPictures: Picture[] = [];
  relatedProjects.forEach((relatedProject) => {
    if (relatedProject.pictures) {
      relatedPictures.push(...relatedProject.pictures);
    }
  });

  // Combine Full Home project's pictures with related project pictures
  const allPictures = [...project.pictures, ...relatedPictures];

  // Remove duplicates based on URL, preserving the first occurrence
  // This maintains the type categorization from the original order
  const seenUrls = new Set<string>();
  const uniquePictures: Picture[] = [];

  for (const picture of allPictures) {
    if (picture.url && !seenUrls.has(picture.url)) {
      seenUrls.add(picture.url);
      uniquePictures.push(picture);
    }
  }

  return uniquePictures;
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
