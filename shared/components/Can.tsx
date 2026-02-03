import { ReactNode } from "react";

import { useAuth } from "@/shared/contexts/AuthContext";
import type { Permission } from "@/shared/types/Auth";

interface CanProps {
  /** The permission required to render children */
  permission?: Permission;
  /** Alternative: check if user can edit (uses canEdit from AuthContext) */
  edit?: boolean;
  /** Optional resource owner ID for ownership-based permissions */
  resourceOwnerId?: string;
  /** Content to render if permission check passes */
  children: ReactNode;
  /** Optional fallback content if permission check fails */
  fallback?: ReactNode;
}

/**
 * Conditional rendering component based on user permissions
 *
 * Usage:
 * ```tsx
 * // Check specific permission
 * <Can permission="edit:projects">
 *   <EditButton />
 * </Can>
 *
 * // Check edit capability (shorthand)
 * <Can edit>
 *   <FeaturedToggle />
 * </Can>
 *
 * // With fallback
 * <Can permission="edit:projects" fallback={<ViewOnlyBadge />}>
 *   <EditButton />
 * </Can>
 * ```
 */
export function Can({
  permission,
  edit,
  resourceOwnerId,
  children,
  fallback = null,
}: CanProps) {
  const { hasPermission, canEdit } = useAuth();

  let isAllowed = false;

  if (edit) {
    // Use canEdit for edit-based permission check
    isAllowed = canEdit(resourceOwnerId);
  } else if (permission) {
    // Use hasPermission for specific permission check
    isAllowed = hasPermission(permission);
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
