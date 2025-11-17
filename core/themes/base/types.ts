/**
 * Strict TypeScript interfaces for theme system
 * These interfaces enforce complete theme definitions and prevent runtime errors
 */

/**
 * Base color palette structure
 * All color objects must follow this exact structure
 */
export interface ColorPalette {
  /** Primary brand colors */
  primary: string;
  /** Secondary/accent colors */
  secondary: string;
  /** Success state colors */
  success: string;
  /** Warning state colors */
  warning: string;
  /** Error state colors */
  error: string;
  /** Info state colors */
  info: string;
}

/**
 * Background color structure
 * Defines all background color variants for a theme
 */
export interface BackgroundColors {
  /** Primary background color */
  primary: string;
  /** Secondary background color */
  secondary: string;
  /** Tertiary background color */
  tertiary: string;
  /** Accent background color */
  accent: string;
  /** Card background color */
  card: string;
  /** Section background color */
  section: string;
  /** Separator background color */
  separator: string;
  /** Elevated element background color */
  elevated: string;
  /** Modal overlay background color */
  overlay: string;
}

/**
 * Text color structure
 * Defines all text color variants for a theme
 */
export interface TextColors {
  /** Primary text color */
  primary: string;
  /** Secondary text color */
  secondary: string;
  /** Tertiary text color */
  tertiary: string;
  /** Inverse text color (for dark backgrounds) */
  inverse: string;
  /** Accent text color */
  accent: string;
  /** Disabled text color */
  disabled: string;
  /** Placeholder text color */
  placeholder: string;
}

/**
 * Border color structure
 * Defines all border color variants for a theme
 */
export interface BorderColors {
  /** Primary border color */
  primary: string;
  /** Secondary border color */
  secondary: string;
  /** Accent border color */
  accent: string;
  /** Error border color */
  error: string;
  /** Success border color */
  success: string;
  /** Warning border color */
  warning: string;
  /** Info border color */
  info: string;
}

/**
 * Interactive color structure
 * Defines all interactive element colors for a theme
 */
export interface InteractiveColors {
  /** Primary interactive color */
  primary: string;
  /** Primary hover state color */
  primaryHover: string;
  /** Primary pressed state color */
  primaryPressed: string;
  /** Secondary interactive color */
  secondary: string;
  /** Secondary hover state color */
  secondaryHover: string;
  /** Secondary pressed state color */
  secondaryPressed: string;
  /** Disabled interactive color */
  disabled: string;
  /** Disabled text color */
  disabledText: string;
}

/**
 * Status color structure
 * Defines all status-related colors for a theme
 */
export interface StatusColors {
  /** Success status color */
  success: string;
  /** Success light variant color */
  successLight: string;
  /** Warning status color */
  warning: string;
  /** Warning light variant color */
  warningLight: string;
  /** Error status color */
  error: string;
  /** Error light variant color */
  errorLight: string;
  /** Info status color */
  info: string;
  /** Info light variant color */
  infoLight: string;
}

/**
 * Notification color structure
 * Defines colors for badges, alerts, and attention-requiring UI elements.
 * Used for notification indicators that require user attention or action.
 */
export interface NotificationColors {
  /** Primary notification color for badges and attention indicators */
  badge: string;
  /** Light tint for notification surfaces and backgrounds */
  background: string;
}

/**
 * Showcase color structure
 * Defines premium colors for the Showcase tab and featured project elements.
 * Gold/amber colors convey premium quality, achievement, and elevated status.
 * These colors should only be used on Showcase tab features to maintain
 * their special, elevated feel.
 */
export interface ShowcaseColors {
  /**
   * Premium accent color for featured badges and highlights.
   * Gold/amber conveys premium quality and stands out from primary brand colors
   * while remaining complementary to the overall design system.
   */
  accent: string;
  /**
   * Light variant of the accent color for backgrounds and subtle highlights.
   * Used for featured project backgrounds and subtle emphasis areas.
   */
  accentLight: string;
}

/**
 * Component colors interface
 * Defines ONLY color-related properties for UI components
 * Dimensions and layout properties belong in DesignTokens
 */
export interface ComponentColors {
  /** Floating Action Button component */
  fab: {
    /** Background color */
    backgroundColor: string;
    /** Shadow color */
    shadowColor: string;
    /** Shadow opacity */
    shadowOpacity: number;
  };

  /** Modal component */
  modal: {
    /** Background color */
    backgroundColor: string;
    /** Border color */
    borderColor: string;
    /** Overlay color */
    overlayColor: string;
    /** Overlay opacity */
    overlayOpacity: number;
  };

  /** Card component */
  card: {
    /** Card background color */
    background: string;
    /** Card border color */
    border: string;
    /** Card shadow color */
    shadow: string;
  };

  /** Button component */
  button: {
    /** Primary button color */
    primary: string;
    /** Primary button hover color */
    primaryHover: string;
    /** Secondary button color */
    secondary: string;
    /** Secondary button hover color */
    secondaryHover: string;
    /** Outline button background */
    outline: string;
    /** Outline button border color */
    outlineBorder: string;
  };

  /** Input component */
  input: {
    /** Input background color */
    background: string;
    /** Input border color */
    border: string;
    /** Input focus border color */
    borderFocus: string;
    /** Input placeholder color */
    placeholder: string;
  };
}

/**
 * Complete theme color structure
 * This interface enforces that ALL color properties must be defined
 */
export interface ThemeColors {
  /** Background colors */
  background: BackgroundColors;
  /** Text colors */
  text: TextColors;
  /** Border colors */
  border: BorderColors;
  /** Interactive colors */
  interactive: InteractiveColors;
  /** Status colors */
  status: StatusColors;
  /** Notification and attention-requiring UI elements */
  notification: NotificationColors;
  /** Showcase colors for premium featured content */
  showcase: ShowcaseColors;
  /** Component-specific colors */
  components: ComponentColors;
  /** Shadow definitions with theme-specific colors and opacity */
  shadows: {
    sm: { shadowColor: string; shadowOpacity: number };
    base: { shadowColor: string; shadowOpacity: number };
    md: { shadowColor: string; shadowOpacity: number };
    lg: { shadowColor: string; shadowOpacity: number };
  };
}

/**
 * Complete theme definition
 * This interface enforces that ALL theme properties must be defined
 */
export interface Theme {
  /** Theme name for identification */
  name: string;
  /** Theme colors - must be complete */
  colors: ThemeColors;
  /** Whether this is a dark theme */
  isDark: boolean;
  /** Whether this is a light theme */
  isLight: boolean;
}

/**
 * Theme name type - derived from actual theme implementations
 * This ensures type safety when referencing theme names
 */
export type ThemeName = "main" | "light" | "dark";

/**
 * Theme setting type - includes system option
 */
export type ThemeSetting = ThemeName | "system";

/**
 * Theme variant type for component styling
 */
export type ThemeVariant =
  | "primary"
  | "secondary"
  | "card"
  | "outline"
  | "ghost"
  | "elevated"
  | "outlined";

/**
 * Utility type to ensure a theme object is complete
 * This type will cause a TypeScript error if any required property is missing
 */
export type CompleteTheme<T extends Theme> = T;

/**
 * Type guard to check if a value is a valid theme name
 */
export function isThemeName(value: string): value is ThemeName {
  return ["main", "light", "dark"].includes(value);
}

/**
 * Type guard to check if a value is a valid theme setting
 */
export function isThemeSetting(value: string): value is ThemeSetting {
  return ["main", "light", "dark", "system"].includes(value);
}
