import { db } from "@/core/config";
import { Project, ProjectComponent } from "@/core/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const PROJECTS_COLLECTION = "projects";

/**
 * Custom error classes for better error handling
 */
export class ProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project with ID "${projectId}" not found`);
    this.name = "ProjectNotFoundError";
  }
}

export class ComponentNotFoundError extends Error {
  constructor(projectId: string, componentId: string) {
    super(
      `Component with ID "${componentId}" not found in project "${projectId}"`
    );
    this.name = "ComponentNotFoundError";
  }
}

/**
 * Get a project by ID from Firestore
 *
 * @param projectId - The ID of the project to retrieve
 * @returns Promise resolving to the Project or null if not found
 * @throws Error if Firestore operation fails
 */
export async function getProject(projectId: string): Promise<Project | null> {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return null;
    }

    const data = projectSnap.data();
    return {
      id: projectSnap.id,
      ...data,
    } as Project;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch project from Firestore";
    throw new Error(`Error getting project: ${errorMessage}`);
  }
}

/**
 * Update a project document in Firestore
 *
 * @param projectId - The ID of the project to update
 * @param updates - Partial Project object with fields to update
 * @throws ProjectNotFoundError if project doesn't exist
 * @throws Error if Firestore operation fails
 */
export async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<void> {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new ProjectNotFoundError(projectId);
    }

    // Update updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(projectRef, updateData);
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      throw error;
    }
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to update project in Firestore";
    throw new Error(`Error updating project: ${errorMessage}`);
  }
}

/**
 * Update a specific field on a component within a project
 *
 * This function handles the read-modify-write pattern required by Firestore's
 * nested array limitations. It reads the full project, modifies the component,
 * and writes the entire project back.
 *
 * @param projectId - The ID of the project containing the component
 * @param componentId - The ID of the component to update
 * @param field - The field name to update (must be a key of ProjectComponent)
 * @param value - The new value for the field
 * @throws ProjectNotFoundError if project doesn't exist
 * @throws ComponentNotFoundError if component doesn't exist in project
 * @throws Error if Firestore operation fails
 */
export async function updateComponentField(
  projectId: string,
  componentId: string,
  field: keyof ProjectComponent,
  value: any
): Promise<void> {
  try {
    // Read the full project
    const project = await getProject(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    // Find the component
    const componentIndex = project.components.findIndex(
      (c) => c.id === componentId
    );
    if (componentIndex === -1) {
      throw new ComponentNotFoundError(projectId, componentId);
    }

    // Create updated components array
    const updatedComponents = [...project.components];
    updatedComponents[componentIndex] = {
      ...updatedComponents[componentIndex],
      [field]: value,
      updatedAt: new Date().toISOString(),
    };

    // Write back the entire project with updated component
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      components: updatedComponents,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (
      error instanceof ProjectNotFoundError ||
      error instanceof ComponentNotFoundError
    ) {
      throw error;
    }
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to update component field in Firestore";
    throw new Error(`Error updating component field: ${errorMessage}`);
  }
}
