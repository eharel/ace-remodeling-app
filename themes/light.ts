/**
 * Light Theme - Clean, bright theme with high contrast
 */

import type { Theme } from "./base/types";
export const lightTheme: Theme = {
  name: "light",
  isDark: false,
  isLight: true,

  colors: {
    // Background colors - Light theme uses white and light grays
    background: {
      primary: "#ffffff", // Pure white for main backgrounds
      secondary: "#f8fafc", // Very light gray for secondary backgrounds
      tertiary: "#f1f5f9", // Light gray for contrast areas
      accent: "#e2e8f0", // Medium light gray for separators
      card: "#ffffff", // White for cards and elevated elements
      section: "#ffffff", // White for content sections
      separator: "#e2e8f0", // Light gray for borders and dividers
      elevated: "#ffffff", // White for elevated elements
      overlay: "rgba(0, 0, 0, 0.95)", // Nearly opaque black for modal overlays
    },

    // Text colors - Dark text on light backgrounds
    text: {
      primary: "#0f172a", // Very dark blue-gray for primary text
      secondary: "#475569", // Medium gray for secondary text
      tertiary: "#64748b", // Lighter gray for tertiary text
      inverse: "#ffffff", // White for text on dark backgrounds
      accent: "#3b82f6", // Blue for accent text
      disabled: "#94a3b8", // Light gray for disabled text
      placeholder: "#9ca3af", // Light gray for placeholder text
    },

    // Border colors - Subtle borders that don't overpower content
    border: {
      primary: "#e2e8f0", // Light gray for primary borders
      secondary: "#cbd5e1", // Slightly darker gray for secondary borders
      accent: "#3b82f6", // Blue for accent borders (focus states)
      error: "#ef4444", // Red for error borders
      success: "#10b981", // Green for success borders
      warning: "#f59e0b", // Orange for warning borders
      info: "#3b82f6", // Blue for info borders
    },

    // Interactive colors - Clear, accessible interactive elements
    interactive: {
      primary: "#3b82f6", // Blue for primary actions
      primaryHover: "#2563eb", // Darker blue for hover states
      primaryPressed: "#1d4ed8", // Even darker blue for pressed states
      secondary: "#64748b", // Gray for secondary actions
      secondaryHover: "#475569", // Darker gray for hover states
      secondaryPressed: "#334155", // Even darker gray for pressed states
      disabled: "#e2e8f0", // Light gray for disabled elements
      disabledText: "#94a3b8", // Light gray for disabled text
    },

    // Status colors - Clear status indicators
    status: {
      success: "#10b981", // Green for success states
      successLight: "#d1fae5", // Light green for success backgrounds
      warning: "#f59e0b", // Orange for warning states
      warningLight: "#fef3c7", // Light orange for warning backgrounds
      error: "#ef4444", // Red for error states
      errorLight: "#fee2e2", // Light red for error backgrounds
      info: "#3b82f6", // Blue for info states
      infoLight: "#dbeafe", // Light blue for info backgrounds
    },

    // Component-specific colors - Tailored for specific UI components
    components: {
      button: {
        primary: "#3b82f6", // Blue for primary buttons
        primaryHover: "#2563eb", // Darker blue for hover
        secondary: "#64748b", // Gray for secondary buttons
        secondaryHover: "#475569", // Darker gray for hover
        outline: "transparent", // Transparent for outline buttons
        outlineBorder: "#e2e8f0", // Light gray border for outline buttons
      },
      card: {
        background: "#ffffff", // White background for cards
        border: "#e2e8f0", // Light gray border for cards
        shadow: "#000000", // Black shadow for cards
      },
      input: {
        background: "#ffffff", // White background for inputs
        border: "#e2e8f0", // Light gray border for inputs
        borderFocus: "#3b82f6", // Blue border for focused inputs
        placeholder: "#9ca3af", // Light gray for placeholder text
      },
      // Floating Action Button component
      fab: {
        backgroundColor: "#3b82f6", // Blue background
        shadowColor: "#000000", // Black shadow for FAB
        shadowOpacity: 0.2, // Lighter shadow for light theme
        activeOpacity: 0.7, // Standard active opacity
      },

      // Modal component
      modal: {
        backgroundColor: "#ffffff", // White background
        borderColor: "#e2e8f0", // Light gray border
        borderRadius: 12, // Standard border radius
        borderWidth: 1, // Standard border width
        overlayOpacity: 0.5, // Lighter overlay for light theme
      },

      // Header component
      header: {
        backgroundColor: "#ffffff", // White background
        borderColor: "#e2e8f0", // Light gray border
        titleFontWeight: "600", // Bold title for light theme
        progressFontWeight: "500", // Medium weight for progress text
        borderBottomWidth: 1, // Standard border width
        padding: 20, // Standard padding
      },

      // Checklist item component
      checklistItem: {
        paddingVertical: 12, // Standard vertical padding
        paddingHorizontal: 4, // Standard horizontal padding
        checkedOpacity: 0.6, // Opacity when checked
        activeOpacity: 0.7, // Standard active opacity
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
