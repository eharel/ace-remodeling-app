import { Project, ProjectStatus } from "@/core/types";
import { PROJECT_STATUSES } from "@/core/types/Status";
import { createProject as createProjectService } from "@/services/data";
import { useCallback, useState } from "react";
import { useProjects } from "../contexts/ProjectsContext";

/**
 * Input for creating a new project
 */
export interface CreateProjectInput {
  /** ACE project tracking number (e.g., "187", "311B") - REQUIRED */
  number: string;
  /** Project name - REQUIRED */
  name: string;
  /** Default short description - REQUIRED */
  summary: string;
  /** Default full description - REQUIRED */
  description: string;
  /** Default work scope - REQUIRED */
  scope: string;
  /** Default project image URL - REQUIRED */
  thumbnail: string;
  /** Project status - defaults to "planning" */
  status?: ProjectStatus;
  /** Location information */
  location?: {
    street?: string;
    zipCode?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  /** Project managers */
  projectManagers?: Project["projectManagers"];
  /** Project tags */
  tags?: string[];
  /** Whether project is featured */
  isFeatured?: boolean;
}

/**
 * Return type for useCreateProject hook
 */
export interface UseCreateProjectReturn {
  /**
   * Create a new project
   *
   * @param input - Project data (required fields: number, name, summary, description, scope, thumbnail)
   * @returns Promise resolving to the created Project
   * @throws Error if creation fails
   */
  createProject: (input: CreateProjectInput) => Promise<Project>;
  /** Whether a project is currently being created */
  isCreating: boolean;
  /** Error from the last creation, if any */
  error: Error | null;
  /** Clear the current error state */
  clearError: () => void;
}

/**
 * Hook for creating new projects
 *
 * Provides a clean API for project creation with built-in loading states
 * and error handling. Uses optimistic updates for instant UI feedback.
 *
 * @returns Object containing creation function and state
 *
 * @example
 * function NewProjectButton() {
 *   const { createProject, isCreating, error } = useCreateProject();
 *
 *   const handleCreate = async () => {
 *     try {
 *       const project = await createProject({
 *         number: "187",
 *         name: "Modern Kitchen Remodel",
 *         summary: "Complete kitchen renovation",
 *         description: "Full kitchen renovation with custom cabinets...",
 *         scope: "Kitchen cabinets, countertops, appliances, flooring",
 *         thumbnail: "https://...",
 *       });
 *       // Navigate to new project
 *     } catch (e) {
 *       // Error is captured in error state
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isCreating}>
 *       {isCreating ? "Creating..." : "Create Project"}
 *     </button>
 *   );
 * }
 */
export function useCreateProject(): UseCreateProjectReturn {
  const { projects, setProjects } = useProjects();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createProject = useCallback(
    async (input: CreateProjectInput): Promise<Project> => {
      try {
        setIsCreating(true);
        setError(null);

        // Prepare project data with defaults
        const projectData: Omit<Project, "id" | "createdAt" | "updatedAt"> = {
          number: input.number.trim(),
          name: input.name.trim(),
          summary: input.summary.trim(),
          description: input.description.trim(),
          scope: input.scope.trim(),
          thumbnail: input.thumbnail.trim(),
          status: input.status || PROJECT_STATUSES.PLANNING,
          location: input.location,
          projectManagers: input.projectManagers || [],
          tags: input.tags || [],
          isFeatured: input.isFeatured || false,
          components: [], // New projects start with no components
          sharedDocuments: [],
          sharedMedia: [],
          sharedLogs: [],
        };

        // Create project in Firestore
        const newProject = await createProjectService(projectData);

        // Optimistically add to local state
        setProjects([...projects, newProject]);

        return newProject;
      } catch (e) {
        const caughtError =
          e instanceof Error ? e : new Error("Failed to create project");
        setError(caughtError);
        // Re-throw so caller can handle if needed
        throw caughtError;
      } finally {
        setIsCreating(false);
      }
    },
    [projects, setProjects]
  );

  return {
    createProject,
    isCreating,
    error,
    clearError,
  };
}
