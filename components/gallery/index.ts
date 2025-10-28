/**
 * Image Gallery Components and Utilities
 *
 * This module provides a comprehensive image gallery system with the following features:
 *
 * ## Components
 * - **ImageGalleryModal**: Main modal component for full-screen image viewing
 * - **ImageGalleryCarousel**: Horizontal scrollable carousel for image navigation
 * - **ImageGalleryHeader**: Header with image counter and close button
 * - **ImageGalleryFooter**: Footer with image info and thumbnail navigation
 * - **ImageLoadingSkeleton**: Loading state component with pulsing animation
 * - **ImageErrorState**: Error state component with retry functionality
 *
 * ## Hooks
 * - **useImageGallery**: Core gallery state management
 * - **useImageNavigation**: Gesture-based navigation handling
 * - **useImageLoading**: Image loading state management
 * - **useImagePreloading**: Adjacent image preloading for performance
 * - **useLazyLoading**: Lazy loading optimization for large galleries
 * - **useMemoryManagement**: Memory monitoring and cleanup
 * - **usePerformanceMonitoring**: Performance metrics and recommendations
 * - **useAccessibilityAnnouncements**: Screen reader support
 *
 * ## Constants
 * - **accessibilityStrings**: Screen reader accessibility strings
 * - **gestureConstants**: Gesture handling configuration
 *
 * ## Types
 * - Comprehensive TypeScript interfaces for all components and hooks
 * - Theme-aware styling interfaces
 * - Performance monitoring types
 *
 * @example
 * ```tsx
 * import { ImageGalleryModal } from '@/components/gallery';
 *
 * <ImageGalleryModal
 *   visible={isModalVisible}
 *   images={projectImages}
 *   initialIndex={selectedImageIndex}
 *   onClose={() => setIsModalVisible(false)}
 * />
 * ```
 */

// Components
export { ImageErrorState } from "./ImageErrorState";
export { ImageGalleryCarousel } from "./ImageGalleryCarousel";
export { ImageGalleryFooter } from "./ImageGalleryFooter";
export { ImageGalleryHeader } from "./ImageGalleryHeader";
export { ImageGalleryModal } from "./ImageGalleryModal";
export { ImageLoadingSkeleton } from "./ImageLoadingSkeleton";

// Hooks
export { useAccessibilityAnnouncements } from "./hooks/useAccessibilityAnnouncements";
export { useImageGallery } from "./hooks/useImageGallery";
export { useImageLoading } from "./hooks/useImageLoading";
export { useImageNavigation } from "./hooks/useImageNavigation";
export { useImagePreloading } from "./hooks/useImagePreloading";
export { useLazyLoading } from "./hooks/useLazyLoading";
export { useMemoryManagement } from "./hooks/useMemoryManagement";
export { usePerformanceMonitoring } from "./hooks/usePerformanceMonitoring";

// Constants
export { accessibilityStrings } from "./constants/accessibilityStrings";
export {
  ANIMATION_CONFIG,
  MAX_EDGE_DRAG,
  MAX_PAGINATION_DOTS,
  SCREEN_WIDTH,
  SWIPE_THRESHOLD,
  VELOCITY_THRESHOLD,
} from "./constants/gestureConstants";

// Types
export type {
  AnimationConfig,
  CarouselStyles,
  FooterStyles,
  GalleryStyles,
  GestureEvent,
  HeaderStyles,
  ImageGalleryCarouselProps,
  ImageGalleryFooterProps,
  ImageGalleryHeaderProps,
  ImageGalleryModalProps,
  ImageLoadingProps,
  ImageLoadingState,
  ImageState,
  Theme,
  ThumbnailProps,
  UseImageGalleryReturn,
  UseImageNavigationReturn,
} from "./types/gallery.types";
