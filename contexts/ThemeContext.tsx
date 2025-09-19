import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

import { ThemeName, themes, ThemeSetting } from "@/themes";

// Theme constants - derived from themes system (single source of truth)
const THEME_NAMES: ThemeName[] = Object.keys(themes) as ThemeName[];
const SYSTEM_THEME = "system" as const;
const DEFAULT_THEME: ThemeName = "main"; // Design decision: main as default
const DEFAULT_SETTING: ThemeSetting = SYSTEM_THEME;

// Theme Context Types
interface ThemeContextType {
  // Current theme state
  themeSetting: ThemeSetting;
  currentTheme: ThemeName;

  // Theme switching
  setThemeSetting: (setting: ThemeSetting) => void;
  toggleTheme: () => void;

  // Theme data access
  theme: any;
  isDark: boolean;
  isLight: boolean;
  isMain: boolean;
}

// Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme Storage Keys
const THEME_SETTING_KEY = "@theme_setting";

// Available themes (excluding "system") - same as THEME_NAMES
const AVAILABLE_THEMES: ThemeName[] = THEME_NAMES;

// Theme Provider Props
interface ThemeProviderProps {
  children: React.ReactNode;
}

// Theme Provider Component
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeSetting, setThemeSettingState] =
    useState<ThemeSetting>(DEFAULT_SETTING);
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine current theme based on setting and system preference
  const currentTheme = useMemo(() => {
    if (themeSetting === SYSTEM_THEME) {
      return systemColorScheme || DEFAULT_THEME;
    }
    return themeSetting;
  }, [themeSetting, systemColorScheme]);

  // Current theme data
  const theme = useMemo(() => {
    return themes[currentTheme];
  }, [currentTheme]);

  // Theme state helpers
  const isDark = currentTheme === "dark";
  const isLight = currentTheme === "light";
  const isMain = currentTheme === "main";

  // Load theme setting from storage on mount
  useEffect(() => {
    loadThemeSetting();
  }, []);

  // Load saved theme setting
  const loadThemeSetting = async () => {
    try {
      const savedSetting = await AsyncStorage.getItem(THEME_SETTING_KEY);
      if (
        savedSetting &&
        (THEME_NAMES.includes(savedSetting as ThemeName) ||
          savedSetting === SYSTEM_THEME)
      ) {
        setThemeSettingState(savedSetting as ThemeSetting);
      }
    } catch (error) {
      console.warn("Failed to load theme mode:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  // Save theme setting to storage
  const saveThemeSetting = async (setting: ThemeSetting) => {
    try {
      await AsyncStorage.setItem(THEME_SETTING_KEY, setting);
    } catch (error) {
      console.warn("Failed to save theme setting:", error);
    }
  };

  // Set theme setting and save to storage
  const setThemeSetting = useCallback((setting: ThemeSetting) => {
    setThemeSettingState(setting);
    saveThemeSetting(setting);
  }, []);

  // Toggle between available themes (cycles through all themes except "system")
  const toggleTheme = useCallback(() => {
    const currentIndex = AVAILABLE_THEMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
    setThemeSetting(AVAILABLE_THEMES[nextIndex]);
  }, [currentTheme, setThemeSetting]);

  // Context value
  const contextValue = useMemo(
    () => ({
      themeSetting,
      currentTheme,
      setThemeSetting,
      toggleTheme,
      theme,
      isDark,
      isLight,
      isMain,
    }),
    [
      themeSetting,
      currentTheme,
      setThemeSetting,
      toggleTheme,
      theme,
      isDark,
      isLight,
      isMain,
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
export { themes as UnifiedTheme };
