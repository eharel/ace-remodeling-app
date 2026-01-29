/**
 * Gallery Feature Module
 * Exports all gallery-related components, hooks, types, constants, and utils
 */

// ============================================================================
// COMPONENTS
// ============================================================================

// ImageGallery - Full-screen modal gallery viewer
export {
  ImageGalleryModal,
  ImageGalleryCarousel,
  ImageGalleryHeader,
  ImageGalleryFooter,
  ImageErrorState,
  ImageLoadingSkeleton,
  type ImageGalleryCarouselRef,
} from "./components/ImageGallery";

// PhotoGrid - Grid view for photo collections
export { default as PhotoGrid } from "./components/PhotoGrid";

// PhotoPreview - Preview section components
export {
  PhotoPreviewSection,
  PhotoPreviewSection as PhotoGallery, // Alias for backward compatibility
  PhotoTabs,
  MorePhotosCard,
} from "./components/PhotoPreview";
export type {
  PhotoTabValue,
  PhotoCounts,
  MorePhotosCardProps,
} from "./components/PhotoPreview";

// Assets - Document/asset display components
export { AssetCategoryTabs, AssetThumbnail } from "./components/Assets";
export type {
  AssetCategoryValue,
  AssetCounts,
  AssetThumbnailProps,
} from "./components/Assets";

// ============================================================================
// HOOKS
// ============================================================================

// Core gallery hooks
export { useImageGallery } from "./hooks/useImageGallery";
export { useImageNavigation } from "./hooks/useImageNavigation";
export { usePhotoGallery } from "./hooks/usePhotoGallery";

// Image loading hooks
export { useImageLoading } from "./hooks/useImageLoading";
export { useImagePreloading } from "./hooks/useImagePreloading";
export { useLazyLoading } from "./hooks/useLazyLoading";

// Performance & memory hooks
export { useMemoryManagement } from "./hooks/useMemoryManagement";
export { usePerformanceMonitoring } from "./hooks/usePerformanceMonitoring";

// Accessibility hooks
export { useAccessibilityAnnouncements } from "./hooks/useAccessibilityAnnouncements";

// ============================================================================
// CONSTANTS
// ============================================================================

// Accessibility
export * from "./constants/accessibilityStrings";

// Gestures
export * from "./constants/gestureConstants";

// Performance (centralized constants)
export {
  LAZY_LOADING,
  PRELOADING,
  MEMORY,
  PERFORMANCE_TARGETS,
  PERFORMANCE_PENALTIES,
} from "./constants/performanceConstants";

// ============================================================================
// TYPES
// ============================================================================

export * from "./types/gallery.types";

// ============================================================================
// UTILITIES
// ============================================================================

// Index calculations (shared between lazy loading & preloading)
export {
  getIndicesInRange,
  getIndicesInRangeSet,
  getCombinedRangeSet,
  isIndexInRange,
  getDistanceFromCurrent,
  sortByDistanceFromCurrent,
} from "./utils/indexCalculations";

// Asset type conversion
export {
  isDocumentImage,
  isDocumentPdf,
  convertDocumentsToPictures,
  convertMediaToPictures,
  filterImageDocuments,
  filterPdfDocuments,
} from "./utils/assetTypeConversion";

// Asset routing
export {
  openAsset,
  openPdfViewer,
  openImageGallery,
  type AssetGalleryHandlers,
} from "./utils/assetRouter";

// Performance utilities
export * from "./utils/galleryPerformance";

// Image preloading utilities
export * from "./utils/imagePreloading";

// Lazy loading utilities
export * from "./utils/lazyLoading";

// Memory management utilities
export * from "./utils/memoryManagement";
