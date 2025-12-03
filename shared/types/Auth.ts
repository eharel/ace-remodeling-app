/**
 * Authentication Types
 * 
 * Comprehensive TypeScript types for authentication and permissions.
 * These types form the foundation for the authentication system.
 */

/**
 * User roles in the application
 * - viewer: Can only view projects (default, read-only)
 * - editor: Can edit all projects
 * - pm: Project Manager with edit access to own content
 * - admin: Full system access
 */
export type UserRole = 'viewer' | 'editor' | 'pm' | 'admin';

/**
 * Granular permissions for resource access
 * Format: <action>:<resource>
 */
export type Permission =
  | 'read:projects'
  | 'edit:projects'
  | 'delete:projects'
  | 'edit:own_notes'    // PM can edit their own meeting notes
  | 'edit:all_notes'    // Admin can edit all notes
  | 'manage:users';     // Admin can manage user accounts

/**
 * User entity representing an authenticated (or guest) user
 */
export interface User {
  id: string;                    // Unique identifier (later: Firebase Auth UID)
  email?: string;                // User email (later: from Firebase Auth)
  displayName?: string;          // User's display name
  role: UserRole;                // User's role in the system
  permissions: Permission[];     // Computed permissions based on role
  pmId?: string;                 // Links to ProjectManager.id if user is a PM
  createdAt?: string;            // ISO timestamp (for future use)
  lastLoginAt?: string;          // ISO timestamp (for future use)
}

