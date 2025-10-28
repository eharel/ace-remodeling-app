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

/** Smooth animation configuration - visible transitions without bouncing */
export const ANIMATION_CONFIG: AnimationConfig = {
  damping: 0.8,
  stiffness: 150,
} as const;

/** Maximum number of pagination dots to show */
export const MAX_PAGINATION_DOTS: number = 7;

/** Maximum edge drag distance for visual feedback */
export const MAX_EDGE_DRAG: number = 90;

/** Screen width for layout calculations */
export const SCREEN_WIDTH: number = screenWidth;
