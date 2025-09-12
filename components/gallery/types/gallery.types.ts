import { TextStyle, ViewStyle } from "react-native";
import { PanGesture } from "react-native-gesture-handler";
import { SharedValue } from "react-native-reanimated";

import { Picture } from "@/types";

// Theme type - we'll define it here since it's not exported from ThemeContext
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

// Base gallery props
export interface BaseGalleryProps {
  theme: Theme;
}

// Main modal props
export interface ImageGalleryModalProps {
  visible: boolean;
  images: Picture[];
  initialIndex: number;
  onClose: () => void;
}

// Thumbnail component props
export interface ThumbnailProps extends BaseGalleryProps {
  image: Picture;
  index: number;
  isActive: boolean;
  onPress: (index: number) => void;
}

// Header component props
export interface ImageGalleryHeaderProps extends BaseGalleryProps {
  currentIndex: number;
  totalImages: number;
  onClose: () => void;
}

// Carousel component props
export interface ImageGalleryCarouselProps extends BaseGalleryProps {
  images: Picture[];
  currentIndex: number;
  translateX: SharedValue<number>;
  panGesture: PanGesture;
}

// Footer component props
export interface ImageGalleryFooterProps extends BaseGalleryProps {
  currentImage: Picture;
  images: Picture[];
  currentIndex: number;
  onImageSelect: (index: number) => void;
}

// Hook return types
export interface UseImageGalleryReturn {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  translateX: SharedValue<number>;
  goToImage: (index: number) => void;
  updateCurrentIndex: (newIndex: number) => void;
  modalRef: React.RefObject<any>;
  closeButtonRef: React.RefObject<any>;
  insets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface UseImageNavigationReturn {
  goToImage: (index: number) => void;
  panGesture: PanGesture;
}

// Style types
export interface GalleryStyles {
  modal: ViewStyle;
  container: ViewStyle;
}

export interface HeaderStyles {
  header: ViewStyle;
  closeButton: ViewStyle;
  imageCounter: ViewStyle;
}

export interface CarouselStyles {
  carouselContainer: ViewStyle;
  carousel: ViewStyle;
  imageContainer: ViewStyle;
  image: ViewStyle;
}

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
export interface GestureEvent {
  translationX: number;
  velocityX: number;
  state: number;
}

// Animation config type
export interface AnimationConfig {
  damping: number;
  stiffness: number;
}
