/**
 * Shared Contexts Module
 * Exports all React context providers and hooks
 */

export {
  getProjectMedia,
  ProjectsProvider,
  useProjects,
} from "./ProjectsContext";
export { ThemeProvider, UnifiedTheme, useTheme } from "./ThemeContext";
