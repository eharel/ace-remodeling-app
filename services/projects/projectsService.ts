import { nanoid } from "nanoid";
import { db } from "@/shared/config";
import { Project, ProjectComponent, ProjectSchema } from "@/shared/types";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

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
