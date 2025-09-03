import { DesignTokens } from "@/constants/DesignTokens";

// Utility functions for consistent styling
export const styling = {
  // Color utilities
  color: (colorPath: string) => {
    const path = colorPath.split(".");
    let value: any = DesignTokens.colors;

    for (const key of path) {
      value = value[key];
    }

    return value;
  },

  // Spacing utilities
  spacing: (size: keyof typeof DesignTokens.spacing) =>
    DesignTokens.spacing[size],

  // Typography utilities
  fontSize: (size: keyof typeof DesignTokens.typography.fontSize) =>
    DesignTokens.typography.fontSize[size],

  fontWeight: (weight: keyof typeof DesignTokens.typography.fontWeight) =>
    DesignTokens.typography.fontWeight[weight],

  fontFamily: (family: keyof typeof DesignTokens.typography.fontFamily) =>
    DesignTokens.typography.fontFamily[family],

  lineHeight: (height: keyof typeof DesignTokens.typography.lineHeight) =>
    DesignTokens.typography.lineHeight[height],

  // Border radius utilities
  borderRadius: (size: keyof typeof DesignTokens.borderRadius) =>
    DesignTokens.borderRadius[size],

  // Shadow utilities
  shadow: (size: keyof typeof DesignTokens.shadows) =>
    DesignTokens.shadows[size],

  // Transition utilities
  transition: (duration: keyof typeof DesignTokens.transitions) =>
    DesignTokens.transitions[duration],

  // Z-index utilities
  zIndex: (level: keyof typeof DesignTokens.zIndex) =>
    DesignTokens.zIndex[level],
} as const;

// Predefined style combinations for common patterns
export const commonStyles = {
  // Card styles
  card: {
    backgroundColor: DesignTokens.colors.background.card,
    borderRadius: DesignTokens.borderRadius.lg,
    ...DesignTokens.shadows.base,
    padding: DesignTokens.spacing[5],
    borderWidth: 1,
    borderColor: DesignTokens.colors.accent.border,
  },

  // Button styles
  button: {
    primary: {
      backgroundColor: DesignTokens.colors.primary[500],
      borderRadius: DesignTokens.borderRadius.md,
      paddingVertical: DesignTokens.spacing[3],
      paddingHorizontal: DesignTokens.spacing[5],
      ...DesignTokens.shadows.sm,
    },
    secondary: {
      backgroundColor: DesignTokens.colors.background.secondary,
      borderWidth: 1,
      borderColor: DesignTokens.colors.accent.border,
      borderRadius: DesignTokens.borderRadius.md,
      paddingVertical: DesignTokens.spacing[3],
      paddingHorizontal: DesignTokens.spacing[5],
    },
  },

  // Text styles
  text: {
    heading: {
      fontSize: DesignTokens.typography.fontSize["2xl"],
      fontWeight: DesignTokens.typography.fontWeight.bold,
      color: DesignTokens.colors.text.primary,
      lineHeight: DesignTokens.typography.lineHeight.tight,
    },
    subheading: {
      fontSize: DesignTokens.typography.fontSize.xl,
      fontWeight: DesignTokens.typography.fontWeight.semibold,
      color: DesignTokens.colors.text.secondary,
      lineHeight: DesignTokens.typography.lineHeight.normal,
    },
    body: {
      fontSize: DesignTokens.typography.fontSize.base,
      fontWeight: DesignTokens.typography.fontWeight.normal,
      color: DesignTokens.colors.text.secondary,
      lineHeight: DesignTokens.typography.lineHeight.relaxed,
    },
    caption: {
      fontSize: DesignTokens.typography.fontSize.sm,
      fontWeight: DesignTokens.typography.fontWeight.normal,
      color: DesignTokens.colors.text.tertiary,
      lineHeight: DesignTokens.typography.lineHeight.normal,
    },
  },

  // Layout styles
  layout: {
    container: {
      flex: 1,
      backgroundColor: DesignTokens.colors.background.secondary,
    },
    section: {
      backgroundColor: DesignTokens.colors.background.section,
      borderRadius: DesignTokens.borderRadius.lg,
      marginBottom: DesignTokens.spacing[4],
      ...DesignTokens.shadows.sm,
      borderWidth: 1,
      borderColor: DesignTokens.colors.accent.border,
    },
    card: {
      backgroundColor: DesignTokens.colors.background.card,
      borderRadius: DesignTokens.borderRadius.lg,
      marginBottom: DesignTokens.spacing[4],
      ...DesignTokens.shadows.base,
      borderWidth: 1,
      borderColor: DesignTokens.colors.accent.border,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    center: {
      alignItems: "center",
      justifyContent: "center",
    },
  },
} as const;

// Status-specific styles
export const statusStyles = {
  completed: {
    backgroundColor: DesignTokens.colors.status.completed + "20", // 20% opacity
    borderColor: DesignTokens.colors.status.completed,
    color: DesignTokens.colors.status.completed,
  },
  "in-progress": {
    backgroundColor: DesignTokens.colors.status["in-progress"] + "20",
    borderColor: DesignTokens.colors.status["in-progress"],
    color: DesignTokens.colors.status["in-progress"],
  },
  planning: {
    backgroundColor: DesignTokens.colors.status.planning + "20",
    borderColor: DesignTokens.colors.status.planning,
    color: DesignTokens.colors.status.planning,
  },
  "on-hold": {
    backgroundColor: DesignTokens.colors.status["on-hold"] + "20",
    borderColor: DesignTokens.colors.status["on-hold"],
    color: DesignTokens.colors.status["on-hold"],
  },
} as const;

// Export types for type safety
export type StylingUtility = typeof styling;
export type CommonStyles = typeof commonStyles;
export type StatusStyles = typeof statusStyles;
