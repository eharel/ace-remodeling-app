import { FileAsset, FileAssetSchema } from "./FileAsset";
import { z } from "zod";

/**
 * Document categories for better type safety
 *
 * Documents represent reference materials and supporting assets.
 * This includes PDFs (contracts, permits), images (floor plans, material samples),
 * and other file types that support the project but aren't gallery showcase photos.
 */
export const DOCUMENT_CATEGORIES = {
  RENDERING_3D: "3D Rendering",
  FLOOR_PLAN: "Floor Plan",
  MATERIALS: "Materials",
  PERMIT: "Permit",
  CONTRACT: "Contract",
  INVOICE: "Invoice",
  OTHER: "Other",
} as const;

export type DocumentCategory =
  (typeof DOCUMENT_CATEGORIES)[keyof typeof DOCUMENT_CATEGORIES];

const documentCategoryValues = Object.values(DOCUMENT_CATEGORIES);
export const DocumentCategorySchema = z.enum(
  documentCategoryValues as [DocumentCategory, ...DocumentCategory[]]
);

/**
 * @deprecated Use DOCUMENT_CATEGORIES instead
 */
export const DOCUMENT_TYPES = DOCUMENT_CATEGORIES;

/**
 * @deprecated Use DocumentCategory instead
 */
export type DocumentType = DocumentCategory;

/**
 * @deprecated Use DocumentCategorySchema instead
 */
export const DocumentTypeSchema = DocumentCategorySchema;

/**
 * Document represents project-related files (contracts, permits, plans, etc.)
 *
 * Extends FileAsset with document-specific fields for categorization and display.
 * Documents are organized by category (Floor Plan, Permit, Contract, etc.) and can
 * be PDFs, images, or other file formats.
 *
 * INHERITANCE:
 * Inherits common file fields (id, url, storagePath, etc.) from FileAsset.
 *
 * DOCUMENT CATEGORIES:
 * Categorized by purpose (Floor Plan, Permit, Contract, Invoice, etc.) to enable
 * organized document sections and filtered views.
 *
 * FILE FORMATS:
 * Documents can be any file type (PDF, PNG, JPG, etc.). The fileType field
 * stores the MIME type for proper handling.
 */

export const DocumentSchema = FileAssetSchema.extend({
  name: z.string(),
  category: DocumentCategorySchema,
  fileType: z.string(),
});

export type Document = z.infer<typeof DocumentSchema>;
