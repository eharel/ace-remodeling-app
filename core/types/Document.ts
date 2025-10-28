/**
 * Document types for better type safety
 */
export const DOCUMENT_TYPES = {
  RENDERING_3D: "3D Rendering",
  FLOOR_PLAN: "Floor Plan",
  PERMIT: "Permit",
  CONTRACT: "Contract",
  INVOICE: "Invoice",
  OTHER: "Other",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

/**
 * Document interface representing project-related files
 * Supports various document types with Firebase Storage integration
 */
export interface Document {
  id: string;
  name: string;
  type: DocumentType; // Type-safe document type
  url: string;
  fileSize?: number;
  fileType: string; // MIME type (e.g., "application/pdf", "image/jpeg")
  description?: string;
  uploadedAt: string; // ISO date string format
  category?: string; // For compatibility with uploaded Firebase data
  storagePath?: string; // Firebase Storage path
}
