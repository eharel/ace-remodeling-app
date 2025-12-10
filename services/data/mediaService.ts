import { db } from "@/core/config";
import { MediaAsset, Project } from "@/core/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ComponentNotFoundError, ProjectNotFoundError } from "./projectService";

/**
 * Custom error class for media operations
 */
export class MediaNotFoundError extends Error {
  constructor(projectId: string, componentId: string, mediaId: string) {
    super(
      `Media with ID "${mediaId}" not found in component "${componentId}" of project "${projectId}"`
    );
    this.name = "MediaNotFoundError";
  }
}

/**
 * Add a media asset to a component's media array
 *
 * This function handles the read-modify-write pattern required by Firestore's
 * nested array limitations. It reads the full project, adds the media to the
 * component, and writes the entire project back.
 *
 * @param projectId - The ID of the project containing the component
 * @param componentId - The ID of the component to add media to
 * @param media - The MediaAsset to add
 * @throws ProjectNotFoundError if project doesn't exist
 * @throws ComponentNotFoundError if component doesn't exist in project
 * @throws Error if Firestore operation fails
 */
export async function addMediaToComponent(
  projectId: string,
  componentId: string,
  media: MediaAsset
): Promise<void> {
  try {
    // Read the full project
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new ProjectNotFoundError(projectId);
    }

    const project = {
      id: projectSnap.id,
      ...projectSnap.data(),
    } as Project;

    // Find the component
    const componentIndex = project.components.findIndex(
      (c) => c.id === componentId
    );
    if (componentIndex === -1) {
      throw new ComponentNotFoundError(projectId, componentId);
    }

    // Create updated components array with new media added
    const updatedComponents = [...project.components];
    const currentComponent = updatedComponents[componentIndex];
    updatedComponents[componentIndex] = {
      ...currentComponent,
      media: [...(currentComponent.media || []), media],
      updatedAt: new Date().toISOString(),
    };

    // Write back the entire project with updated component
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
        : "Failed to add media to component in Firestore";
    throw new Error(`Error adding media to component: ${errorMessage}`);
  }
}

/**
 * Remove a media asset from a component's media array
 *
 * This function handles the read-modify-write pattern required by Firestore's
 * nested array limitations. It reads the full project, removes the media from
 * the component, and writes the entire project back.
 *
 * @param projectId - The ID of the project containing the component
 * @param componentId - The ID of the component to remove media from
 * @param mediaId - The ID of the media asset to remove
 * @throws ProjectNotFoundError if project doesn't exist
 * @throws ComponentNotFoundError if component doesn't exist in project
 * @throws MediaNotFoundError if media doesn't exist in component
 * @throws Error if Firestore operation fails
 */
export async function removeMediaFromComponent(
  projectId: string,
  componentId: string,
  mediaId: string
): Promise<void> {
  try {
    // Read the full project
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new ProjectNotFoundError(projectId);
    }

    const project = {
      id: projectSnap.id,
      ...projectSnap.data(),
    } as Project;

    // Find the component
    const componentIndex = project.components.findIndex(
      (c) => c.id === componentId
    );
    if (componentIndex === -1) {
      throw new ComponentNotFoundError(projectId, componentId);
    }

    const currentComponent = project.components[componentIndex];
    const currentMedia = currentComponent.media || [];

    // Check if media exists
    const mediaIndex = currentMedia.findIndex((m) => m.id === mediaId);
    if (mediaIndex === -1) {
      throw new MediaNotFoundError(projectId, componentId, mediaId);
    }

    // Create updated components array with media removed
    const updatedComponents = [...project.components];
    updatedComponents[componentIndex] = {
      ...currentComponent,
      media: currentMedia.filter((m) => m.id !== mediaId),
      updatedAt: new Date().toISOString(),
    };

    // Write back the entire project with updated component
    await updateDoc(projectRef, {
      components: updatedComponents,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (
      error instanceof ProjectNotFoundError ||
      error instanceof ComponentNotFoundError ||
      error instanceof MediaNotFoundError
    ) {
      throw error;
    }
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to remove media from component in Firestore";
    throw new Error(`Error removing media from component: ${errorMessage}`);
  }
}

/**
 * Reorder media assets in a component's media array
 *
 * This function handles the read-modify-write pattern required by Firestore's
 * nested array limitations. It reads the full project, replaces the component's
 * media array with the new order, and writes the entire project back.
 *
 * @param projectId - The ID of the project containing the component
 * @param componentId - The ID of the component to reorder media for
 * @param newMediaOrder - Array of MediaAsset objects in the desired order
 * @throws ProjectNotFoundError if project doesn't exist
 * @throws ComponentNotFoundError if component doesn't exist in project
 * @throws Error if Firestore operation fails
 */
export async function reorderComponentMedia(
  projectId: string,
  componentId: string,
  newMediaOrder: MediaAsset[]
): Promise<void> {
  try {
    // Read the full project
    const projectRef = doc(db, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      throw new ProjectNotFoundError(projectId);
    }

    const project = {
      id: projectSnap.id,
      ...projectSnap.data(),
    } as Project;

    // Find the component
    const componentIndex = project.components.findIndex(
      (c) => c.id === componentId
    );
    if (componentIndex === -1) {
      throw new ComponentNotFoundError(projectId, componentId);
    }

    // Create updated components array with reordered media
    const updatedComponents = [...project.components];
    updatedComponents[componentIndex] = {
      ...updatedComponents[componentIndex],
      media: newMediaOrder,
      updatedAt: new Date().toISOString(),
    };

    // Write back the entire project with updated component
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
        : "Failed to reorder component media in Firestore";
    throw new Error(`Error reordering component media: ${errorMessage}`);
  }
}
