/**
 * Shared Contexts Module
 * Exports all React context providers and hooks
 */

export { AuthProvider, useAuth } from "./AuthContext";
export {
  getProjectMedia,
  ProjectsProvider,
  useProjects,
} from "./ProjectsContext";
export { ThemeProvider, UnifiedTheme, useTheme } from "./ThemeContext";
export type { User, UserRole, Permission } from "@/shared/types/Auth";
export {
  canDeleteResource,
  canEditResource,
  canManageUsers,
  getRoleDescription,
  getRolePermissions,
  roleHasPermission,
} from "@/shared/utils/permissions";
