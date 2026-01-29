/**
 * ImageGallery Composite Component
 *
 * A full-screen modal gallery for viewing and navigating through images.
 * Composed of:
 * - ImageGalleryModal: Main container/wrapper
 * - ImageGalleryCarousel: Scrollable image viewer
 * - ImageGalleryHeader: Top header with close button and counter
 * - ImageGalleryFooter: Bottom footer with info, pagination, and thumbnails
 * - ImageErrorState: Error display for failed images
 * - ImageLoadingSkeleton: Loading placeholder
 */

// Main components
export { ImageGalleryModal } from "./ImageGalleryModal";
export { ImageGalleryCarousel } from "./ImageGalleryCarousel";
export type { ImageGalleryCarouselRef } from "./ImageGalleryCarousel";
export { ImageGalleryHeader } from "./ImageGalleryHeader";
export { ImageGalleryFooter } from "./ImageGalleryFooter";

// UI state components
export { ImageErrorState } from "./ImageErrorState";
export { ImageLoadingSkeleton } from "./ImageLoadingSkeleton";
