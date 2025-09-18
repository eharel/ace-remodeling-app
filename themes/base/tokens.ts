/**
 * Universal Design Tokens - Theme-agnostic design values
 *
 * This file contains only universal, theme-agnostic design tokens.
 * Colors here are reference palettes, not theme colors.
 * Component styling (colors, shadows) belongs in theme files.
 * Only dimensions, spacing, typography belong here.
 *
 * The result is a tokens file that could work with ANY theme system,
 * not just our specific light/dark/blue themes.
 */
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

    // Status Colors - Reference colors for themes to use
    status: {
      completed: "#10b981",
      "in-progress": "#f59e0b",
      planning: "#3b82f6",
      "on-hold": "#ef4444",
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

  // Shadows - Universal shadow structures (themes provide shadowColor and shadowOpacity)
  shadows: {
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowOffset: { width: 0, height: 8 },
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

  // Universal Interaction Constants
  interactions: {
    activeOpacity: 0.7, // Standard press opacity
    pressScale: 0.95, // Scale on press
    hoverScale: 1.02, // Scale on hover (web)
    disabledOpacity: 0.5, // Disabled state opacity
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
    fab: 1000, // Floating Action Button
  },

  // Component Size Constants - Universal dimensions only
  componentSizes: {
    // Floating Action Button (FAB)
    fab: {
      size: 56,
      iconSize: 24,
      borderRadius: 28, // Half of size for perfect circle
    },

    // Modal
    modal: {
      maxWidth: 500,
      maxHeightPercent: 70,
      minHeight: 500,
    },

    // Header - only universal dimensions
    header: {
      // Only keep truly universal dimensions here
      // Font sizes, weights, and spacing should be in theme files
    },

    // Checklist Item - only universal dimensions
    checklistItem: {
      // Only keep truly universal dimensions here
      // Font sizes and spacing should be in theme files
    },

    // Icon Button - universal dimensions
    iconButton: 40,

    // Thumbnail - universal dimensions
    thumbnail: 40,
  },
} as const;

// Type-safe access to design tokens
export type DesignToken = typeof DesignTokens;
export type ColorToken = keyof typeof DesignTokens.colors;
export type SpacingToken = keyof typeof DesignTokens.spacing;
export type TypographyToken = keyof typeof DesignTokens.typography;
export type ComponentSizeToken = keyof typeof DesignTokens.componentSizes;
export type InteractionToken = keyof typeof DesignTokens.interactions;
