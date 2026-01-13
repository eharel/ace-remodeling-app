import { z } from "zod";
export const FileAssetSchema = z.object({
  id: z.string(),
  filename: z.string(),
  url: z.string().url(),
  storagePath: z.string(),
  thumbnailUrl: z.string().optional(),
  size: z.number().optional(),
  description: z.string().optional(),
  order: z.number().nonnegative(),
  uploadedAt: z.string().datetime(),
});

/**
 * Base type for all file assets stored in Firebase Storage.
 *
 * Serves as foundation for MediaAsset, Document, and other file types.
 * Do not use directly - always use specific extending types.
 */
export type FileAsset = z.infer<typeof FileAssetSchema>;
