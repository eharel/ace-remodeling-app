import { z } from "zod";

export const ProjectManagerSchema = z.object({
  name: z.string(),
  id: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
});

export type ProjectManager = z.infer<typeof ProjectManagerSchema>;
