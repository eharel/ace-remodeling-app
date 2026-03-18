import { Document, MediaAsset, Picture } from "@/shared/types";

/**
 * Asset type conversion utilities
 *
 * These are pure functions for converting between domain models (Document, MediaAsset)
 * and presentation models (Picture) used by the image gallery.
 */

/**
 * Checks if a document is an image based on fileType or filename
 *
 * @param document - Document to check
 * @returns True if document is an image
 */
export function isDocumentImage(document: Document): boolean {
  return !!(
    document.fileType?.includes("image/") ||
    document.filename.match(/\.(jpg|jpeg|png|heic)$/i)
  );
}

/**
 * Checks if a document is a PDF based on fileType or filename
 *
 * @param document - Document to check
 * @returns True if document is a PDF
 */
export function isDocumentPdf(document: Document): boolean {
  return !!(
    document.fileType?.includes("pdf") ||
    document.filename.toLowerCase().endsWith(".pdf")
  );
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
 *
 * @example
 * ```typescript
 * const pictures = convertDocumentsToPictures(documents);
 * // Use with ImageGalleryModal
 * <ImageGalleryModal images={pictures} />
 * ```
 */
export function convertDocumentsToPictures(documents: Document[]): Picture[] {
  return documents
    .filter(isDocumentImage)
    .filter((d) => d.url && d.url.trim().length > 0)
    .map((d) => ({
      uri: d.url,
      id: d.id,
      type: d.category || "Other",
      description: d.name || d.filename || undefined,
      thumbnailUrl: d.thumbnailUrl,
    }))
    .filter((pic) => pic.uri && pic.uri.trim().length > 0);
}

/**
 * Converts MediaAsset to Picture format for ImageGalleryModal
 *
 * Includes both images and videos. Videos are rendered by VideoPlayer in the
 * carousel; images are rendered by ZoomableImage.
 *
 * This is a PRESENTATION MODEL conversion - MediaAsset is the domain model,
 * Picture is the UI presentation model. This function bridges the gap.
 *
 * @param media - Array of MediaAsset objects
 * @returns Array of Picture objects for gallery display
 *
 * @example
 * ```typescript
 * const pictures = convertMediaToPictures(component.media);
 * // Use with ImageGalleryModal
 * <ImageGalleryModal images={pictures} />
 * ```
 */
export function convertMediaToPictures(media: MediaAsset[]): Picture[] {
  return media
    .filter((m) => (m.mediaType === "image" || m.mediaType === "video") && m.url)
    .map((m) => ({
      uri: m.url,
      id: m.id,
      type: m.stage || "other",
      description: m.caption || m.description || undefined,
      thumbnailUrl: m.thumbnailUrl,
      mediaType: m.mediaType,
    }));
}

/**
 * Filters documents to only images
 *
 * @param documents - Array of documents
 * @returns Array of image documents only
 */
export function filterImageDocuments(documents: Document[]): Document[] {
  return documents.filter(isDocumentImage);
}

/**
 * Filters documents to only PDFs
 *
 * @param documents - Array of documents
 * @returns Array of PDF documents only
 */
export function filterPdfDocuments(documents: Document[]): Document[] {
  return documents.filter(isDocumentPdf);
}
