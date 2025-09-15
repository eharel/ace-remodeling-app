import { SharedValue } from "react-native-reanimated";

// Zoom configuration options
export interface ZoomConfig {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  doubleTapScale?: number;
  animationDuration?: number;
  enablePan?: boolean;
  enablePinch?: boolean;
  enableDoubleTap?: boolean;
  panBounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
}

// Zoom state
export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
  isZoomed: boolean;
  isPanning: boolean;
  isZooming: boolean;
}

// Zoom gesture event
export interface ZoomGestureEvent {
  scale: number;
  velocity: number;
  focalX: number;
  focalY: number;
  translationX: number;
  translationY: number;
}

// Pan gesture event
export interface PanGestureEvent {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
}

// Zoom context value
export interface ZoomContextValue {
  // Global zoom settings
  globalConfig: ZoomConfig;
  updateGlobalConfig: (config: Partial<ZoomConfig>) => void;

  // Zoom state management
  resetAllZoom: () => void;

  // Zoom statistics
  getZoomStats: () => {
    activeZoomCount: number;
    averageScale: number;
    totalZoomedComponents: number;
  };
}

// Hook return type
export interface UseZoomReturn {
  // State
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  isZoomed: SharedValue<boolean>;
  isPanning: SharedValue<boolean>;
  isZooming: SharedValue<boolean>;

  // Gesture handlers
  pinchGesture: any; // Gesture from react-native-gesture-handler
  panGesture: any;
  doubleTapGesture: any;

  // Actions
  resetZoom: () => void;
  setZoom: (scale: number, focalX?: number, focalY?: number) => void;
  zoomIn: (focalX?: number, focalY?: number) => void;
  zoomOut: (focalX?: number, focalY?: number) => void;
  toggleZoom: (focalX?: number, focalY?: number) => void;

  // Utilities
  getCurrentState: () => ZoomState;
  isAtMinScale: () => boolean;
  isAtMaxScale: () => boolean;

  // Configuration
  config: ZoomConfig;
  updateConfig: (newConfig: Partial<ZoomConfig>) => void;
}

// Zoom component props
export interface ZoomableImageProps {
  source: { uri: string } | number;
  style?: any;
  contentFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  zoomConfig?: Partial<ZoomConfig>;
  onZoomChange?: (state: ZoomState) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
  children?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Zoom container props
export interface ZoomContainerProps {
  children: React.ReactNode;
  zoomConfig?: Partial<ZoomConfig>;
  style?: any;
  onZoomChange?: (state: ZoomState) => void;
  onZoomStart?: () => void;
  onZoomEnd?: () => void;
}

// Zoom constants
export const ZOOM_CONSTANTS = {
  DEFAULT_MIN_SCALE: 1,
  DEFAULT_MAX_SCALE: 3,
  DEFAULT_INITIAL_SCALE: 1,
  DEFAULT_DOUBLE_TAP_SCALE: 2,
  DEFAULT_ANIMATION_DURATION: 300,
  ZOOM_THRESHOLD: 0.1,
  PAN_THRESHOLD: 10,
  VELOCITY_THRESHOLD: 0.5,
} as const;
