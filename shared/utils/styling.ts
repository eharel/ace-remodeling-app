import { DesignTokens, ThemeName, themes } from "@/core/themes";

// Legacy styling utilities (for backward compatibility)
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

  // Component size utilities
  componentSize: (component: keyof typeof DesignTokens.componentSizes) =>
    DesignTokens.componentSizes[component],

  // Interaction utilities
  interaction: (interaction: keyof typeof DesignTokens.interactions) =>
    DesignTokens.interactions[interaction],
} as const;

// REMOVED: Deprecated useThemeStyling function
// Use useTheme() directly from @/contexts/ThemeContext instead

// NEW: Theme-aware style generators
export const createThemeStyles = (theme: ThemeName) => {
  const themeColors = themes[theme].colors;

  return {
    // Background styles
    background: {
      primary: { backgroundColor: themeColors.background.primary },
      secondary: { backgroundColor: themeColors.background.secondary },
      tertiary: { backgroundColor: themeColors.background.tertiary },
      card: { backgroundColor: themeColors.background.card },
      elevated: { backgroundColor: themeColors.background.elevated },
    },

    // Text styles
    text: {
      primary: { color: themeColors.text.primary },
      secondary: { color: themeColors.text.secondary },
      tertiary: { color: themeColors.text.tertiary },
      inverse: { color: themeColors.text.inverse },
      accent: { color: themeColors.text.accent },
      error: { color: themeColors.status.error },
      success: { color: themeColors.status.success },
      warning: { color: themeColors.status.warning },
      info: { color: themeColors.status.info },
    },

    // Border styles
    border: {
      primary: { borderColor: themeColors.border.primary },
      secondary: { borderColor: themeColors.border.secondary },
      accent: { borderColor: themeColors.border.accent },
      error: { borderColor: themeColors.border.error },
      success: { borderColor: themeColors.border.success },
      warning: { borderColor: themeColors.border.warning },
      info: { borderColor: themeColors.border.info },
    },

    // Interactive styles
    interactive: {
      primary: { backgroundColor: themeColors.interactive.primary },
      secondary: { backgroundColor: themeColors.interactive.secondary },
      disabled: { backgroundColor: themeColors.interactive.disabled },
    },
  };
};

// Predefined style combinations for common patterns
export const commonStyles = {
  // Card styles - UPDATED to use new theme system
  card: {
    borderRadius: DesignTokens.borderRadius.lg,
    ...DesignTokens.shadows.base,
    padding: DesignTokens.spacing[5],
    borderWidth: 1,
    // Note: backgroundColor and borderColor should come from theme
  },

  // Button styles - UPDATED to use new theme system
  button: {
    primary: {
      backgroundColor: DesignTokens.colors.primary[500],
      borderRadius: DesignTokens.borderRadius.md,
      paddingVertical: DesignTokens.spacing[3],
      paddingHorizontal: DesignTokens.spacing[5],
      ...DesignTokens.shadows.sm,
    },
    secondary: {
      borderWidth: 1,
      borderRadius: DesignTokens.borderRadius.md,
      paddingVertical: DesignTokens.spacing[3],
      paddingHorizontal: DesignTokens.spacing[5],
      // Note: backgroundColor and borderColor should come from theme
    },
  },

  // Text styles - Semantic typography presets
  // Note: lineHeight is calculated as absolute pixel values (fontSize * multiplier)
  // for predictable rendering and to prevent text clipping in bold/large text
  text: {
    // Hero/Page-level titles (largest)
    pageTitle: {
      fontSize: DesignTokens.typography.fontSize["4xl"], // 32px
      fontWeight: DesignTokens.typography.fontWeight.extrabold, // 800
      lineHeight:
        DesignTokens.typography.fontSize["4xl"] *
        DesignTokens.typography.lineHeight.tight, // 32 * 1.2 = 38.4px
      // Note: color should come from theme
    },

    // Section headings (e.g., "Project Photos", "Documents")
    sectionTitle: {
      fontSize: DesignTokens.typography.fontSize["2xl"], // 24px
      fontWeight: DesignTokens.typography.fontWeight.bold, // 700
      lineHeight:
        DesignTokens.typography.fontSize["2xl"] *
        DesignTokens.typography.lineHeight.normal, // 24 * 1.4 = 33.6px
      // Note: color should come from theme
    },

    // Card titles and prominent headings
    cardTitle: {
      fontSize: DesignTokens.typography.fontSize.lg, // 18px
      fontWeight: DesignTokens.typography.fontWeight.semibold, // 600
      lineHeight:
        DesignTokens.typography.fontSize.lg *
        DesignTokens.typography.lineHeight.normal, // 18 * 1.4 = 25.2px
      // Note: color should come from theme
    },

    // Large descriptive text (e.g., project descriptions)
    description: {
      fontSize: DesignTokens.typography.fontSize.lg, // 18px
      fontWeight: DesignTokens.typography.fontWeight.normal, // 400
      lineHeight:
        DesignTokens.typography.fontSize.lg *
        DesignTokens.typography.lineHeight.normal, // 18 * 1.4 = 25.2px
      // Note: color should come from theme
    },

    // Standard body text
    body: {
      fontSize: DesignTokens.typography.fontSize.base, // 16px
      fontWeight: DesignTokens.typography.fontWeight.normal, // 400
      lineHeight:
        DesignTokens.typography.fontSize.base *
        DesignTokens.typography.lineHeight.normal, // 16 * 1.4 = 22.4px
      // Note: color should come from theme
    },

    // Smaller body text and secondary descriptions
    smallText: {
      fontSize: DesignTokens.typography.fontSize.sm, // 14px
      fontWeight: DesignTokens.typography.fontWeight.normal, // 400
      lineHeight:
        DesignTokens.typography.fontSize.sm *
        DesignTokens.typography.lineHeight.normal, // 14 * 1.4 = 19.6px
      // Note: color should come from theme
    },

    // Meta labels (e.g., "STATUS", "CATEGORY", "LOCATION")
    label: {
      fontSize: DesignTokens.typography.fontSize.xs, // 12px
      fontWeight: DesignTokens.typography.fontWeight.semibold, // 600
      lineHeight:
        DesignTokens.typography.fontSize.xs *
        DesignTokens.typography.lineHeight.normal, // 12 * 1.4 = 16.8px
      textTransform: "uppercase" as const,
      // Note: color should come from theme
    },

    // Stat values and emphasized data
    value: {
      fontSize: DesignTokens.typography.fontSize.lg, // 18px
      fontWeight: DesignTokens.typography.fontWeight.bold, // 700
      lineHeight:
        DesignTokens.typography.fontSize.lg *
        DesignTokens.typography.lineHeight.normal, // 18 * 1.4 = 25.2px
      // Note: color should come from theme
    },

    // Status badges and chips
    badge: {
      fontSize: DesignTokens.typography.fontSize.xs, // 12px
      fontWeight: DesignTokens.typography.fontWeight.bold, // 700
      lineHeight:
        DesignTokens.typography.fontSize.xs *
        DesignTokens.typography.lineHeight.tight, // 12 * 1.2 = 14.4px
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
      // Note: color should come from theme
    },

    // Captions and timestamps
    caption: {
      fontSize: DesignTokens.typography.fontSize.xs, // 12px
      fontWeight: DesignTokens.typography.fontWeight.normal, // 400
      lineHeight:
        DesignTokens.typography.fontSize.xs *
        DesignTokens.typography.lineHeight.normal, // 12 * 1.4 = 16.8px
      // Note: color should come from theme
    },

    // DEPRECATED: Legacy presets (for backward compatibility)
    heading: {
      fontSize: DesignTokens.typography.fontSize["2xl"],
      fontWeight: DesignTokens.typography.fontWeight.bold,
      lineHeight:
        DesignTokens.typography.fontSize["2xl"] *
        DesignTokens.typography.lineHeight.tight,
      // Note: Use 'sectionTitle' or 'pageTitle' instead
    },
    subheading: {
      fontSize: DesignTokens.typography.fontSize.xl,
      fontWeight: DesignTokens.typography.fontWeight.semibold,
      lineHeight:
        DesignTokens.typography.fontSize.xl *
        DesignTokens.typography.lineHeight.normal,
      // Note: Use 'cardTitle' instead
    },
  },

  // Layout styles - UPDATED to use new theme system
  layout: {
    container: {
      flex: 1,
      // Note: backgroundColor should come from theme
    },
    section: {
      borderRadius: DesignTokens.borderRadius.lg,
      marginBottom: DesignTokens.spacing[4],
      ...DesignTokens.shadows.sm,
      borderWidth: 1,
      // Note: backgroundColor and borderColor should come from theme
    },
    card: {
      // New common card style
      borderRadius: DesignTokens.borderRadius.lg,
      marginBottom: DesignTokens.spacing[4],
      ...DesignTokens.shadows.base,
      borderWidth: 1,
      // Note: backgroundColor and borderColor should come from theme
    },
    row: { flexDirection: "row", alignItems: "center" },
    center: { alignItems: "center", justifyContent: "center" },
  },
} as const;

// REMOVED: Deprecated statusStyles with hardcoded colors
// Use createThemeStatusStyles() instead for proper theme integration

// NEW: Theme-aware status styles
export const createThemeStatusStyles = (theme: ThemeName) => {
  const themeColors = themes[theme].colors;

  return {
    completed: {
      backgroundColor: themeColors.status.successLight,
      borderColor: themeColors.status.success,
      color: themeColors.status.success,
    },
    "in-progress": {
      backgroundColor: themeColors.status.warningLight,
      borderColor: themeColors.status.warning,
      color: themeColors.status.warning,
    },
    planning: {
      backgroundColor: themeColors.status.infoLight,
      borderColor: themeColors.status.info,
      color: themeColors.status.info,
    },
    "on-hold": {
      backgroundColor: themeColors.status.errorLight,
      borderColor: themeColors.status.error,
      color: themeColors.status.error,
    },
  };
};

// Export types for type safety
export type StylingUtility = typeof styling;
export type CommonStyles = typeof commonStyles;
