import { FileAsset, FileAssetSchema } from "./FileAsset";
import { z } from "zod";

/**
 * Document types for better type safety
 *
 * Documents represent reference materials and supporting assets.
 * This includes PDFs (contracts, permits), images (floor plans, material samples),
 * and other file types that support the project but aren't gallery showcase photos.
 */
export const DOCUMENT_TYPES = {
  RENDERING_3D: "3D Rendering",
  FLOOR_PLAN: "Floor Plan",
  MATERIALS: "Materials",
  PERMIT: "Permit",
  CONTRACT: "Contract",
  INVOICE: "Invoice",
  OTHER: "Other",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

const documentTypeValues = Object.values(DOCUMENT_TYPES);
export const DocumentTypeSchema = z.enum(
  documentTypeValues as [DocumentType, ...DocumentType[]]
);

/**
 * Document represents project-related files (contracts, permits, plans, etc.)
 *
 * Extends FileAsset with document-specific fields for categorization and display.
 * Documents are organized by type (Floor Plan, Permit, Contract, etc.) and can
 * be PDFs, images, or other file formats.
 *
 * INHERITANCE:
 * Inherits common file fields (id, url, storagePath, etc.) from FileAsset.
 *
 * DOCUMENT TYPES:
 * Categorized by purpose (Floor Plan, Permit, Contract, Invoice, etc.) to enable
 * organized document sections and filtered views.
 *
 * FILE FORMATS:
 * Documents can be any file type (PDF, PNG, JPG, etc.). The fileType field
 * stores the MIME type for proper handling.
 */

export const DocumentSchema = FileAssetSchema.extend({
  name: z.string(),
  type: DocumentTypeSchema,
  fileType: z.string(),
  category: z.string().optional(),
});

export type Document = z.infer<typeof DocumentSchema>;
