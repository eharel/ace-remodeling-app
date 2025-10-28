/**
 * Theme utility functions
 * Helper functions for theme management and validation
 */

import type { Theme, ThemeName, ThemeSetting } from "./types";

/**
 * Get the appropriate theme based on system preference
 * @param themeSetting - The theme setting (including 'system')
 * @param systemTheme - The system theme preference
 * @returns The resolved theme name
 */
export function resolveTheme(
  themeSetting: ThemeSetting,
  systemTheme: "light" | "dark" = "light"
): ThemeName {
  if (themeSetting === "system") {
    return systemTheme;
  }
  return themeSetting;
}

/**
 * Check if a theme is a dark theme
 * @param theme - The theme to check
 * @returns True if the theme is dark
 */
export function isDarkTheme(theme: Theme): boolean {
  return theme.isDark;
}

/**
 * Check if a theme is a light theme
 * @param theme - The theme to check
 * @returns True if the theme is light
 */
export function isLightTheme(theme: Theme): boolean {
  return theme.isLight;
}

/**
 * Get the contrast color for a given background color
 * @param backgroundColor - The background color to get contrast for
 * @returns The appropriate text color (light or dark)
 */
export function getContrastColor(backgroundColor: string): string {
  // Simple contrast calculation - in a real app you might want more sophisticated logic
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "#000000" : "#ffffff";
}

/**
 * Validate that a theme object has all required properties
 * @param theme - The theme object to validate
 * @returns True if the theme is valid
 */
export function validateTheme(theme: any): theme is Theme {
  if (!theme || typeof theme !== "object") {
    return false;
  }

  const requiredProperties = ["name", "colors", "isDark", "isLight"];

  for (const prop of requiredProperties) {
    if (!(prop in theme)) {
      console.warn(`Theme validation failed: Missing property '${prop}'`);
      return false;
    }
  }

  // Validate colors structure
  const colorProperties = [
    "background",
    "text",
    "border",
    "interactive",
    "status",
    "components",
  ];

  for (const prop of colorProperties) {
    if (!theme.colors || !(prop in theme.colors)) {
      console.warn(`Theme validation failed: Missing color property '${prop}'`);
      return false;
    }
  }

  return true;
}

/**
 * Create a theme variant by modifying specific colors
 * @param baseTheme - The base theme to modify
 * @param overrides - Color overrides to apply
 * @returns A new theme with the specified overrides
 */
export function createThemeVariant<T extends Theme>(
  baseTheme: T,
  overrides: Partial<T["colors"]>
): T {
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...overrides,
    },
  };
}

/**
 * Get a color value from a theme with fallback
 * @param theme - The theme object
 * @param path - The color path (e.g., 'background.primary')
 * @param fallback - Fallback color if path not found
 * @returns The color value or fallback
 */
export function getThemeColor(
  theme: Theme,
  path: string,
  fallback: string = "#000000"
): string {
  const keys = path.split(".");
  let current: any = theme.colors;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      console.warn(`Theme color path '${path}' not found, using fallback`);
      return fallback;
    }
  }

  return typeof current === "string" ? current : fallback;
}

/**
 * Generate CSS custom properties from a theme
 * @param theme - The theme to convert
 * @returns CSS custom properties object
 */
export function themeToCSSProperties(theme: Theme): Record<string, string> {
  const properties: Record<string, string> = {};

  // Flatten the theme colors into CSS custom properties
  function flattenColors(obj: any, prefix: string = "") {
    for (const [key, value] of Object.entries(obj)) {
      const cssVar = `--color-${prefix}${key}`.replace(/\./g, "-");

      if (typeof value === "string") {
        properties[cssVar] = value;
      } else if (typeof value === "object" && value !== null) {
        flattenColors(value, `${prefix}${key}-`);
      }
    }
  }

  flattenColors(theme.colors);

  // Add theme metadata
  properties["--theme-name"] = theme.name;
  properties["--theme-is-dark"] = theme.isDark ? "1" : "0";
  properties["--theme-is-light"] = theme.isLight ? "1" : "0";

  return properties;
}
