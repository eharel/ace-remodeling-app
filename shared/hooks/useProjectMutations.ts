import { ProjectComponent } from "@/core/types";
import { updateComponentField } from "@/services/data";
import { useCallback, useState } from "react";
import { useProjects } from "../contexts/ProjectsContext";

/**
 * Return type for the useProjectMutations hook
 */
export interface UseProjectMutationsReturn {
  /**
   * Update a specific field on a component within a project.
   * Handles the read-modify-write pattern internally.
   *
   * @param projectId - The ID of the project containing the component
   * @param componentId - The ID of the component to update
   * @param field - The field name to update (must be a key of ProjectComponent)
   * @param value - The new value for the field
   * @throws Error if the mutation fails
   */
  updateComponentField: (
    projectId: string,
    componentId: string,
    field: keyof ProjectComponent,
    value: any
  ) => Promise<void>;

  /** Whether a mutation is currently in progress */
  isUpdating: boolean;

  /** Error from the last mutation, if any */
  error: Error | null;

  /** Clear the current error state */
  clearError: () => void;
}

/**
 * Hook for mutating project and component data.
 *
 * Provides a clean API for updating component fields with built-in
 * loading states and error handling. Uses optimistic updates for
 * instant UI feedback, with automatic rollback on error.
 *
 * @returns Object containing mutation functions and state
 *
 * @example
 * function MyComponent() {
 *   const { updateComponentField, isUpdating, error } = useProjectMutations();
 *
 *   const handleToggleFeatured = async () => {
 *     try {
 *       await updateComponentField("project-123", "component-456", "isFeatured", true);
 *       // UI updates immediately via optimistic update
 *     } catch (e) {
 *       // Error is captured in error state, UI automatically rolls back
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleToggleFeatured} disabled={isUpdating}>
 *       {isUpdating ? "Updating..." : "Toggle Featured"}
 *     </button>
 *   );
 * }
 */
export function useProjectMutations(): UseProjectMutationsReturn {
  const { projects, updateProjectOptimistically, rollbackProject } =
    useProjects();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleUpdateComponentField = useCallback(
    async (
      projectId: string,
      componentId: string,
      field: keyof ProjectComponent,
      value: any
    ) => {
      // 1. Find current project for rollback
      const originalProject = projects.find((p) => p.id === projectId);
      if (!originalProject) {
        const notFoundError = new Error(
          `Project with ID "${projectId}" not found`
        );
        setError(notFoundError);
        throw notFoundError;
      }

      try {
        setIsUpdating(true);
        setError(null);

        // 2. Optimistically update UI
        updateProjectOptimistically(projectId, (project) => ({
          ...project,
          components: project.components.map((c) =>
            c.id === componentId
              ? { ...c, [field]: value, updatedAt: new Date().toISOString() }
              : c
          ),
          updatedAt: new Date().toISOString(),
        }));

        // 3. Persist to Firestore
        await updateComponentField(projectId, componentId, field, value);
      } catch (e) {
        // 4. Rollback on failure
        rollbackProject(projectId, originalProject);
        const caughtError =
          e instanceof Error ? e : new Error("Unknown error occurred");
        setError(caughtError);
        // Re-throw so caller can handle if needed
        throw caughtError;
      } finally {
        setIsUpdating(false);
      }
    },
    [projects, updateProjectOptimistically, rollbackProject]
  );

  return {
    updateComponentField: handleUpdateComponentField,
    isUpdating,
    error,
    clearError,
  };
}
