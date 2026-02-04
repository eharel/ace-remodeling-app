import { nanoid } from "nanoid/non-secure";
import { db } from "@/shared/config";
import { Project, ProjectComponent, ProjectSchema } from "@/shared/types";
import type { ComponentCategory } from "@/shared/types/ComponentCategory";
import { collection, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";

const PROJECTS_COLLECTION = "projects";

/**
 * Recursively removes undefined values from an object.
 * Firestore doesn't accept undefined values, so we need to strip them out.
 */
function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(stripUndefined) as T;
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = stripUndefined(value);
      }
    }
    return result as T;
  }

  return obj;
}

// /**
//  * Fetch projects from Firestore.
//  * Extracted into a separate function so it can be reused for refetch.
//  */
// export const fetchProjects = useCallback(async () => {
//   try {
//     setLoading(true);
//     setError(null);

//     const projectsCollection = collection(db, PROJECTS_COLLECTION);
//     const querySnapshot = await getDocs(projectsCollection);

//     const projectsData: Project[] = [];
//     querySnapshot.forEach((doc) => {
//       const data = doc.data();
//       projectsData.push({
//         id: doc.id,
//         ...data,
//         // Default isFeatured to false if not present in Firestore
//         isFeatured: data.isFeatured ?? false,
//       } as Project);
//     });

//     setProjects(projectsData);
//   } catch (err) {
//     const errorMessage =
//       err instanceof Error ? err.message : "Failed to fetch projects";
//     setError(errorMessage);
//   } finally {
//     setLoading(false);
//   }
// }, []);

/**
 * Generate a component ID if missing using nanoid(12)
 */
function ensureComponentId(component: ProjectComponent): ProjectComponent {
  if (!component.id) {
    return {
      ...component,
      id: nanoid(12),
    };
  }
  return component;
}

export const fetchAllProjects = async (): Promise<Project[]> => {
  const projectsCollection = collection(db, PROJECTS_COLLECTION);
  const querySnapshot = await getDocs(projectsCollection);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    const projectId = doc.id;

    // Ensure all components have IDs (generate if missing)
    const components = (data.components || []).map((component: any) =>
      ensureComponentId(component)
    );

    return ProjectSchema.parse({
      id: projectId,
      ...data,
      components,
    });
  });
};

/**
 * Update a project with partial data
 * @param projectId - The project document ID
 * @param updates - Partial project data to update
 */
export const updateProject = async (
  projectId: string,
  updates: Partial<Project>
): Promise<void> => {
  // Remove fields that shouldn't be updated
  const { id, createdAt, ...safeUpdates } = updates;

  // Strip undefined values - Firestore doesn't accept them
  const cleanUpdates = stripUndefined(safeUpdates);

  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
  await updateDoc(projectRef, {
    ...cleanUpdates,
    updatedAt: new Date().toISOString(), // Always update timestamp
  });
};

/**
 * Check if a project number already exists in the database
 * @param projectNumber - The project number to check
 * @param excludeProjectId - Optional project ID to exclude (for updates)
 * @returns true if the number exists, false otherwise
 */
export const checkProjectNumberExists = async (
  projectNumber: string,
  excludeProjectId?: string
): Promise<boolean> => {
  const projectsCollection = collection(db, PROJECTS_COLLECTION);
  const querySnapshot = await getDocs(projectsCollection);

  return querySnapshot.docs.some((doc) => {
    // Exclude the current project when checking (for updates)
    if (excludeProjectId && doc.id === excludeProjectId) {
      return false;
    }
    const data = doc.data();
    return data.number === projectNumber;
  });
};

/**
 * Input for creating a new project
 */
export interface CreateProjectInput {
  /** Project number (e.g., "188") - required, user-provided */
  number: string;
  /** Project name (e.g., "Smith Residence Kitchen Remodel") */
  name: string;
  /** Primary category for the first component */
  category: ComponentCategory;
  /** Optional subcategory (e.g., "adu", "pool", "primary-bath") */
  subcategory?: string;
  /** Optional description */
  description?: string;
  /** Optional neighborhood */
  neighborhood?: string;
}

/**
 * Create a new project with a single component
 *
 * Creates a minimal project with sensible defaults for optional fields.
 * The project will have one component matching the provided category.
 *
 * @param input - The project creation input
 * @returns The created project
 */
export const createProject = async (
  input: CreateProjectInput
): Promise<Project> => {
  const now = new Date().toISOString();
  const projectId = nanoid(12);
  const componentId = nanoid(12);

  // Create the first component
  const component: ProjectComponent = {
    id: componentId,
    category: input.category,
    subcategory: input.subcategory,
    description: input.description,
    media: [],
    documents: [],
    logs: [],
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
  };

  // Create the project with required fields and sensible defaults
  const project: Project = {
    id: projectId,
    number: input.number,
    name: input.name,
    summary: "", // Can be added later
    description: input.description || "",
    scope: "", // Can be added later
    thumbnail: "", // Will be set when photos are added
    location: input.neighborhood ? { neighborhood: input.neighborhood } : undefined,
    components: [component],
    status: "completed",
    tags: [],
    isFeatured: false, // Deprecated, but keeping for schema compatibility
    createdAt: now,
    updatedAt: now,
  };

  // Strip undefined values before saving to Firestore
  const cleanProject = stripUndefined(project);

  // Save to Firestore
  const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
  await setDoc(projectRef, cleanProject);

  // Return the created project (with id included)
  return ProjectSchema.parse(cleanProject);
};
