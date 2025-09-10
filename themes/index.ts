/**
 * Theme System - Main Export File
 *
 * Usage:
 * import { lightTheme, darkTheme, blueTheme } from '@/themes';
 * import type { Theme, ThemeName } from '@/themes';
 */

// Import theme definitions
import { blueTheme } from "./blue";
import { darkTheme } from "./dark";
import { lightTheme } from "./light";

// Import types
import type { Theme, ThemeName } from "./base/types";

// Re-export theme definitions
export { blueTheme, darkTheme, lightTheme };

// Export base types and utilities
export type {
  BackgroundColors,
  BorderColors,
  CompleteTheme,
  ComponentStyles,
  InteractiveColors,
  StatusColors,
  TextColors,
  Theme,
  ThemeColors,
  ThemeName,
  ThemeSetting,
  ThemeVariant,
} from "./base/types";

export { isThemeName, isThemeSetting } from "./base/types";

export {
  createThemeVariant,
  getContrastColor,
  getThemeColor,
  isDarkTheme,
  isLightTheme,
  resolveTheme,
  themeToCSSProperties,
  validateTheme,
} from "./base/utils";

// Export design tokens
export { DesignTokens } from "./base/tokens";
export type {
  ColorToken,
  ComponentSizeToken,
  DesignToken,
  InteractionToken,
  SpacingToken,
  TypographyToken,
} from "./base/tokens";

/**
 * Unified themes object
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme,
} as const;

/**
 * Get a theme by name
 */
export function getTheme(name: ThemeName): Theme {
  switch (name) {
    case "light":
      return lightTheme;
    case "dark":
      return darkTheme;
    case "blue":
      return blueTheme;
    default:
      throw new Error(`Theme '${name}' not found`);
  }
}

/**
 * Get all available theme names
 */
export function getAvailableThemes(): ThemeName[] {
  return ["light", "dark", "blue"];
}

/**
 * Check if a theme exists
 */
export function hasTheme(name: string): name is ThemeName {
  return getAvailableThemes().includes(name as ThemeName);
}
