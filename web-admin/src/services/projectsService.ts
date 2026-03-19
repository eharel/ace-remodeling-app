import { nanoid } from "nanoid/non-secure";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project, ProjectSchema } from "@shared/types/Project";
import { ProjectComponent } from "@shared/types/ProjectComponent";
import type { MediaAsset } from "@shared/types/MediaAsset";
import type { Document as ProjectDocument } from "@shared/types/Document";
import type { ComponentCategory } from "@shared/types/ComponentCategory";

const PROJECTS_COLLECTION = "projects";

function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(stripUndefined) as T;
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) result[key] = stripUndefined(value);
    }
    return result as T;
  }
  return obj;
}

function ensureComponentId(component: ProjectComponent): ProjectComponent {
  return component.id ? component : { ...component, id: nanoid(12) };
}

export const fetchAllProjects = async (): Promise<Project[]> => {
  const snapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
  return snapshot.docs.map((d) => {
    const data = d.data();
    const components = (data.components || []).map((c: ProjectComponent) =>
      ensureComponentId(c)
    );
    return ProjectSchema.parse({ id: d.id, ...data, components });
  });
};

export const fetchProject = async (id: string): Promise<Project> => {
  const snap = await getDoc(doc(db, PROJECTS_COLLECTION, id));
  if (!snap.exists()) throw new Error(`Project ${id} not found`);
  const data = snap.data();
  const components = (data.components || []).map((c: ProjectComponent) =>
    ensureComponentId(c)
  );
  return ProjectSchema.parse({ id: snap.id, ...data, components });
};

export const updateProject = async (
  projectId: string,
  updates: Partial<Project>
): Promise<void> => {
  const { id, createdAt, ...safeUpdates } = updates;
  const cleanUpdates = stripUndefined(safeUpdates);
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
    ...cleanUpdates,
    updatedAt: new Date().toISOString(),
  });
};

export const addMediaToComponent = async (
  project: Project,
  componentId: string,
  newAssets: MediaAsset[]
): Promise<void> => {
  const component = project.components.find((c) => c.id === componentId);
  if (!component) throw new Error("Component not found");
  const existing = component.media || [];
  const assetsWithOrder = newAssets.map((a, i) => ({
    ...a,
    order: existing.length + i,
  }));
  const updatedComponents = project.components.map((c) =>
    c.id === componentId
      ? {
          ...c,
          media: [...existing, ...assetsWithOrder],
          updatedAt: new Date().toISOString(),
        }
      : c
  );
  await updateProject(project.id, { components: updatedComponents });
};

export const addDocumentToComponent = async (
  project: Project,
  componentId: string,
  newDoc: ProjectDocument
): Promise<void> => {
  const component = project.components.find((c) => c.id === componentId);
  if (!component) throw new Error("Component not found");
  const existing = component.documents || [];
  const updatedComponents = project.components.map((c) =>
    c.id === componentId
      ? {
          ...c,
          documents: [...existing, { ...newDoc, order: existing.length }],
          updatedAt: new Date().toISOString(),
        }
      : c
  );
  await updateProject(project.id, { components: updatedComponents });
};

export const toggleComponentFeatured = async (
  project: Project,
  componentId: string,
  isFeatured: boolean
): Promise<void> => {
  const updatedComponents = project.components.map((c) =>
    c.id === componentId
      ? { ...c, isFeatured, updatedAt: new Date().toISOString() }
      : c
  );
  await updateProject(project.id, { components: updatedComponents });
};

export const removeMediaFromComponent = async (
  project: Project,
  componentId: string,
  assetId: string
): Promise<void> => {
  const updatedComponents = project.components.map((c) =>
    c.id === componentId
      ? {
          ...c,
          media: (c.media ?? []).filter((a) => a.id !== assetId),
          updatedAt: new Date().toISOString(),
        }
      : c
  );
  await updateProject(project.id, { components: updatedComponents });
};

export const removeDocumentFromComponent = async (
  project: Project,
  componentId: string,
  docId: string
): Promise<void> => {
  const updatedComponents = project.components.map((c) =>
    c.id === componentId
      ? {
          ...c,
          documents: (c.documents ?? []).filter((d) => d.id !== docId),
          updatedAt: new Date().toISOString(),
        }
      : c
  );
  await updateProject(project.id, { components: updatedComponents });
};

export const addComponentToProject = async (
  project: Project,
  input: {
    category: ComponentCategory;
    subcategory?: string;
    description?: string;
  }
): Promise<void> => {
  const now = new Date().toISOString();
  const newComponent: ProjectComponent = {
    id: nanoid(12),
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
  await updateProject(project.id, {
    components: [...project.components, newComponent],
  });
};

export const removeComponentFromProject = async (
  project: Project,
  componentId: string
): Promise<void> => {
  await updateProject(project.id, {
    components: project.components.filter((c) => c.id !== componentId),
  });
};

export interface CreateProjectInput {
  number: string;
  name: string;
  category: ComponentCategory;
  subcategory?: string;
  description?: string;
  neighborhood?: string;
}

export const createProject = async (
  input: CreateProjectInput
): Promise<Project> => {
  const now = new Date().toISOString();
  const projectId = nanoid(12);
  const componentId = nanoid(12);

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

  const project: Project = {
    id: projectId,
    number: input.number,
    name: input.name,
    summary: "",
    description: input.description || "",
    scope: "",
    thumbnail: "",
    location: input.neighborhood
      ? { neighborhood: input.neighborhood }
      : undefined,
    components: [component],
    status: "completed",
    tags: [],
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
  };

  const clean = stripUndefined(project);
  await setDoc(doc(db, PROJECTS_COLLECTION, projectId), clean);
  return ProjectSchema.parse(clean);
};
