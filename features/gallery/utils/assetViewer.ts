import { Router } from "expo-router";

import { Document, MediaAsset, Picture } from "@/core/types";

/**
 * Opens an asset in the appropriate viewer based on file type
 * - PDFs → Navigate to PDF viewer
 * - Images → Open image gallery modal
 *
 * @param document - The document asset to open
 * @param allDocuments - All documents in the current context
 * @param router - Expo router instance
 * @param handlers - Handlers for gallery state management
 */
export function openAsset(
  document: Document,
  allDocuments: Document[],
  router: Router,
  handlers: {
    setAssetGalleryVisible: (visible: boolean) => void;
    setSelectedAssetIndex: (index: number) => void;
  }
) {
  const { setAssetGalleryVisible, setSelectedAssetIndex } = handlers;

  // Check if this is a PDF
  if (
    document.fileType?.includes("pdf") ||
    document.filename.toLowerCase().endsWith(".pdf")
  ) {
    // Open PDF viewer
    router.push({
      pathname: "/pdf-viewer",
      params: {
        url: encodeURIComponent(document.url),
        name: document.name || document.filename,
        id: document.id,
      },
    });
    return;
  }

  // Check if this is an image
  if (
    document.fileType?.includes("image/") ||
    document.filename.match(/\.(jpg|jpeg|png|heic)$/i)
  ) {
    // Filter to only images from the provided documents
    // This should match the same filtering used to create assetGalleryImages
    const imageDocuments = allDocuments.filter(
      (d) =>
        d.fileType?.includes("image/") ||
        d.filename.match(/\.(jpg|jpeg|png|heic)$/i)
    );

    // Only proceed if we have images
    if (imageDocuments.length === 0) {
      return;
    }

    // Find the index of the clicked image in the filtered list
    const imageIndex = imageDocuments.findIndex((d) => d.id === document.id);

    // Ensure index is valid
    if (imageIndex < 0) {
      // Fallback: open with first image (index 0)
      setSelectedAssetIndex(0);
    } else {
      // Ensure index is within bounds (defensive check)
      const safeIndex = Math.max(
        0,
        Math.min(imageIndex, imageDocuments.length - 1)
      );
      setSelectedAssetIndex(safeIndex);
    }

    // Open gallery
    setAssetGalleryVisible(true);
    return;
  }

  // Fallback for unknown file types - silently ignore
}

/**
 * Converts Documents to Picture format for ImageGalleryModal
 *
 * Filters documents to only images and maps them to the format
 * expected by the image gallery modal.
 *
 * This is a PRESENTATION MODEL conversion - Document is the domain model,
 * Picture is the UI presentation model. This function bridges the gap.
 *
 * @param documents - Array of document assets
 * @returns Array of Picture objects for gallery display
 */
export function convertDocumentsToPictures(documents: Document[]): Picture[] {
  console.log("\n=== CONVERT DOCUMENTS TO PICTURES ===");
  console.log("📦 Input documents:", documents.length);

  const result = documents
    .filter(
      (d) =>
        d.fileType?.includes("image/") ||
        d.filename.match(/\.(jpg|jpeg|png|heic)$/i)
    )
    .filter((d) => d.url && d.url.trim().length > 0) // Ensure URL exists and is not empty
    .map((d) => {
      console.log(`  📄 Mapping doc:`, {
        docId: d.id,
        filename: d.filename,
        idType: typeof d.id,
        idLength: d.id?.length,
      });
      return {
        uri: d.url,
        id: d.id,
        type: d.category || d.type || "Other",
        description: d.name || d.filename || undefined,
        thumbnailUrl: d.thumbnailUrl,
      };
    })
    .filter((pic) => pic.uri && pic.uri.trim().length > 0); // Final safety check

  console.log("🖼️  Output pictures:", result.length);
  result.forEach((pic, i) => {
    console.log(
      `  [${i}] id: ${pic.id} (type: ${typeof pic.id}, length: ${
        pic.id?.length
      })`
    );
  });
  console.log("=== END CONVERT ===\n");

  return result;
}

/**
 * Converts MediaAsset to Picture format for ImageGalleryModal
 *
 * Filters media to only images and maps them to the format
 * expected by the image gallery modal.
 *
 * This is a PRESENTATION MODEL conversion - MediaAsset is the domain model,
 * Picture is the UI presentation model. This function bridges the gap.
 *
 * @param media - Array of MediaAsset objects
 * @returns Array of Picture objects for gallery display
 */
export function convertMediaToPictures(media: MediaAsset[]): Picture[] {
  return media
    .filter((m) => m.mediaType === "image" && m.url) // Only images with URLs
    .map((m) => ({
      uri: m.url, // Convert url to uri for expo-image
      id: m.id,
      type: m.stage || "other", // Convert stage to type
      description: m.caption || m.description || undefined, // Use caption or description
      thumbnailUrl: m.thumbnailUrl,
    }));
}
