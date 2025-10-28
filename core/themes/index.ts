/**
 * Core Themes Module
 * Exports all theme-related exports
 */

// Export base system first
export * from "./base/tokens";
export * from "./base/types";
export * from "./base/utils";

// Export theme objects
export { darkTheme } from "./dark";
export { lightTheme } from "./light";
export { mainTheme } from "./main";

// Create themes map
import { darkTheme } from "./dark";
import { lightTheme } from "./light";
import { mainTheme } from "./main";

export const themes = {
  dark: darkTheme,
  light: lightTheme,
  main: mainTheme,
};
