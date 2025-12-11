import { db } from "@/core/config";
import { Project, ProjectComponent } from "@/core/types";
import { PROJECT_STATUSES } from "@/core/types/Status";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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

/**
 * Generate a UUID for new items
 * Uses crypto.randomUUID() which is available in modern React Native/Expo
 */
function generateUUID(): string {
  // Use crypto.randomUUID() if available (React Native 0.70+, Expo SDK 49+)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments (shouldn't happen in modern React Native)
  // This is a simple fallback - in production you might want to use a UUID library
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new project in Firestore
 *
 * @param projectData - Project data without id, createdAt, updatedAt
 * @returns Promise resolving to the created Project with generated ID
 * @throws Error if Firestore operation fails
 */
export async function createProject(
  projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<Project> {
  try {
    const now = new Date().toISOString();
    const projectId = generateUUID();

    // Ensure required fields have defaults
    const newProject: Project = {
      ...projectData,
      id: projectId,
      status: projectData.status || PROJECT_STATUSES.PLANNING,
      components: projectData.components || [],
      createdAt: now,
      updatedAt: now,
    };

    // Validate required fields
    if (!newProject.number) {
      throw new Error("Project number is required");
    }
    if (!newProject.name) {
      throw new Error("Project name is required");
    }
    if (!newProject.summary) {
      throw new Error("Project summary is required");
    }
    if (!newProject.description) {
      throw new Error("Project description is required");
    }
    if (!newProject.scope) {
      throw new Error("Project scope is required");
    }
    if (!newProject.thumbnail) {
      throw new Error("Project thumbnail is required");
    }

    // Write new project to Firestore
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await setDoc(projectRef, newProject);

    return newProject;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create project in Firestore";
    throw new Error(`Error creating project: ${errorMessage}`);
  }
}

/**
 * Add a new component to an existing project
 *
 * This function handles the read-modify-write pattern required by Firestore's
 * nested array limitations. It reads the full project, appends the new component,
 * and writes the entire project back.
 *
 * @param projectId - The ID of the project to add the component to
 * @param componentData - Component data without id, createdAt, updatedAt
 * @returns Promise resolving to the created ProjectComponent with generated ID
 * @throws ProjectNotFoundError if project doesn't exist
 * @throws Error if Firestore operation fails
 */
export async function createComponent(
  projectId: string,
  componentData: Omit<ProjectComponent, "id" | "createdAt" | "updatedAt">
): Promise<ProjectComponent> {
  try {
    // Read the full project
    const project = await getProject(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    // Validate required fields
    if (!componentData.category) {
      throw new Error("Component category is required");
    }

    // Check for duplicate category+subcategory combination
    const existingComponent = project.components.find(
      (c) =>
        c.category === componentData.category &&
        c.subcategory === componentData.subcategory
    );
    if (existingComponent) {
      const categoryLabel = componentData.category;
      const subcategoryLabel = componentData.subcategory
        ? ` - ${componentData.subcategory}`
        : "";
      throw new Error(
        `A component with category "${categoryLabel}${subcategoryLabel}" already exists in this project`
      );
    }

    // Generate component ID and timestamps
    const now = new Date().toISOString();
    const componentId = generateUUID();

    // Create new component with defaults
    const newComponent: ProjectComponent = {
      ...componentData,
      id: componentId,
      media: componentData.media || [],
      createdAt: now,
      updatedAt: now,
    };

    // Append new component to project's components array
    const updatedComponents = [...project.components, newComponent];

    // Write back the entire project with new component
    const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(projectRef, {
      components: updatedComponents,
      updatedAt: now,
    });

    return newComponent;
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      throw error;
    }
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to create component in Firestore";
    throw new Error(`Error creating component: ${errorMessage}`);
  }
}
