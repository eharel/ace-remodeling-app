import type { UserRole, Permission, User } from '@/shared/types/Auth';

/**
 * Maps user roles to their default permissions
 * This is the single source of truth for role-based permissions
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  viewer: ['read:projects'],

  editor: [
    'read:projects',
    'edit:projects',
  ],

  pm: [
    'read:projects',
    'edit:projects',
    'edit:own_notes',
  ],

  admin: [
    'read:projects',
    'edit:projects',
    'delete:projects',
    'edit:own_notes',
    'edit:all_notes',
    'manage:users',
  ],
} as const;

/**
 * Get all permissions for a given role
 * @param role - The user role
 * @returns Array of permissions for that role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 * @param role - The user role
 * @param permission - The permission to check
 * @returns true if the role has the permission
 */
export function roleHasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return getRolePermissions(role).includes(permission);
}

/**
 * Check if a user can edit a specific resource
 * Handles ownership-based permissions (e.g., PM editing their own notes)
 * 
 * @param user - The user attempting to edit
 * @param resourceOwnerId - Optional ID of the resource owner
 * @returns true if user can edit the resource
 */
export function canEditResource(
  user: User | null,
  resourceOwnerId?: string
): boolean {
  if (!user) return false;

  // Admin can edit everything
  if (user.permissions.includes('edit:all_notes')) {
    return true;
  }

  // Check general edit permission
  if (user.permissions.includes('edit:projects')) {
    return true;
  }

  // Check ownership-based permission (for PM-specific content)
  if (resourceOwnerId && user.permissions.includes('edit:own_notes')) {
    return user.pmId === resourceOwnerId;
  }

  return false;
}

/**
 * Check if a user can delete a resource
 * @param user - The user attempting to delete
 * @returns true if user has delete permission
 */
export function canDeleteResource(user: User | null): boolean {
  if (!user) return false;
  return user.permissions.includes('delete:projects');
}

/**
 * Check if a user can manage other users
 * @param user - The user to check
 * @returns true if user has user management permission
 */
export function canManageUsers(user: User | null): boolean {
  if (!user) return false;
  return user.permissions.includes('manage:users');
}

/**
 * Get a human-readable description of a role
 * @param role - The user role
 * @returns Description of what the role can do
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    viewer: 'Can view projects only (read-only access)',
    editor: 'Can view and edit all projects',
    pm: 'Can view, edit projects, and manage own meeting notes',
    admin: 'Full access to all features and user management',
  };

  return descriptions[role] || 'Unknown role';
}

