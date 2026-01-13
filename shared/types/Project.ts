import { DocumentSchema } from "./Document";
import { LogSchema } from "./Log";
import { MediaAssetSchema } from "./MediaAsset";
import { ProjectComponentSchema } from "./ProjectComponent";
import { ProjectManagerSchema } from "./ProjectManager";
import { ProjectStatusSchema } from "./Status";
import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  number: z.string(),
  name: z.string(),
  summary: z.string(),
  description: z.string(),
  scope: z.string(),
  thumbnail: z.string(),
  location: z
    .object({
      street: z.string().optional(),
      zipCode: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
    })
    .optional(),
  timeline: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
      duration: z.string().optional(),
    })
    .optional(),
  projectManagers: z.array(ProjectManagerSchema).optional(),
  testimonial: z
    .object({
      text: z.string(),
      author: z.string(),
      date: z.string(),
    })
    .optional(),
  components: z.array(ProjectComponentSchema),
  sharedDocuments: z.array(DocumentSchema).optional(),
  sharedMedia: z.array(MediaAssetSchema).optional(),
  sharedLogs: z.array(LogSchema).optional(),
  status: ProjectStatusSchema,
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;
