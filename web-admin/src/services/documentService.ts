import { nanoid } from "nanoid/non-secure";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import type {
  Document as ProjectDocument,
  DocumentCategory,
} from "@shared/types/Document";

export interface WebUploadDocumentOptions {
  projectId: string;
  category: DocumentCategory;
  name: string;
  description?: string;
  order?: number;
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}

function getFileTypeLabel(mimeType: string): string {
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("image")) return "Image";
  if (mimeType.includes("word") || mimeType.includes("doc")) return "Word";
  if (mimeType.includes("excel") || mimeType.includes("sheet")) return "Excel";
  return "File";
}

function generateFilename(original: string): string {
  const ext = original.split(".").pop() || "";
  const base = original
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_");
  return `${base}_${Date.now()}_${nanoid(6)}.${ext}`;
}

function buildStoragePath(
  filename: string,
  options: WebUploadDocumentOptions
): string {
  const categorySlug = options.category
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `projects/${options.projectId}/documents/${categorySlug}/${filename}`;
}

export async function uploadDocumentFile(
  file: File,
  options: WebUploadDocumentOptions
): Promise<{ success: boolean; document?: ProjectDocument; error?: string }> {
  try {
    const id = nanoid(12);
    const filename = generateFilename(file.name);
    const contentType = file.type || getContentType(file.name);
    const storagePath = buildStoragePath(filename, options);

    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file, { contentType });
    const url = await getDownloadURL(storageRef);

    const document: ProjectDocument = {
      id,
      filename,
      url,
      storagePath,
      name: options.name,
      category: options.category,
      fileType: getFileTypeLabel(contentType),
      description: options.description,
      order: options.order ?? 0,
      uploadedAt: new Date().toISOString(),
    };

    return { success: true, document };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function deleteDocumentFile(storagePath: string): Promise<void> {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (error) {
    if ((error as { code?: string })?.code !== "storage/object-not-found")
      throw error;
  }
}
