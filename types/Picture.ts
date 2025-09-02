export interface Picture {
  id: string;
  url: string;
  thumbnailUrl?: string;
  altText: string;
  type: "before" | "after" | "progress" | "detail";
  description?: string;
  order: number;
  createdAt: Date;
}

export interface PicturePair {
  before: Picture;
  after: Picture;
  description?: string;
}
