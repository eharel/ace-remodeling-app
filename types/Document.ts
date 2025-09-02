export interface Document {
  id: string;
  name: string;
  type: "contract" | "permit" | "invoice" | "warranty" | "manual" | "other";
  url: string;
  fileSize?: number;
  fileType: string;
  description?: string;
  uploadedAt: Date;
  category?: string;
}
