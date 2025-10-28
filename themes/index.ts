/**
 * Theme System - Main Export File
 *
 * Usage:
 * import { lightTheme, darkTheme, mainTheme } from '@/themes';
 * import type { Theme, ThemeName } from '@/themes';
 */

// Import theme definitions
import { darkTheme } from "./dark";
import { lightTheme } from "./light";
import { mainTheme } from "./main";

// Import types
import type { Theme, ThemeName } from "./base/types";

// Re-export theme definitions
export { darkTheme, lightTheme, mainTheme };

// Export base types and utilities
export type {
  BackgroundColors,
  BorderColors,
  CompleteTheme,
  ComponentColors,
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
  main: mainTheme,
  light: lightTheme,
  dark: darkTheme,
} as const;

/**
 * Get a theme by name
 */
export function getTheme(name: ThemeName): Theme {
  const theme = themes[name as keyof typeof themes];
  if (!theme) {
    throw new Error(`Theme '${name}' not found`);
  }
  return theme;
}

/**
 * Get all available theme names
 */
export function getAvailableThemes(): ThemeName[] {
  return ["main", "light", "dark"];
}

/**
 * Check if a theme exists
 */
export function hasTheme(name: string): name is ThemeName {
  return getAvailableThemes().includes(name as ThemeName);
}
