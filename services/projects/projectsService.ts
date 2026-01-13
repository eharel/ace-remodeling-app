import { db } from "@/shared/config";
import { Project, ProjectSchema } from "@/shared/types";
import { collection, getDocs } from "firebase/firestore";

const PROJECTS_COLLECTION = "projects";

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

export const fetchAllProjects = async (): Promise<Project[]> => {
  const projectsCollection = collection(db, PROJECTS_COLLECTION);
  const querySnapshot = await getDocs(projectsCollection);

  return querySnapshot.docs.map((doc) =>
    ProjectSchema.parse({ id: doc.id, ...doc.data() })
  );
};
