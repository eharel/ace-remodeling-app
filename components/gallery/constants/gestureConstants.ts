import { Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// Gesture constants
export const SWIPE_THRESHOLD = screenWidth * 0.2; // 20% of screen width
export const VELOCITY_THRESHOLD = 500;
export const ANIMATION_CONFIG = {
  damping: 20,
  stiffness: 300,
} as const;

// Edge resistance factor for rubber band effect
export const EDGE_RESISTANCE = 0.3;
