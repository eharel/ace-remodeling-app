import { TextStyle, ViewStyle } from "react-native";

import { Picture } from "@/core/types";

/**
 * Performance metrics for a single measurement
 */
export interface PerformanceMetrics {
  renderTime: number;
  imageLoadTime: number;
  memoryUsage: number;
  frameRate: number;
  gestureResponseTime: number;
}

/**
 * Aggregated performance statistics
 */
export interface PerformanceStats {
  averageRenderTime: number;
  averageImageLoadTime: number;
  averageMemoryUsage: number;
  averageFrameRate: number;
  averageGestureResponseTime: number;
  totalRenders: number;
  totalImageLoads: number;
  performanceScore: number; // 0-100
}

/**
 * Theme interface for gallery components
 *
 * Defines the minimal theme structure required by gallery components.
 * This is a subset of the full theme interface, containing only the
 * colors needed for gallery functionality.
 *
 * @interface Theme
 */
export interface Theme {
  colors: {
    background: {
      overlay: string;
    };
    text: {
      inverse: string;
    };
    interactive: {
      primary: string;
    };
  };
}

/**
 * Base props interface for all gallery components
 *
 * Provides the common theme prop that all gallery components require
 * for consistent styling and theming.
 *
 * @interface BaseGalleryProps
 */
export interface BaseGalleryProps {
  /** Theme object containing color definitions */
  theme: Theme;
}

/**
 * Props for the main image gallery modal component
 *
 * @interface ImageGalleryModalProps
 */
export interface ImageGalleryModalProps {
  /** Whether the modal is currently visible */
  visible: boolean;
  /** Array of images to display in the gallery */
  images: Picture[];
  /** Initial image index to display when modal opens */
  initialIndex: number;
  /** Callback function called when modal should be closed */
  onClose: () => void;
}

/**
 * Props for individual thumbnail components
 *
 * @interface ThumbnailProps
 */
export interface ThumbnailProps extends BaseGalleryProps {
  /** Image object to display as thumbnail */
  image: Picture;
  /** Index of this thumbnail in the gallery */
  index: number;
  /** Whether this thumbnail represents the currently active image */
  isActive: boolean;
  /** Callback function called when thumbnail is pressed */
  onPress: (index: number) => void;
}

/**
 * Props for the gallery header component
 *
 * @interface ImageGalleryHeaderProps
 */
export interface ImageGalleryHeaderProps extends BaseGalleryProps {
  /** Current image index being displayed */
  currentIndex: number;
  /** Total number of images in the gallery */
  totalImages: number;
  /** Callback function called when close button is pressed */
  onClose: () => void;
}

/**
 * Props for the image carousel component
 *
 * @interface ImageGalleryCarouselProps
 */
export interface ImageGalleryCarouselProps extends BaseGalleryProps {
  /** Array of images to display in the carousel */
  images: Picture[];
  /** Current image index being displayed */
  currentIndex: number;
  /** Callback function called when the current index changes */
  onIndexChange: (index: number) => void;
}

/**
 * Props for the gallery footer component
 *
 * @interface ImageGalleryFooterProps
 */
export interface ImageGalleryFooterProps extends BaseGalleryProps {
  /** Currently displayed image object */
  currentImage: Picture;
  /** Array of all images in the gallery */
  images: Picture[];
  /** Current image index being displayed */
  currentIndex: number;
  /** Callback function called when a thumbnail is selected */
  onImageSelect: (index: number) => void;
}

// Hook return types
/**
 * Return type for the useImageGallery hook
 *
 * Provides all the state and functions needed for gallery management,
 * including current index, navigation functions, and refs for accessibility.
 *
 * @interface UseImageGalleryReturn
 */
export interface UseImageGalleryReturn {
  /** Current image index being displayed */
  currentIndex: number;
  /** Function to set the current image index */
  setCurrentIndex: (index: number) => void;
  /** Function to update the current index */
  updateCurrentIndex: (newIndex: number) => void;
  /** Ref for the modal component */
  modalRef: React.RefObject<any>;
  /** Ref for the close button */
  closeButtonRef: React.RefObject<any>;
  /** Safe area insets for proper layout */
  insets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Return type for the useImageNavigation hook
 *
 * Provides navigation functions and gesture handling for the gallery.
 *
 * @interface UseImageNavigationReturn
 */
export interface UseImageNavigationReturn {
  /** Function to navigate to a specific image */
  goToImage: (index: number) => void;
  /** Pan gesture handler for swipe navigation */
  panGesture: any; // PanGesture - kept as any since hook is deprecated but still exists
}

// Style types
/**
 * Style interface for gallery modal components
 *
 * @interface GalleryStyles
 */
export interface GalleryStyles {
  modal: ViewStyle;
  container: ViewStyle;
}

/**
 * Style interface for gallery header components
 *
 * @interface HeaderStyles
 */
export interface HeaderStyles {
  header: ViewStyle;
  closeButton: ViewStyle;
  imageCounter: ViewStyle;
}

/**
 * Style interface for gallery carousel components
 *
 * @interface CarouselStyles
 */
export interface CarouselStyles {
  carouselContainer: ViewStyle;
  carousel: ViewStyle;
  imageContainer: ViewStyle;
  image: ViewStyle;
}

/**
 * Style interface for gallery footer components
 *
 * @interface FooterStyles
 */
export interface FooterStyles {
  footer: ViewStyle;
  imageInfo: ViewStyle;
  imageType: TextStyle;
  imageDescription: TextStyle;
  thumbnailContainer: ViewStyle;
  thumbnail: ViewStyle;
  thumbnailActive: ViewStyle;
}

// Gesture event types
/**
 * Gesture event data structure
 *
 * Contains the data provided by pan gesture events for navigation handling.
 *
 * @interface GestureEvent
 */
export interface GestureEvent {
  /** Horizontal translation distance in pixels */
  translationX: number;
  /** Horizontal velocity in pixels per second */
  velocityX: number;
  /** Gesture state (active, ended, etc.) */
  state: number;
}

// Animation config type
/**
 * Animation configuration for gallery transitions
 *
 * Defines the spring animation parameters for smooth image transitions.
 *
 * @interface AnimationConfig
 */
export interface AnimationConfig {
  /** Damping factor for spring animation (0-1, higher = less bouncy) */
  damping: number;
  /** Stiffness factor for spring animation (higher = faster) */
  stiffness: number;
}

// Image loading states
/**
 * Possible states for image loading
 *
 * @type ImageLoadingState
 */
export type ImageLoadingState = "loading" | "loaded" | "error";

// Image state for tracking loading/error states
/**
 * State tracking for individual images
 *
 * @interface ImageState
 */
export interface ImageState {
  /** Unique identifier for the image */
  id: string;
  /** Current loading state of the image */
  state: ImageLoadingState;
  /** Error message if loading failed */
  error?: string;
}

// Loading and error handling props
/**
 * Props for image loading and error handling
 *
 * @interface ImageLoadingProps
 */
export interface ImageLoadingProps {
  /** Map of image states by image ID */
  imageStates: Map<string, ImageState>;
  /** Callback when an image successfully loads */
  onImageLoad: (imageId: string) => void;
  /** Callback when an image fails to load */
  onImageError: (imageId: string, error: string) => void;
}
