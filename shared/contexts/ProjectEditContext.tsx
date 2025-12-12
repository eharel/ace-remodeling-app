import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Project } from "@/core/types";

/**
 * Draft changes to a project during edit mode.
 * Only includes fields that have been modified.
 */
export interface ProjectDraft {
  [key: string]: unknown;
}

/**
 * Project Edit Context Type
 * Manages edit mode state and draft changes for project editing.
 */
interface ProjectEditContextType {
  /**
   * Whether the project is currently in edit mode.
   */
  isEditing: boolean;

  /**
   * The original project data (read-only snapshot).
   */
  originalProject: Project | null;

  /**
   * Draft changes made during edit mode.
   * Only contains fields that have been modified.
   */
  editedProject: Partial<Project> | null;

  /**
   * Whether there are unsaved changes.
   * True if editedProject has any changes compared to originalProject.
   */
  hasUnsavedChanges: boolean;

  /**
   * Enter edit mode and initialize with project data.
   * @param project - The project to edit
   */
  enterEditMode: (project: Project) => void;

  /**
   * Exit edit mode and discard all changes.
   */
  exitEditMode: () => void;

  /**
   * Update a field in the draft project.
   * @param field - The field name to update
   * @param value - The new value
   */
  updateField: <K extends keyof Project>(field: K, value: Project[K]) => void;

  /**
   * Save changes and exit edit mode.
   * Currently logs to console (Phase 1 - no Firebase yet).
   */
  saveChanges: () => Promise<void>;

  /**
   * Discard all changes and exit edit mode.
   */
  discardChanges: () => void;
}

/**
 * Default context value to prevent errors during hot reload.
 */
const defaultContextValue: ProjectEditContextType = {
  isEditing: false,
  originalProject: null,
  editedProject: null,
  hasUnsavedChanges: false,
  enterEditMode: () => {},
  exitEditMode: () => {},
  updateField: () => {},
  saveChanges: async () => {},
  discardChanges: () => {},
};

/**
 * Project Edit Context
 */
const ProjectEditContext =
  createContext<ProjectEditContextType>(defaultContextValue);

/**
 * Project Edit Provider Props
 */
interface ProjectEditProviderProps {
  children: React.ReactNode;
  /**
   * Initial project data to load into the context.
   * Used to initialize the provider with current project state.
   */
  initialProject: Project | null;
}

/**
 * Project Edit Provider Component
 * Manages edit mode state and draft changes for a project.
 */
export function ProjectEditProvider({
  children,
  initialProject,
}: ProjectEditProviderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [originalProject, setOriginalProject] = useState<Project | null>(
    initialProject
  );
  const [editedProject, setEditedProject] = useState<Partial<Project> | null>(
    null
  );

  /**
   * Update original project when initialProject changes (e.g., navigation to different project).
   * Exit edit mode if project ID changes while editing.
   * If same project but data refreshes, update originalProject but keep edit mode.
   */
  useEffect(() => {
    if (initialProject) {
      // If project ID changes, exit edit mode
      if (originalProject && originalProject.id !== initialProject.id) {
        setIsEditing(false);
        setEditedProject(null);
      }
      // Always update originalProject with latest data (even if same ID)
      setOriginalProject(initialProject);
    }
  }, [initialProject]);

  /**
   * Calculate whether there are unsaved changes.
   * Compares editedProject to originalProject.
   */
  const hasUnsavedChanges = useMemo(() => {
    if (!isEditing || !editedProject || !originalProject) {
      return false;
    }

    // Check if any field in editedProject differs from originalProject
    return Object.keys(editedProject).some((key) => {
      const fieldKey = key as keyof Project;
      return editedProject[fieldKey] !== originalProject[fieldKey];
    });
  }, [isEditing, editedProject, originalProject]);

  /**
   * Enter edit mode and initialize draft with current project data.
   */
  const enterEditMode = useCallback((project: Project) => {
    setOriginalProject(project);
    setEditedProject({}); // Start with empty draft - fields will be added as they're edited
    setIsEditing(true);
  }, []);

  /**
   * Exit edit mode and discard all changes.
   */
  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    setEditedProject(null);
    // Keep originalProject unchanged - it represents the saved state
  }, []);

  /**
   * Update a field in the draft project.
   */
  const updateField = useCallback(
    <K extends keyof Project>(field: K, value: Project[K]) => {
      if (!isEditing) {
        console.warn(
          "Attempted to update field while not in edit mode. Call enterEditMode() first."
        );
        return;
      }

      setEditedProject((current) => {
        return {
          ...current,
          [field]: value,
        };
      });
    },
    [isEditing]
  );

  /**
   * Save changes and exit edit mode.
   * Phase 1: Just logs to console. Firebase save will be added in Phase 2.
   */
  const saveChanges = useCallback(async () => {
    if (!isEditing || !editedProject || !originalProject) {
      console.warn("Cannot save: not in edit mode or missing project data");
      return;
    }

    // Phase 1: Just log the changes
    console.log("Saving project changes:", {
      projectId: originalProject.id,
      changes: editedProject,
    });

    // TODO: Phase 2 - Save to Firebase
    // await updateProject(originalProject.id, editedProject);

    // Exit edit mode after save
    exitEditMode();
  }, [isEditing, editedProject, originalProject, exitEditMode]);

  /**
   * Discard all changes and exit edit mode.
   */
  const discardChanges = useCallback(() => {
    exitEditMode();
  }, [exitEditMode]);

  /**
   * Context value memoized to prevent unnecessary re-renders.
   */
  const contextValue = useMemo(
    () => ({
      isEditing,
      originalProject,
      editedProject,
      hasUnsavedChanges,
      enterEditMode,
      exitEditMode,
      updateField,
      saveChanges,
      discardChanges,
    }),
    [
      isEditing,
      originalProject,
      editedProject,
      hasUnsavedChanges,
      enterEditMode,
      exitEditMode,
      updateField,
      saveChanges,
      discardChanges,
    ]
  );

  return (
    <ProjectEditContext.Provider value={contextValue}>
      {children}
    </ProjectEditContext.Provider>
  );
}

/**
 * Custom hook to use Project Edit Context.
 * @returns ProjectEditContextType
 */
export function useProjectEdit(): ProjectEditContextType {
  const context = useContext(ProjectEditContext);
  // Context will always have a value (either from provider or default)
  // This check is kept for extra safety but should never trigger
  if (!context) {
    return defaultContextValue;
  }
  return context;
}
