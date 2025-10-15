export interface Picture {
  id: string;
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  type: "before" | "after" | "progress" | "detail" | "rendering" | "other";
  category?: string; // For compatibility with uploaded Firebase data
  description?: string;
  order: number;
  createdAt?: string; // ISO string format for compatibility
  filename?: string; // Original filename from upload
  storagePath?: string; // Firebase Storage path
  size?: number; // File size in bytes
}

export interface PicturePair {
  before: Picture;
  after: Picture;
  description?: string;
}
