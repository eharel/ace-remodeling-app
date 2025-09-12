import { Picture } from "@/types";

export interface ImageGalleryModalProps {
  visible: boolean;
  images: Picture[];
  initialIndex: number;
  onClose: () => void;
}

export interface ThumbnailProps {
  image: Picture;
  index: number;
  isActive: boolean;
  onPress: (index: number) => void;
  theme: any;
}

export interface ImageGalleryHeaderProps {
  currentIndex: number;
  totalImages: number;
  onClose: () => void;
  theme: any;
}

export interface ImageGalleryCarouselProps {
  images: Picture[];
  currentIndex: number;
  translateX: any;
  panGesture: any;
  theme: any;
}

export interface ImageGalleryFooterProps {
  currentImage: Picture;
  images: Picture[];
  currentIndex: number;
  onImageSelect: (index: number) => void;
  theme: any;
}
