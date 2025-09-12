export { ImageGalleryCarousel } from "./ImageGalleryCarousel";
export { ImageGalleryFooter } from "./ImageGalleryFooter";
export { ImageGalleryHeader } from "./ImageGalleryHeader";
export { ImageGalleryModal } from "./ImageGalleryModal";

export { useAccessibilityAnnouncements } from "./hooks/useAccessibilityAnnouncements";
export { useImageGallery } from "./hooks/useImageGallery";
export { useImageNavigation } from "./hooks/useImageNavigation";

export { accessibilityStrings } from "./constants/accessibilityStrings";
export {
  ANIMATION_CONFIG,
  EDGE_RESISTANCE,
  SWIPE_THRESHOLD,
  VELOCITY_THRESHOLD,
} from "./constants/gestureConstants";

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
  Theme,
  ThumbnailProps,
  UseImageGalleryReturn,
  UseImageNavigationReturn,
} from "./types/gallery.types";
