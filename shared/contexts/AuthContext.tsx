import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User, Permission } from '@/shared/types/Auth';

// Storage key for persisting auth state
const AUTH_STATE_KEY = 'auth_state';

interface AuthContextValue {
  // Current user state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Authentication actions (to be implemented in later phases)
  signIn: (pin: string) => Promise<boolean>;
  signOut: () => Promise<void>;

  // Permission checking utilities
  hasPermission: (permission: Permission) => boolean;
  canEdit: (resourceOwnerId?: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Hook to access authentication context
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provides authentication state and utilities to the app
 * Phase 1: Initializes with a hardcoded viewer user (read-only access)
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with default viewer user
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Phase 1: Hardcoded viewer user (read-only)
        // Later phases will check AsyncStorage and Firebase Auth
        const defaultUser: User = {
          id: 'guest-viewer',
          displayName: 'Guest',
          role: 'viewer',
          permissions: ['read:projects'],
        };

        setUser(defaultUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Check if user has a specific permission
   * @param permission - The permission to check
   * @returns true if user has the permission
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  /**
   * Check if user can edit a resource
   * @param resourceOwnerId - Optional owner ID for ownership-based permissions
   * @returns true if user can edit
   */
  const canEdit = useCallback(
    (resourceOwnerId?: string): boolean => {
      if (!user) return false;

      // Admin can edit everything
      if (hasPermission('edit:all_notes')) return true;

      // Check project-level edit permission
      if (hasPermission('edit:projects')) return true;

      // Check ownership-based permissions (for PM-specific content)
      if (resourceOwnerId && hasPermission('edit:own_notes')) {
        return user.pmId === resourceOwnerId;
      }

      return false;
    },
    [user, hasPermission]
  );

  /**
   * Sign in with PIN (placeholder for Phase 3)
   * @param pin - The PIN to authenticate with
   * @returns true if authentication successful
   */
  const signIn = useCallback(async (pin: string): Promise<boolean> => {
    // Phase 1: Not implemented yet
    console.log('signIn called (not implemented in Phase 1)');
    return false;
  }, []);

  /**
   * Sign out current user (placeholder for Phase 3)
   */
  const signOut = useCallback(async (): Promise<void> => {
    // Phase 1: Not implemented yet
    console.log('signOut called (not implemented in Phase 1)');
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null && user.role !== 'viewer',
    isLoading,
    signIn,
    signOut,
    hasPermission,
    canEdit,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

