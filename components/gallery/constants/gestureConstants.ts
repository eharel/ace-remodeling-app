import { Dimensions } from "react-native";
import { AnimationConfig } from "../types/gallery.types";

const { width: screenWidth } = Dimensions.get("window");

/**
 * Gesture Constants for Image Gallery
 *
 * This file contains all the constants used for gesture handling in the image gallery,
 * including swipe thresholds, animation configurations, and screen dimensions.
 */

/** Minimum swipe distance (20% of screen width) to trigger navigation */
export const SWIPE_THRESHOLD: number = screenWidth * 0.2;

/** Minimum velocity (pixels per second) to trigger navigation */
export const VELOCITY_THRESHOLD: number = 500;

/** Spring animation configuration for smooth transitions */
export const ANIMATION_CONFIG: AnimationConfig = {
  damping: 20,
  stiffness: 300,
} as const;

/** Edge resistance factor for rubber band effect when reaching first/last images */
export const EDGE_RESISTANCE: number = 0.3;

/** Screen width for layout calculations */
export const SCREEN_WIDTH: number = screenWidth;
