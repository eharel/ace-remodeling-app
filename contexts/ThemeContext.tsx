import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import {
  ThemeMappings,
  ThemeMode,
  UnifiedTheme,
} from "@/constants/DesignTokens";

// Theme Context Types
interface ThemeContextType {
  // Current theme state
  themeMode: ThemeMode;
  currentTheme: "light" | "dark" | "blue";

  // Theme switching
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Theme data access
  theme: any;
  isDark: boolean;
  isLight: boolean;
  isBlue: boolean;

  // Utility functions
  getThemeColor: (path: string) => string;
  getComponentColor: (component: string, property: string) => string;
}

// Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Storage Keys
const THEME_MODE_KEY = "@theme_mode";

// Theme Provider Props
interface ThemeProviderProps {
  children: React.ReactNode;
}

// Theme Provider Component
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto");
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine current theme based on mode and system preference
  const currentTheme = useMemo(() => {
    if (themeMode === "auto") {
      return systemColorScheme || "light";
    }
    return themeMode as "light" | "dark" | "blue";
  }, [themeMode, systemColorScheme]);

  // Current theme data
  const theme = useMemo(() => {
    return ThemeMappings[currentTheme];
  }, [currentTheme]);

  // Theme state helpers
  const isDark = currentTheme === "dark";
  const isLight = currentTheme === "light";
  const isBlue = currentTheme === "blue";

  // Load theme mode from storage on mount
  useEffect(() => {
    loadThemeMode();
  }, []);

  // Load saved theme mode
  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
      if (
        savedMode &&
        (savedMode === "light" ||
          savedMode === "dark" ||
          savedMode === "blue" ||
          savedMode === "auto")
      ) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.warn("Failed to load theme mode:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  // Save theme mode to storage
  const saveThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
      console.warn("Failed to save theme mode:", error);
    }
  };

  // Set theme mode and save to storage
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    saveThemeMode(mode);
  };

  // Toggle between light, dark, and blue themes
  const toggleTheme = () => {
    const newMode =
      currentTheme === "light"
        ? "dark"
        : currentTheme === "dark"
        ? "blue"
        : "light";
    setThemeMode(newMode);
  };

  // Get theme color by path (e.g., "background.primary", "text.secondary")
  const getThemeColor = (path: string): string => {
    const keys = path.split(".");
    let value: any = theme.colors;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        console.warn(`Theme color path not found: ${path}`);
        return theme.colors.text.primary; // Fallback
      }
    }

    return value || theme.colors.text.primary;
  };

  // Get component-specific color
  const getComponentColor = (component: string, property: string): string => {
    const componentColors =
      theme.colors.components[
        component as keyof typeof theme.colors.components
      ];
    if (componentColors && property in componentColors) {
      return componentColors[property as keyof typeof componentColors];
    }
    console.warn(`Component color not found: ${component}.${property}`);
    return theme.colors.text.primary; // Fallback
  };

  // Context value
  const contextValue = useMemo(
    () => ({
      themeMode,
      currentTheme,
      setThemeMode,
      toggleTheme,
      theme,
      isDark,
      isLight,
      isBlue,
      getThemeColor,
      getComponentColor,
    }),
    [
      themeMode,
      currentTheme,
      setThemeMode,
      toggleTheme,
      theme,
      isDark,
      isLight,
      isBlue,
      getThemeColor,
      getComponentColor,
    ]
  );

  // Don't render until theme is loaded
  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Export the unified theme for direct access when needed
export { UnifiedTheme };
