import { DocumentSchema } from "./Document";
import { LogSchema } from "./Log";
import { MediaAssetSchema } from "./MediaAsset";
import { z } from "zod";

export const ProjectComponentSchema = z.object({
  id: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  name: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  scope: z.string().optional(),
  thumbnail: z.string().optional(),
  media: z.array(MediaAssetSchema).optional(),
  documents: z.array(DocumentSchema).optional(),
  logs: z.array(LogSchema).optional(),
  timeline: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
      duration: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProjectComponent = z.infer<typeof ProjectComponentSchema>;
