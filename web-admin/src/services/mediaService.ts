import { nanoid } from "nanoid/non-secure";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import type { MediaAsset, MediaStage, MediaType } from "@shared/types/MediaAsset";

export interface WebUploadMediaOptions {
  projectId: string;
  componentCategory: string;
  subcategory?: string;
  stage: MediaStage;
  caption?: string;
  order?: number;
}

function detectMediaType(file: File): MediaType {
  return file.type.startsWith("video/") ? "video" : "image";
}

function generateFilename(original: string): string {
  const ext = original.split(".").pop() || "";
  const base = original
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_");
  return `${base}_${Date.now()}_${nanoid(6)}.${ext}`;
}

function buildStoragePath(
  file: File,
  filename: string,
  options: WebUploadMediaOptions
): string {
  const { projectId, componentCategory, subcategory, stage } = options;
  const mediaType = detectMediaType(file);
  let base = `projects/${projectId}/${componentCategory}`;
  if (subcategory) base += `/${subcategory}`;
  const typeFolder = mediaType === "image" ? "photos" : "videos";
  return `${base}/${typeFolder}/${stage}/${filename}`;
}

export async function uploadMediaFile(
  file: File,
  options: WebUploadMediaOptions
): Promise<{ success: boolean; asset?: MediaAsset; error?: string }> {
  try {
    const id = nanoid(12);
    const mediaType = detectMediaType(file);
    const filename = generateFilename(file.name);
    const storagePath = buildStoragePath(file, filename, options);

    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file, { contentType: file.type });
    const url = await getDownloadURL(storageRef);

    const asset: MediaAsset = {
      id,
      filename,
      url,
      storagePath,
      mediaType,
      stage: options.stage,
      caption: options.caption,
      order: options.order ?? 0,
      uploadedAt: new Date().toISOString(),
    };

    return { success: true, asset };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function deleteMediaFile(storagePath: string): Promise<void> {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (error) {
    if ((error as { code?: string })?.code !== "storage/object-not-found")
      throw error;
  }
}
