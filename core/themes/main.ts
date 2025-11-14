/**
 * Main Theme - Brand theme matching the website design
 * Uses the professional color palette from the ACE Remodeling website
 */

import type { Theme } from "./base/types";

export const mainTheme: Theme = {
  name: "main",
  isDark: false,
  isLight: true,

  colors: {
    // Background colors - Warm, professional backgrounds
    background: {
      primary: "#F7F4EF", // Warm off-white from website
      secondary: "#ffffff", // Pure white for contrast
      tertiary: "#323b4a", // Dark blue-gray for headers/footers (like website footer)
      accent: "#e2e8f0", // Medium light gray for separators
      card: "#ffffff", // White for cards and elevated elements
      section: "#F7F4EF", // Warm off-white for content sections
      separator: "#e2e8f0", // Light gray for borders and dividers
      elevated: "#ffffff", // White for elevated elements
      overlay: "rgba(50, 59, 74, 0.92)", // Dark blue-gray overlay for modals
    },

    // Text colors - Professional, readable text
    text: {
      primary: "#0f172a", // Very dark blue-gray for primary text
      secondary: "#475569", // Medium gray for secondary text
      tertiary: "#ffffff", // White for tertiary text (good contrast on dark backgrounds)
      inverse: "#ffffff", // White for text on dark backgrounds
      accent: "#BB9D67", // Warm gold for accent text
      disabled: "#94a3b8", // Light gray for disabled text
      placeholder: "#9ca3af", // Light gray for placeholder text
    },

    // Border colors - Subtle, professional borders
    border: {
      primary: "#e2e8f0", // Light gray for primary borders
      secondary: "#cbd5e1", // Slightly darker gray for secondary borders
      accent: "#BB9D67", // Warm gold for accent borders (focus states)
      error: "#ef4444", // Red for error borders
      success: "#10b981", // Green for success borders
      warning: "#f59e0b", // Orange for warning borders
      info: "#6196B5", // Soft blue for info borders
    },

    // Interactive colors - Brand colors for interactive elements
    interactive: {
      primary: "#BB9D67", // Warm gold for primary actions
      primaryHover: "#a68a5a", // Darker gold for hover states
      primaryPressed: "#91774d", // Even darker gold for pressed states
      secondary: "#72907F", // Sage green for secondary actions
      secondaryHover: "#5f7a6b", // Darker sage for hover states
      secondaryPressed: "#4c6357", // Even darker sage for pressed states
      disabled: "#e2e8f0", // Light gray for disabled elements
      disabledText: "#94a3b8", // Light gray for disabled text
    },

    // Status colors - Brand-aligned status indicators
    status: {
      success: "#10b981", // Green for success states
      successLight: "#d1fae5", // Light green for success backgrounds
      warning: "#f59e0b", // Orange for warning states
      warningLight: "#fef3c7", // Light orange for warning backgrounds
      error: "#ef4444", // Red for error states
      errorLight: "#fee2e2", // Light red for error backgrounds
      info: "#6196B5", // Soft blue for info states
      infoLight: "#dbeafe", // Light blue for info backgrounds
    },

    // Notification colors - For badges, alerts, and attention-requiring UI elements
    notification: {
      badge: "#FF3B30", // iOS system red (consistent with light theme)
      background: "#FFEBEE", // Very light red tint (consistent with light theme)
    },

    // Component colors - ONLY colors, NO dimensions
    components: {
      fab: {
        backgroundColor: "#BB9D67", // Gold background
        shadowColor: "#000000", // Black shadow for FAB
        shadowOpacity: 0.2, // Standard shadow opacity
      },
      modal: {
        backgroundColor: "#ffffff", // White background
        borderColor: "#e2e8f0", // Light gray border
        overlayColor: "#323B4A", // Dark blue-gray overlay
        overlayOpacity: 0.5, // Standard overlay opacity
      },
      card: {
        background: "#ffffff", // White background for cards
        border: "#e2e8f0", // Light gray border for cards
        shadow: "#000000", // Black shadow for cards
      },
      button: {
        primary: "#BB9D67", // Warm gold for primary buttons
        primaryHover: "#a68a5a", // Darker gold for hover
        secondary: "#72907F", // Sage green for secondary buttons
        secondaryHover: "#5f7a6b", // Darker sage for hover
        outline: "transparent", // Transparent for outline buttons
        outlineBorder: "#BB9D67", // Gold border for outline buttons
      },
      input: {
        background: "#ffffff", // White background for inputs
        border: "#e2e8f0", // Light gray border for inputs
        borderFocus: "#BB9D67", // Gold border for focused inputs
        placeholder: "#9ca3af", // Light gray for placeholder text
      },
    },

    // Shadow definitions with theme-specific colors and opacity
    shadows: {
      sm: {
        shadowColor: "#000000",
        shadowOpacity: 0.05,
      },
      base: {
        shadowColor: "#000000",
        shadowOpacity: 0.1,
      },
      md: {
        shadowColor: "#000000",
        shadowOpacity: 0.15,
      },
      lg: {
        shadowColor: "#000000",
        shadowOpacity: 0.2,
      },
    },
  },
};
