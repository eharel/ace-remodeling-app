/**
 * Gallery Feature Module
 * Exports all gallery-related components, hooks, types, constants, and utils
 */

// Components
export { ImageErrorState } from "./components/ImageErrorState";
export {
  ImageGalleryModal,
  ImageGalleryCarousel,
  ImageGalleryHeader,
  ImageGalleryFooter,
  type ImageGalleryCarouselRef,
} from "./components/ImageGallery";
export { ImageLoadingSkeleton } from "./components/ImageLoadingSkeleton";
export { MorePhotosCard } from "./components/MorePhotosCard";
export { PhotoTabs } from "./components/PhotoTabs";
export type { PhotoTabValue, PhotoCounts } from "./components/PhotoTabs";
export { AssetCategoryTabs } from "./components/AssetCategoryTabs";
export type {
  AssetCategoryValue,
  AssetCounts,
} from "./components/AssetCategoryTabs";
export { AssetThumbnail } from "./components/AssetThumbnail";
export type { AssetThumbnailProps } from "./components/AssetThumbnail";
export { PhotoGridModal } from "./components/PhotoGrid";
export { PhotoGallery } from "./components/PhotoGallery";

// Constants
export * from "./constants/accessibilityStrings";
export * from "./constants/gestureConstants";

// Hooks
export { useAccessibilityAnnouncements } from "./hooks/useAccessibilityAnnouncements";
export { useImageGallery } from "./hooks/useImageGallery";
export { useImageLoading } from "./hooks/useImageLoading";
export { useImageNavigation } from "./hooks/useImageNavigation";
export { useImagePreloading } from "./hooks/useImagePreloading";
export { useLazyLoading } from "./hooks/useLazyLoading";
export { useMemoryManagement } from "./hooks/useMemoryManagement";
export { usePerformanceMonitoring } from "./hooks/usePerformanceMonitoring";
export { usePhotoGallery } from "./hooks/usePhotoGallery";

// Types
export * from "./types/gallery.types";

// Utils
export * from "./utils/assetViewer";
export * from "./utils/galleryPerformance";
export * from "./utils/imagePreloading";
export * from "./utils/lazyLoading";
export * from "./utils/memoryManagement";
