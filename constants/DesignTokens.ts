// Design Tokens - Single source of truth for all design values
export const DesignTokens = {
  // Color Palette - Base colors (semantic names)
  colors: {
    // Primary Brand Colors
    primary: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6", // Main primary
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },

    // Secondary/Accent Colors
    secondary: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e", // Main secondary
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },

    // Neutral Colors
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
    },

    // Semantic Colors
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",

    // Status Colors
    status: {
      completed: "#10b981",
      "in-progress": "#f59e0b",
      planning: "#3b82f6",
      "on-hold": "#ef4444",
    },

    // Background Colors
    background: {
      primary: "#ffffff",
      secondary: "#f8fafc", // Light gray for main background
      tertiary: "#f1f5f9", // Darker gray for contrast
      accent: "#e2e8f0", // Medium gray for separators
      card: "#ffffff", // White for cards
      section: "#ffffff", // White for sections
      separator: "#e2e8f0", // Gray for borders
    },

    // Text Colors
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      tertiary: "#64748b",
      inverse: "#ffffff",
      accent: "#3b82f6",
    },

    // Accent Colors for Visual Interest
    accent: {
      primary: "#3b82f6",
      secondary: "#22c55e",
      subtle: "#dbeafe",
      border: "#cbd5e1",
      highlight: "#fef3c7",
    },
  },

  // Typography Scale
  typography: {
    fontFamily: {
      primary: "Inter",
      secondary: "Inter",
      mono: "SpaceMono",
      // Specific weight mappings
      regular: "Inter-Regular",
      medium: "Inter-Medium",
      semibold: "Inter-SemiBold",
      bold: "Inter-Bold",
    },

    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 28,
      "4xl": 32,
      "5xl": 36,
    },

    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },

    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  },

  // Spacing Scale (8px base unit)
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
    32: 128,
  },

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    full: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Transitions
  transitions: {
    fast: 150,
    normal: 250,
    slow: 350,
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// Theme Mappings - Maps semantic tokens to actual colors for light/dark
export const ThemeMappings = {
  light: {
    colors: {
      // Background colors
      background: {
        primary: "#ffffff",
        secondary: "#f8fafc",
        tertiary: "#f1f5f9",
        accent: "#e2e8f0",
        card: "#ffffff",
        section: "#ffffff",
        separator: "#e2e8f0",
        elevated: "#ffffff",
        overlay: "rgba(0, 0, 0, 0.5)",
      },

      // Text colors
      text: {
        primary: "#0f172a",
        secondary: "#475569",
        tertiary: "#64748b",
        inverse: "#ffffff",
        accent: "#3b82f6",
        disabled: "#94a3b8",
        placeholder: "#9ca3af",
      },

      // Border colors
      border: {
        primary: "#e2e8f0",
        secondary: "#cbd5e1",
        accent: "#3b82f6",
        error: "#ef4444",
        success: "#10b981",
        warning: "#f59e0b",
        info: "#3b82f6",
      },

      // Interactive colors
      interactive: {
        primary: "#3b82f6",
        primaryHover: "#2563eb",
        primaryPressed: "#1d4ed8",
        secondary: "#64748b",
        secondaryHover: "#475569",
        secondaryPressed: "#334155",
        disabled: "#e2e8f0",
        disabledText: "#94a3b8",
      },

      // Status colors
      status: {
        success: "#10b981",
        successLight: "#d1fae5",
        warning: "#f59e0b",
        warningLight: "#fef3c7",
        error: "#ef4444",
        errorLight: "#fee2e2",
        info: "#3b82f6",
        infoLight: "#dbeafe",
      },

      // Component-specific colors
      components: {
        button: {
          primary: "#3b82f6",
          primaryHover: "#2563eb",
          secondary: "#64748b",
          secondaryHover: "#475569",
          outline: "transparent",
          outlineBorder: "#e2e8f0",
        },
        card: {
          background: "#ffffff",
          border: "#e2e8f0",
          shadow: "#000000",
        },
        input: {
          background: "#ffffff",
          border: "#e2e8f0",
          borderFocus: "#3b82f6",
          placeholder: "#9ca3af",
        },
      },
    },
  },

  dark: {
    colors: {
      // Background colors
      background: {
        primary: "#0f172a",
        secondary: "#1e293b",
        tertiary: "#334155",
        accent: "#475569",
        card: "#1e293b",
        section: "#1e293b",
        separator: "#334155",
        elevated: "#334155",
        overlay: "rgba(0, 0, 0, 0.7)",
      },

      // Text colors
      text: {
        primary: "#f8fafc",
        secondary: "#cbd5e1",
        tertiary: "#94a3b8",
        inverse: "#0f172a",
        accent: "#60a5fa",
        disabled: "#64748b",
        placeholder: "#64748b",
      },

      // Border colors
      border: {
        primary: "#334155",
        secondary: "#475569",
        accent: "#60a5fa",
        error: "#f87171",
        success: "#34d399",
        warning: "#fbbf24",
        info: "#60a5fa",
      },

      // Interactive colors
      interactive: {
        primary: "#60a5fa",
        primaryHover: "#93c5fd",
        primaryPressed: "#3b82f6",
        secondary: "#94a3b8",
        secondaryHover: "#cbd5e1",
        secondaryPressed: "#e2e8f0",
        disabled: "#334155",
        disabledText: "#64748b",
      },

      // Status colors
      status: {
        success: "#34d399",
        successLight: "#064e3b",
        warning: "#fbbf24",
        warningLight: "#451a03",
        error: "#f87171",
        errorLight: "#450a0a",
        info: "#60a5fa",
        infoLight: "#1e3a8a",
      },

      // Component-specific colors
      components: {
        button: {
          primary: "#60a5fa",
          primaryHover: "#93c5fd",
          secondary: "#94a3b8",
          secondaryHover: "#cbd5e1",
          outline: "transparent",
          outlineBorder: "#334155",
        },
        card: {
          background: "#1e293b",
          border: "#334155",
          shadow: "#000000",
        },
        input: {
          background: "#1e293b",
          border: "#334155",
          borderFocus: "#60a5fa",
          placeholder: "#64748b",
        },
      },
    },
  },

  blue: {
    colors: {
      // Background colors - Blue-tinted theme
      background: {
        primary: "#f0f9ff", // Very light blue
        secondary: "#e0f2fe", // Light blue
        tertiary: "#bae6fd", // Medium light blue
        accent: "#7dd3fc", // Medium blue
        card: "#ffffff", // White cards for contrast
        section: "#f0f9ff", // Light blue sections
        separator: "#bae6fd", // Blue separators
        elevated: "#ffffff", // White elevated elements
        overlay: "rgba(14, 116, 144, 0.5)", // Blue overlay
      },

      // Text colors - Dark blue tones
      text: {
        primary: "#0c4a6e", // Dark blue
        secondary: "#075985", // Medium dark blue
        tertiary: "#0369a1", // Medium blue
        inverse: "#ffffff", // White inverse
        accent: "#0284c7", // Bright blue accent
        disabled: "#7dd3fc", // Light blue disabled
        placeholder: "#bae6fd", // Light blue placeholder
      },

      // Border colors
      border: {
        primary: "#bae6fd", // Light blue
        secondary: "#7dd3fc", // Medium blue
        accent: "#0284c7", // Bright blue
        error: "#dc2626", // Red for errors
        success: "#059669", // Green for success
        warning: "#d97706", // Orange for warnings
        info: "#0284c7", // Blue for info
      },

      // Interactive colors
      interactive: {
        primary: "#0284c7", // Bright blue
        primaryHover: "#0369a1", // Darker blue on hover
        primaryPressed: "#075985", // Even darker on press
        secondary: "#0369a1", // Medium blue
        secondaryHover: "#075985", // Darker on hover
        secondaryPressed: "#0c4a6e", // Darkest on press
        disabled: "#bae6fd", // Light blue disabled
        disabledText: "#7dd3fc", // Light blue disabled text
      },

      // Status colors
      status: {
        success: "#059669", // Green
        successLight: "#d1fae5", // Light green
        warning: "#d97706", // Orange
        warningLight: "#fef3c7", // Light orange
        error: "#dc2626", // Red
        errorLight: "#fee2e2", // Light red
        info: "#0284c7", // Blue
        infoLight: "#dbeafe", // Light blue
      },

      // Component-specific colors
      components: {
        button: {
          primary: "#0284c7", // Bright blue
          primaryHover: "#0369a1", // Darker blue
          secondary: "#0369a1", // Medium blue
          secondaryHover: "#075985", // Darker blue
          outline: "transparent", // Transparent outline
          outlineBorder: "#bae6fd", // Light blue border
        },
        card: {
          background: "#ffffff", // White cards
          border: "#bae6fd", // Light blue border
          shadow: "#0c4a6e", // Dark blue shadow
        },
        input: {
          background: "#ffffff", // White background
          border: "#bae6fd", // Light blue border
          borderFocus: "#0284c7", // Bright blue focus
          placeholder: "#7dd3fc", // Medium blue placeholder
        },
      },
    },
  },
} as const;

// Theme Types
export type ThemeMode = "light" | "dark" | "blue" | "auto";
export type ThemeVariant =
  | "primary"
  | "secondary"
  | "card"
  | "outline"
  | "ghost"
  | "elevated"
  | "outlined";

// Export the unified theme system
export const UnifiedTheme = {
  tokens: DesignTokens,
  mappings: ThemeMappings,
} as const;

// Type-safe access to design tokens
export type DesignToken = typeof DesignTokens;
export type ColorToken = keyof typeof DesignTokens.colors;
export type SpacingToken = keyof typeof DesignTokens.spacing;
export type TypographyToken = keyof typeof DesignTokens.typography;
