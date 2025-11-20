import { Router } from "expo-router";

import { Document } from "@/core/types";

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
    // Filter to only images from all documents
    const imageDocuments = allDocuments.filter(
      (d) =>
        d.fileType?.includes("image/") ||
        d.filename.match(/\.(jpg|jpeg|png|heic)$/i)
    );

    // Find the index of the clicked image
    const imageIndex = imageDocuments.findIndex((d) => d.id === document.id);

    // Open gallery
    setSelectedAssetIndex(imageIndex >= 0 ? imageIndex : 0);
    setAssetGalleryVisible(true);
    return;
  }

  // Fallback for unknown file types
  console.warn("Unknown asset file type:", document.fileType);
  // Could show an error or try to open in PDF viewer as fallback
}

/**
 * Converts Documents to Picture format for ImageGalleryModal
 *
 * Filters documents to only images and maps them to the format
 * expected by the image gallery modal.
 *
 * @param documents - Array of document assets
 * @returns Array of objects with uri property for gallery
 */
export function convertDocumentsToPictures(
  documents: Document[]
): Array<{ uri: string; id?: string }> {
  return documents
    .filter(
      (d) =>
        d.fileType?.includes("image/") ||
        d.filename.match(/\.(jpg|jpeg|png|heic)$/i)
    )
    .map((d) => ({
      uri: d.url,
      id: d.id,
    }));
}
