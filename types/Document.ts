export interface Document {
  id: string;
  name: string;
  type: string; // Document type - can be enum values or display strings like "3D Rendering", "Floor Plan"
  url: string;
  fileSize?: number;
  fileType: string;
  description?: string;
  uploadedAt?: string; // ISO string format for compatibility
  category?: string; // For compatibility with uploaded Firebase data
  storagePath?: string; // Firebase Storage path
}
