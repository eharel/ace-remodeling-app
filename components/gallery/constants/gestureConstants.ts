import { Dimensions } from "react-native";
import { AnimationConfig } from "../types/gallery.types";

const { width: screenWidth } = Dimensions.get("window");

// Gesture constants
export const SWIPE_THRESHOLD: number = screenWidth * 0.2; // 20% of screen width
export const VELOCITY_THRESHOLD: number = 500;
export const ANIMATION_CONFIG: AnimationConfig = {
  damping: 20,
  stiffness: 300,
} as const;

// Edge resistance factor for rubber band effect
export const EDGE_RESISTANCE: number = 0.3;

// Screen dimensions
export const SCREEN_WIDTH: number = screenWidth;
