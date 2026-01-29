import { Router } from "expo-router";

import { Document } from "@/shared/types";
import { isDocumentImage, isDocumentPdf, filterImageDocuments } from "./assetTypeConversion";

/**
 * Asset routing utilities
 *
 * Functions for navigating to the appropriate viewer based on asset type.
 */

/**
 * Handlers for gallery state management
 */
export interface AssetGalleryHandlers {
  setAssetGalleryVisible: (visible: boolean) => void;
  setSelectedAssetIndex: (index: number) => void;
}

/**
 * Opens an asset in the appropriate viewer based on file type
 * - PDFs → Navigate to PDF viewer
 * - Images → Open image gallery modal
 *
 * @param document - The document asset to open
 * @param allDocuments - All documents in the current context (for image index calculation)
 * @param router - Expo router instance
 * @param handlers - Handlers for gallery state management
 *
 * @example
 * ```typescript
 * openAsset(
 *   clickedDocument,
 *   allDocuments,
 *   router,
 *   {
 *     setAssetGalleryVisible: setVisible,
 *     setSelectedAssetIndex: setIndex,
 *   }
 * );
 * ```
 */
export function openAsset(
  document: Document,
  allDocuments: Document[],
  router: Router,
  handlers: AssetGalleryHandlers
): void {
  const { setAssetGalleryVisible, setSelectedAssetIndex } = handlers;

  // Handle PDFs
  if (isDocumentPdf(document)) {
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

  // Handle images
  if (isDocumentImage(document)) {
    const imageDocuments = filterImageDocuments(allDocuments);

    if (imageDocuments.length === 0) {
      return;
    }

    // Find the index of the clicked image in the filtered list
    const imageIndex = imageDocuments.findIndex((d) => d.id === document.id);

    // Ensure index is valid
    if (imageIndex < 0) {
      setSelectedAssetIndex(0);
    } else {
      const safeIndex = Math.max(
        0,
        Math.min(imageIndex, imageDocuments.length - 1)
      );
      setSelectedAssetIndex(safeIndex);
    }

    setAssetGalleryVisible(true);
    return;
  }

  // Unknown file types - silently ignore
}

/**
 * Navigates to PDF viewer
 *
 * @param document - PDF document to view
 * @param router - Expo router instance
 */
export function openPdfViewer(document: Document, router: Router): void {
  router.push({
    pathname: "/pdf-viewer",
    params: {
      url: encodeURIComponent(document.url),
      name: document.name || document.filename,
      id: document.id,
    },
  });
}

/**
 * Opens image gallery at a specific index
 *
 * @param index - Index of image to display
 * @param totalImages - Total number of images (for bounds checking)
 * @param handlers - Gallery state handlers
 */
export function openImageGallery(
  index: number,
  totalImages: number,
  handlers: AssetGalleryHandlers
): void {
  const safeIndex = Math.max(0, Math.min(index, totalImages - 1));
  handlers.setSelectedAssetIndex(safeIndex);
  handlers.setAssetGalleryVisible(true);
}
