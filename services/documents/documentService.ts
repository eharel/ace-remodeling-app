/**
 * Document Service
 *
 * Handles uploading and deleting document files in Firebase Storage,
 * and creating Document records for use in the app.
 *
 * Documents are reference materials like contracts, permits, floor plans, etc.
 * Unlike media (photos/videos), documents are categorized by type rather than stage.
 *
 * @module services/documents/documentService
 */

import { nanoid } from "nanoid/non-secure";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "@/shared/config";
import {
  Document,
  DocumentCategory,
  DOCUMENT_CATEGORIES,
} from "@/shared/types";

/**
 * Options for uploading a document
 */
export interface UploadDocumentOptions {
  /** Project ID for storage path */
  projectId: string;
  /** Document category (Floor Plan, Contract, etc.) */
  category: DocumentCategory;
  /** Display name for the document */
  name: string;
  /** Optional description */
  description?: string;
  /** Order in the document list */
  order?: number;
}

/**
 * Result of a document upload operation
 */
export interface UploadDocumentResult {
  success: boolean;
  document?: Document;
  error?: string;
}

/**
 * Get MIME type for file extension
 */
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();

  const mimeTypes: Record<string, string> = {
    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // Images (for floor plans, renderings, etc.)
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
    // Other
    txt: "text/plain",
    csv: "text/csv",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}

/**
 * Get a simplified file type label from MIME type
 */
function getFileTypeLabel(mimeType: string): string {
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("image")) return "Image";
  if (mimeType.includes("word") || mimeType.includes("doc")) return "Word";
  if (mimeType.includes("excel") || mimeType.includes("sheet")) return "Excel";
  if (mimeType.includes("text")) return "Text";
  return "File";
}

/**
 * Build storage path for a document file
 *
 * Path format: projects/{projectId}/documents/{category-slug}/{filename}
 */
function buildStoragePath(
  filename: string,
  options: UploadDocumentOptions
): string {
  const { projectId, category } = options;

  // Convert category to URL-friendly slug
  const categorySlug = category
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return `projects/${projectId}/documents/${categorySlug}/${filename}`;
}

/**
 * Generate a unique filename with timestamp
 */
function generateUniqueFilename(originalFilename: string): string {
  const ext = originalFilename.split(".").pop() || "";
  const baseName = originalFilename.replace(/\.[^/.]+$/, "");
  const timestamp = Date.now();
  const uniqueId = nanoid(6);

  return `${baseName}_${timestamp}_${uniqueId}.${ext}`;
}

/**
 * Upload a document file to Firebase Storage and create a Document record
 *
 * @param fileUri - Local file URI (from document picker)
 * @param filename - Original filename
 * @param options - Upload options including project info and document type
 * @returns Promise<UploadDocumentResult>
 */
export async function uploadDocument(
  fileUri: string,
  filename: string,
  options: UploadDocumentOptions
): Promise<UploadDocumentResult> {
  try {
    // Generate unique ID and filename for this document
    const id = nanoid(12);
    const uniqueFilename = generateUniqueFilename(filename);
    const storagePath = buildStoragePath(uniqueFilename, options);
    const contentType = getContentType(filename);

    // Fetch the file as a blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Create storage reference
    const storageRef = ref(storage, storagePath);

    // Upload the file
    await uploadBytes(storageRef, blob, {
      contentType,
    });

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Create Document record
    const document: Document = {
      id,
      filename: uniqueFilename,
      url: downloadURL,
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
    const errorMessage =
      error instanceof Error ? error.message : "Upload failed";
    return { success: false, error: errorMessage };
  }
}

/**
 * Upload multiple document files
 *
 * @param files - Array of file URIs, filenames, and individual options
 * @param baseOptions - Base options applied to all files (projectId)
 * @returns Promise<UploadDocumentResult[]>
 */
export async function uploadMultipleDocuments(
  files: {
    uri: string;
    filename: string;
    name: string;
    category: DocumentCategory;
    description?: string;
  }[],
  baseOptions: { projectId: string }
): Promise<UploadDocumentResult[]> {
  const results: UploadDocumentResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadDocument(file.uri, file.filename, {
      projectId: baseOptions.projectId,
      name: file.name,
      category: file.category,
      description: file.description,
      order: i,
    });
    results.push(result);
  }

  return results;
}

/**
 * Delete a document file from Firebase Storage
 *
 * @param storagePath - The storage path of the file to delete
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function deleteDocument(
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    // If file doesn't exist, consider it a success (idempotent delete)
    if ((error as any)?.code === "storage/object-not-found") {
      return { success: true };
    }
    const errorMessage =
      error instanceof Error ? error.message : "Delete failed";
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete multiple document files from Firebase Storage
 *
 * @param storagePaths - Array of storage paths to delete
 * @returns Promise<{ success: boolean; errors: string[] }>
 */
export async function deleteMultipleDocuments(
  storagePaths: string[]
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  await Promise.all(
    storagePaths.map(async (path) => {
      const result = await deleteDocument(path);
      if (!result.success && result.error) {
        errors.push(`${path}: ${result.error}`);
      }
    })
  );

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Document category options for UI selection
 * Includes all predefined categories from DOCUMENT_CATEGORIES
 */
export const DOCUMENT_CATEGORY_OPTIONS: {
  value: DocumentCategory;
  label: string;
}[] = [
  { value: DOCUMENT_CATEGORIES.FLOOR_PLAN, label: "Floor Plan" },
  { value: DOCUMENT_CATEGORIES.RENDERING_3D, label: "3D Rendering" },
  { value: DOCUMENT_CATEGORIES.MATERIALS, label: "Materials" },
  { value: DOCUMENT_CATEGORIES.PERMIT, label: "Permit" },
  { value: DOCUMENT_CATEGORIES.CONTRACT, label: "Contract" },
  { value: DOCUMENT_CATEGORIES.INVOICE, label: "Invoice" },
  { value: DOCUMENT_CATEGORIES.OTHER, label: "Other" },
];

/**
 * @deprecated Use DOCUMENT_CATEGORY_OPTIONS instead
 */
export const DOCUMENT_TYPE_OPTIONS = DOCUMENT_CATEGORY_OPTIONS;
