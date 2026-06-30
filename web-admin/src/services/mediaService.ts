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

async function generateVideoThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(video.duration * 0.1, 1);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(objectUrl); resolve(null); return; }
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => { URL.revokeObjectURL(objectUrl); resolve(blob); }, "image/jpeg", 0.8);
    };

    video.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(null); };
  });
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

    let thumbnailUrl: string | undefined;
    if (mediaType === "video") {
      const thumbnailBlob = await generateVideoThumbnail(file);
      if (thumbnailBlob) {
        const thumbPath = storagePath.replace(/\/([^/]+)$/, `/thumbnails/$1`).replace(/\.[^/.]+$/, "_thumb.jpg");
        const thumbRef = ref(storage, thumbPath);
        await uploadBytes(thumbRef, thumbnailBlob, { contentType: "image/jpeg" });
        thumbnailUrl = await getDownloadURL(thumbRef);
      }
    }

    const asset: MediaAsset = {
      id,
      filename,
      url,
      storagePath,
      thumbnailUrl,
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
