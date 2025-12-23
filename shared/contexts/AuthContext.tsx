import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/shared/config';
import type { User, Permission } from '@/shared/types/Auth';
import { getRolePermissions, canEditResource } from '@/shared/utils/permissions';

// Storage keys for persisting auth state
const AUTH_STATE_KEY = 'auth_state';
const CACHED_PIN_KEY = 'cached_edit_pin';
const EDIT_MODE_ENABLED_KEY = 'edit_mode_enabled';

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
 * Phase 3: Implements PIN-based authentication with Firestore integration
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editPin, setEditPin] = useState<string | null>(null);

  // Initialize auth state and fetch PIN from Firestore
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Step 1: Fetch PIN from Firestore (with offline fallback)
        try {
          const configRef = doc(db, 'config', 'editMode');
          const configSnap = await getDoc(configRef);

          if (configSnap.exists()) {
            const pin = configSnap.data().pin;
            setEditPin(pin);
            // Cache for offline use
            await AsyncStorage.setItem(CACHED_PIN_KEY, pin);
            console.log('PIN loaded from Firestore');
          }
        } catch (pinError) {
          // If offline or Firestore fails, use cached PIN
          console.log('Using cached PIN (offline mode)');
          const cachedPin = await AsyncStorage.getItem(CACHED_PIN_KEY);
          if (cachedPin) {
            setEditPin(cachedPin);
            console.log('PIN loaded from cache');
          }
        }

        // Step 2: Check if user was previously authenticated
        const wasAuthenticated = await AsyncStorage.getItem(EDIT_MODE_ENABLED_KEY);

        if (wasAuthenticated === 'true') {
          // Restore editor user
          const editorUser: User = {
            id: 'authenticated-editor',
            displayName: 'Editor',
            role: 'editor',
            permissions: getRolePermissions('editor'),
          };
          setUser(editorUser);
          console.log('Restored authenticated editor session');
        } else {
          // Default viewer user
          const defaultUser: User = {
            id: 'guest-viewer',
            displayName: 'Guest',
            role: 'viewer',
            permissions: getRolePermissions('viewer'),
          };
          setUser(defaultUser);
          console.log('Initialized as viewer');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Fallback to viewer on any error
        const defaultUser: User = {
          id: 'guest-viewer',
          displayName: 'Guest',
          role: 'viewer',
          permissions: getRolePermissions('viewer'),
        };
        setUser(defaultUser);
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
      return canEditResource(user, resourceOwnerId);
    },
    [user]
  );

  /**
   * Sign in with PIN to enable edit mode
   * @param enteredPin - The PIN to authenticate with
   * @returns true if authentication successful, false otherwise
   */
  const signIn = useCallback(
    async (enteredPin: string): Promise<boolean> => {
      try {
        // Validate PIN
        if (!editPin) {
          console.error('PIN not loaded yet');
          return false;
        }

        if (enteredPin !== editPin) {
          console.log('Invalid PIN');
          return false;
        }

        // PIN is correct - upgrade user to editor
        const editorUser: User = {
          id: 'authenticated-editor',
          displayName: 'Editor',
          role: 'editor',
          permissions: getRolePermissions('editor'),
        };

        setUser(editorUser);

        // Persist authentication state
        await AsyncStorage.setItem(EDIT_MODE_ENABLED_KEY, 'true');

        console.log('Authentication successful - edit mode enabled');
        return true;
      } catch (error) {
        console.error('Sign in failed:', error);
        return false;
      }
    },
    [editPin]
  );

  /**
   * Sign out and return to viewer mode
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      // Downgrade to viewer
      const viewerUser: User = {
        id: 'guest-viewer',
        displayName: 'Guest',
        role: 'viewer',
        permissions: getRolePermissions('viewer'),
      };

      setUser(viewerUser);

      // Clear authentication state
      await AsyncStorage.setItem(EDIT_MODE_ENABLED_KEY, 'false');

      console.log('Signed out - returned to viewer mode');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
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

