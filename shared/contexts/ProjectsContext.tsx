import { nanoid } from "nanoid/non-secure";
import {
  createProject as createProjectService,
  CreateProjectInput,
  fetchAllProjects,
  updateProject as updateProjectService,
} from "@/services/projects";
import { deleteMultipleMedia } from "@/services/media/mediaService";
import { deleteMultipleDocuments } from "@/services/documents/documentService";
import { Document, MediaAsset, Project, ProjectComponent } from "@/shared/types";
import { CORE_CATEGORIES, CoreCategory } from "@/shared/types/ComponentCategory";
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
  /**
   * Add a new component to an existing project.
   * Returns the created component.
   */
  addComponent: (
    projectId: string,
    input: { category: string; subcategory?: string; name?: string }
  ) => Promise<ProjectComponent>;
  /**
   * Delete a component from a project.
   * Cannot delete the last component.
   */
  deleteComponent: (projectId: string, componentId: string) => Promise<void>;
  /**
   * Create a new project with a single component.
   * Returns the created project.
   */
  createProject: (input: CreateProjectInput) => Promise<Project>;
  /**
   * Add a document to a component.
   * Returns the updated component.
   */
  addDocument: (
    projectId: string,
    componentId: string,
    document: Document
  ) => Promise<void>;
  /**
   * Delete a document from a component.
   * Also deletes the file from Firebase Storage.
   */
  deleteDocument: (
    projectId: string,
    componentId: string,
    documentId: string
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
        // Re-throw so callers know the update failed
        throw error;
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
        // Re-throw so callers know the update failed
        throw error;
      }
    },
    [fetchProjects]
  );

  /**
   * Creates a new project with a single component.
   *
   * @param input - The project creation input (number, name, category, etc.)
   * @returns The created project
   */
  const createProject = useCallback(
    async (input: CreateProjectInput): Promise<Project> => {
      try {
        // Create in Firestore first
        const newProject = await createProjectService(input);

        // Add to local state (optimistic-ish, but after success)
        setProjects((prev) => [...prev, newProject]);

        return newProject;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to create project";
        setError(errorMsg);
        throw error;
      }
    },
    []
  );

  /**
   * Adds a new component to an existing project.
   *
   * @param projectId - The project to add the component to
   * @param input - The component details (category, subcategory, name)
   *               Category can be a CoreCategory or a custom string (e.g., "home-theater")
   * @returns The created component
   */
  const addComponent = useCallback(
    async (
      projectId: string,
      input: { category: string; subcategory?: string; name?: string }
    ): Promise<ProjectComponent> => {
      const now = new Date().toISOString();
      const componentId = nanoid(12);

      const newComponent: ProjectComponent = {
        id: componentId,
        category: input.category,
        subcategory: input.subcategory,
        name: input.name,
        description: "",
        media: [],
        documents: [],
        logs: [],
        isFeatured: false,
        createdAt: now,
        updatedAt: now,
      };

      try {
        // Optimistic update
        let updatedProject: Project | undefined;
        setProjects((prev) =>
          prev.map((p) => {
            if (p.id === projectId) {
              updatedProject = {
                ...p,
                components: [...p.components, newComponent],
                updatedAt: now,
              };
              return updatedProject;
            }
            return p;
          })
        );

        if (!updatedProject) {
          throw new Error("Project not found");
        }

        // Update Firestore
        await updateProjectService(projectId, {
          components: updatedProject.components,
        });

        return newComponent;
      } catch (error) {
        // Rollback on error
        setError(
          error instanceof Error ? error.message : "Failed to add component"
        );
        await fetchProjects();
        throw error;
      }
    },
    [fetchProjects]
  );

  /**
   * Deletes a component from a project.
   * Cannot delete the last component - projects must have at least one.
   * Also deletes all associated media files from Firebase Storage.
   *
   * @param projectId - The project ID
   * @param componentId - The component ID to delete
   */
  const deleteComponent = useCallback(
    async (projectId: string, componentId: string): Promise<void> => {
      const now = new Date().toISOString();

      try {
        // Find the project and validate
        const project = projects.find((p) => p.id === projectId);
        if (!project) {
          throw new Error("Project not found");
        }

        if (project.components.length <= 1) {
          throw new Error("Cannot delete the last component");
        }

        // Find the component to get its media for deletion
        const componentToDelete = project.components.find(
          (c) => c.id === componentId
        );

        const filteredComponents = project.components.filter(
          (c) => c.id !== componentId
        );

        // Optimistic update
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? { ...p, components: filteredComponents, updatedAt: now }
              : p
          )
        );

        // Update Firestore first (critical operation)
        await updateProjectService(projectId, {
          components: filteredComponents,
        });

        // Delete associated media files from Storage (non-critical, fire-and-forget)
        // We do this after Firestore update succeeds to avoid orphaned DB records
        if (componentToDelete?.media && componentToDelete.media.length > 0) {
          const storagePaths = componentToDelete.media
            .map((m) => m.storagePath)
            .filter((path): path is string => !!path);

          if (storagePaths.length > 0) {
            // Fire and forget - don't block on storage deletion
            // Log errors but don't fail the component deletion
            deleteMultipleMedia(storagePaths).then((result) => {
              if (!result.success) {
                console.warn(
                  "Some media files could not be deleted:",
                  result.errors
                );
              }
            });
          }
        }
      } catch (error) {
        // Rollback on error
        setError(
          error instanceof Error ? error.message : "Failed to delete component"
        );
        await fetchProjects();
        throw error;
      }
    },
    [projects, fetchProjects]
  );

  /**
   * Adds a document to a component.
   *
   * @param projectId - The project ID
   * @param componentId - The component ID to add the document to
   * @param document - The document to add (already uploaded to Storage)
   */
  const addDocument = useCallback(
    async (
      projectId: string,
      componentId: string,
      document: Document
    ): Promise<void> => {
      const now = new Date().toISOString();

      try {
        // Find the project and component
        const project = projects.find((p) => p.id === projectId);
        if (!project) {
          throw new Error("Project not found");
        }

        const component = project.components.find((c) => c.id === componentId);
        if (!component) {
          throw new Error("Component not found");
        }

        // Add document to component's documents array
        const updatedDocuments = [...(component.documents || []), document];

        // Optimistic update
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  components: p.components.map((c) =>
                    c.id === componentId
                      ? { ...c, documents: updatedDocuments, updatedAt: now }
                      : c
                  ),
                  updatedAt: now,
                }
              : p
          )
        );

        // Update Firestore
        const updatedComponents = project.components.map((c) =>
          c.id === componentId
            ? { ...c, documents: updatedDocuments, updatedAt: now }
            : c
        );

        await updateProjectService(projectId, {
          components: updatedComponents,
        });
      } catch (error) {
        // Rollback on error
        setError(
          error instanceof Error ? error.message : "Failed to add document"
        );
        await fetchProjects();
        throw error;
      }
    },
    [projects, fetchProjects]
  );

  /**
   * Deletes a document from a component.
   * Also deletes the file from Firebase Storage.
   *
   * @param projectId - The project ID
   * @param componentId - The component ID
   * @param documentId - The document ID to delete
   */
  const deleteDocument = useCallback(
    async (
      projectId: string,
      componentId: string,
      documentId: string
    ): Promise<void> => {
      const now = new Date().toISOString();

      try {
        // Find the project and component
        const project = projects.find((p) => p.id === projectId);
        if (!project) {
          throw new Error("Project not found");
        }

        const component = project.components.find((c) => c.id === componentId);
        if (!component) {
          throw new Error("Component not found");
        }

        // Find the document to get its storage path
        const documentToDelete = component.documents?.find(
          (d) => d.id === documentId
        );

        // Filter out the document
        const updatedDocuments = (component.documents || []).filter(
          (d) => d.id !== documentId
        );

        // Optimistic update
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  components: p.components.map((c) =>
                    c.id === componentId
                      ? { ...c, documents: updatedDocuments, updatedAt: now }
                      : c
                  ),
                  updatedAt: now,
                }
              : p
          )
        );

        // Update Firestore first (critical operation)
        const updatedComponents = project.components.map((c) =>
          c.id === componentId
            ? { ...c, documents: updatedDocuments, updatedAt: now }
            : c
        );

        await updateProjectService(projectId, {
          components: updatedComponents,
        });

        // Delete file from Storage (non-critical, fire-and-forget)
        if (documentToDelete?.storagePath) {
          deleteMultipleDocuments([documentToDelete.storagePath]).then(
            (result) => {
              if (!result.success) {
                console.warn(
                  "Document file could not be deleted:",
                  result.errors
                );
              }
            }
          );
        }
      } catch (error) {
        // Rollback on error
        setError(
          error instanceof Error ? error.message : "Failed to delete document"
        );
        await fetchProjects();
        throw error;
      }
    },
    [projects, fetchProjects]
  );

  /**
   * All projects that have at least one featured component.
   * Featuring is now per-component, not per-project.
   * Memoized to prevent unnecessary recalculations.
   */
  const featuredProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.components.some((c) => c.isFeatured === true)
      ),
    [projects]
  );

  /**
   * Projects with featured bathroom components.
   * Only includes projects where the bathroom component itself is featured.
   * Memoized to prevent unnecessary recalculations.
   */
  const featuredBathroomProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.components.some(
          (c) => c.category === CORE_CATEGORIES.BATHROOM && c.isFeatured === true
        )
      ),
    [projects]
  );

  /**
   * Projects with featured kitchen components.
   * Only includes projects where the kitchen component itself is featured.
   * Memoized to prevent unnecessary recalculations.
   */
  const featuredKitchenProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.components.some(
          (c) => c.category === CORE_CATEGORIES.KITCHEN && c.isFeatured === true
        )
      ),
    [projects]
  );

  /**
   * Projects with featured components from other categories (excluding bathroom and kitchen).
   * Only includes projects where a non-bathroom/kitchen component is featured.
   * Memoized to prevent unnecessary recalculations.
   */
  const featuredGeneralProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.components.some(
          (c) =>
            c.isFeatured === true &&
            c.category !== CORE_CATEGORIES.BATHROOM &&
            c.category !== CORE_CATEGORIES.KITCHEN
        )
      ),
    [projects]
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
      addComponent,
      deleteComponent,
      createProject,
      addDocument,
      deleteDocument,
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
      addComponent,
      deleteComponent,
      createProject,
      addDocument,
      deleteDocument,
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
