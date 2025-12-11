import {
  ComponentCategory,
  ComponentSubcategory,
  ProjectComponent,
} from "@/core/types";
import { createComponent as createComponentService } from "@/services/data";
import { useCallback, useState } from "react";
import { useProjects } from "../contexts/ProjectsContext";

/**
 * Input for creating a new component
 */
export interface CreateComponentInput {
  /** Component category - REQUIRED */
  category: ComponentCategory;
  /** Optional subcategory (for outdoor, adu-addition, etc.) */
  subcategory?: ComponentSubcategory;
  /** Component-specific name */
  name?: string;
  /** Short description */
  summary?: string;
  /** Full description */
  description?: string;
  /** Work scope */
  scope?: string;
  /** Component thumbnail URL */
  thumbnail?: string;
  /** Component tags */
  tags?: string[];
  /** Whether component is featured */
  isFeatured?: boolean;
}

/**
 * Return type for useCreateComponent hook
 */
export interface UseCreateComponentReturn {
  /**
   * Create a new component in a project
   *
   * @param projectId - The ID of the project to add the component to
   * @param input - Component data (required field: category)
   * @returns Promise resolving to the created ProjectComponent
   * @throws Error if creation fails
   */
  createComponent: (
    projectId: string,
    input: CreateComponentInput
  ) => Promise<ProjectComponent>;
  /** Whether a component is currently being created */
  isCreating: boolean;
  /** Error from the last creation, if any */
  error: Error | null;
  /** Clear the current error state */
  clearError: () => void;
}

/**
 * Hook for creating new components within projects
 *
 * Provides a clean API for component creation with built-in loading states
 * and error handling. Uses optimistic updates for instant UI feedback.
 *
 * @returns Object containing creation function and state
 *
 * @example
 * function AddComponentButton({ projectId }) {
 *   const { createComponent, isCreating, error } = useCreateComponent();
 *
 *   const handleCreate = async () => {
 *     try {
 *       const component = await createComponent(projectId, {
 *         category: "bathroom",
 *         name: "Master Bathroom",
 *         summary: "Spa-inspired master bathroom renovation",
 *       });
 *       // Navigate to new component
 *     } catch (e) {
 *       // Error is captured in error state
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleCreate} disabled={isCreating}>
 *       {isCreating ? "Creating..." : "Add Component"}
 *     </button>
 *   );
 * }
 */
export function useCreateComponent(): UseCreateComponentReturn {
  const { projects, updateProjectOptimistically, rollbackProject } =
    useProjects();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createComponent = useCallback(
    async (
      projectId: string,
      input: CreateComponentInput
    ): Promise<ProjectComponent> => {
      // Find current project for rollback
      const originalProject = projects.find((p) => p.id === projectId);
      if (!originalProject) {
        const notFoundError = new Error(
          `Project with ID "${projectId}" not found`
        );
        setError(notFoundError);
        throw notFoundError;
      }

      try {
        setIsCreating(true);
        setError(null);

        // Prepare component data with defaults
        const componentData: Omit<
          ProjectComponent,
          "id" | "createdAt" | "updatedAt"
        > = {
          category: input.category,
          subcategory: input.subcategory,
          name: input.name?.trim(),
          summary: input.summary?.trim(),
          description: input.description?.trim(),
          scope: input.scope?.trim(),
          thumbnail: input.thumbnail?.trim(),
          tags: input.tags || [],
          isFeatured: input.isFeatured || false,
          media: [], // New components start with no media
          documents: [],
          logs: [],
        };

        // Optimistically update UI
        let newComponentId = "";
        updateProjectOptimistically(projectId, (project) => {
          // Generate temporary ID for optimistic update
          newComponentId = `temp-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}`;
          const tempComponent: ProjectComponent = {
            ...componentData,
            id: newComponentId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            ...project,
            components: [...project.components, tempComponent],
            updatedAt: new Date().toISOString(),
          };
        });

        // Create component in Firestore
        const newComponent = await createComponentService(
          projectId,
          componentData
        );

        // Update optimistic component with real ID
        updateProjectOptimistically(projectId, (project) => ({
          ...project,
          components: project.components.map((c) =>
            c.id === newComponentId ? newComponent : c
          ),
          updatedAt: new Date().toISOString(),
        }));

        return newComponent;
      } catch (e) {
        // Rollback on failure
        if (originalProject) {
          rollbackProject(projectId, originalProject);
        }
        const caughtError =
          e instanceof Error ? e : new Error("Failed to create component");
        setError(caughtError);
        // Re-throw so caller can handle if needed
        throw caughtError;
      } finally {
        setIsCreating(false);
      }
    },
    [projects, updateProjectOptimistically, rollbackProject]
  );

  return {
    createComponent,
    isCreating,
    error,
    clearError,
  };
}
