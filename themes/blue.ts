/**
 * Blue Theme - Distinctive blue-tinted theme for brand identity
 */

import type { Theme } from "./base/types";
export const blueTheme: Theme = {
  name: "blue",
  isDark: false,
  isLight: true,

  colors: {
    // Background colors - Blue-tinted light theme
    background: {
      primary: "#f0f9ff", // Very light blue for main backgrounds
      secondary: "#e0f2fe", // Light blue for secondary backgrounds
      tertiary: "#bae6fd", // Medium light blue for contrast areas
      accent: "#7dd3fc", // Medium blue for separators
      card: "#ffffff", // White for cards and elevated elements
      section: "#f0f9ff", // Very light blue for content sections
      separator: "#bae6fd", // Medium light blue for borders and dividers
      elevated: "#ffffff", // White for elevated elements
      overlay: "rgba(0, 0, 0, 0.95)", // Nearly opaque black for modal overlays
    },

    // Text colors - Dark blue tones for excellent readability
    text: {
      primary: "#0c4a6e", // Dark blue for primary text
      secondary: "#075985", // Medium dark blue for secondary text
      tertiary: "#0369a1", // Medium blue for tertiary text
      inverse: "#ffffff", // White for text on dark backgrounds
      accent: "#0284c7", // Bright blue for accent text
      disabled: "#7dd3fc", // Light blue for disabled text
      placeholder: "#bae6fd", // Light blue for placeholder text
    },

    // Border colors - Blue-tinted borders
    border: {
      primary: "#bae6fd", // Light blue for primary borders
      secondary: "#7dd3fc", // Medium blue for secondary borders
      accent: "#0284c7", // Bright blue for accent borders (focus states)
      error: "#dc2626", // Red for error borders (maintains visibility)
      success: "#059669", // Green for success borders (maintains visibility)
      warning: "#d97706", // Orange for warning borders (maintains visibility)
      info: "#0284c7", // Blue for info borders
    },

    // Interactive colors - Blue-focused interactive elements
    interactive: {
      primary: "#0284c7", // Bright blue for primary actions
      primaryHover: "#0369a1", // Darker blue for hover states
      primaryPressed: "#075985", // Even darker blue for pressed states
      secondary: "#0369a1", // Medium blue for secondary actions
      secondaryHover: "#075985", // Darker blue for hover states
      secondaryPressed: "#0c4a6e", // Darkest blue for pressed states
      disabled: "#bae6fd", // Light blue for disabled elements
      disabledText: "#7dd3fc", // Light blue for disabled text
    },

    // Status colors - Maintains visibility while fitting blue theme
    status: {
      success: "#059669", // Green for success states
      successLight: "#d1fae5", // Light green for success backgrounds
      warning: "#d97706", // Orange for warning states
      warningLight: "#fef3c7", // Light orange for warning backgrounds
      error: "#dc2626", // Red for error states
      errorLight: "#fee2e2", // Light red for error backgrounds
      info: "#0284c7", // Blue for info states
      infoLight: "#dbeafe", // Light blue for info backgrounds
    },

    // Component-specific colors - Blue-tinted UI components
    components: {
      button: {
        primary: "#0284c7", // Bright blue for primary buttons
        primaryHover: "#0369a1", // Darker blue for hover
        secondary: "#0369a1", // Medium blue for secondary buttons
        secondaryHover: "#075985", // Darker blue for hover
        outline: "transparent", // Transparent for outline buttons
        outlineBorder: "#bae6fd", // Light blue border for outline buttons
      },
      card: {
        background: "#ffffff", // White background for cards
        border: "#bae6fd", // Light blue border for cards
        shadow: "#0c4a6e", // Dark blue shadow for cards
      },
      input: {
        background: "#ffffff", // White background for inputs
        border: "#bae6fd", // Light blue border for inputs
        borderFocus: "#0284c7", // Bright blue border for focused inputs
        placeholder: "#7dd3fc", // Medium blue for placeholder text
      },
      // Floating Action Button component
      fab: {
        backgroundColor: "#0284c7", // Bright blue background
        shadowColor: "#0c4a6e", // Dark blue shadow for FAB
        shadowOpacity: 0.3, // Medium shadow for blue theme
        activeOpacity: 0.7, // Standard active opacity
      },

      // Modal component
      modal: {
        backgroundColor: "#ffffff", // White background
        borderColor: "#bae6fd", // Light blue border
        borderRadius: 12, // Standard border radius
        borderWidth: 1, // Standard border width
        overlayOpacity: 0.6, // Medium overlay for blue theme
      },

      // Header component
      header: {
        backgroundColor: "#ffffff", // White background
        borderColor: "#bae6fd", // Light blue border
        titleFontWeight: "700", // Extra bold title for blue theme
        progressFontWeight: "600", // Semi-bold weight for progress text
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
        shadowColor: "#0c4a6e",
        shadowOpacity: 0.08,
      },
      base: {
        shadowColor: "#0c4a6e",
        shadowOpacity: 0.12,
      },
      md: {
        shadowColor: "#0c4a6e",
        shadowOpacity: 0.18,
      },
      lg: {
        shadowColor: "#0c4a6e",
        shadowOpacity: 0.25,
      },
    },
  },
};
