// Design Tokens - Single source of truth for all design values
export const DesignTokens = {
  // Color Palette
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
      primary: "System",
      secondary: "System",
      mono: "SpaceMono",
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
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
} as const;

// Type-safe access to design tokens
export type DesignToken = typeof DesignTokens;
export type ColorToken = keyof typeof DesignTokens.colors;
export type SpacingToken = keyof typeof DesignTokens.spacing;
export type TypographyToken = keyof typeof DesignTokens.typography;
