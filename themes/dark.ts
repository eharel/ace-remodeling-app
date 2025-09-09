/**
 * Dark Theme - Sophisticated dark theme for low-light conditions
 */

import type { Theme } from "./base/types";
export const darkTheme: Theme = {
  name: "dark",
  isDark: true,
  isLight: false,

  colors: {
    // Background colors - Dark theme uses dark grays and blacks
    background: {
      primary: "#0f172a", // Very dark blue-gray for main backgrounds
      secondary: "#1e293b", // Dark gray for secondary backgrounds
      tertiary: "#334155", // Medium dark gray for contrast areas
      accent: "#475569", // Medium gray for separators
      card: "#1e293b", // Dark gray for cards and elevated elements
      section: "#1e293b", // Dark gray for content sections
      separator: "#334155", // Medium dark gray for borders and dividers
      elevated: "#334155", // Medium dark gray for elevated elements
      overlay: "rgba(0, 0, 0, 0.7)", // Semi-transparent black for overlays
    },

    // Text colors - Light text on dark backgrounds
    text: {
      primary: "#f8fafc", // Very light gray for primary text
      secondary: "#cbd5e1", // Light gray for secondary text
      tertiary: "#94a3b8", // Medium gray for tertiary text
      inverse: "#0f172a", // Dark text for light backgrounds
      accent: "#60a5fa", // Light blue for accent text
      disabled: "#64748b", // Medium gray for disabled text
      placeholder: "#64748b", // Medium gray for placeholder text
    },

    // Border colors - Subtle borders that work on dark backgrounds
    border: {
      primary: "#334155", // Medium dark gray for primary borders
      secondary: "#475569", // Medium gray for secondary borders
      accent: "#60a5fa", // Light blue for accent borders (focus states)
      error: "#f87171", // Light red for error borders
      success: "#34d399", // Light green for success borders
      warning: "#fbbf24", // Light orange for warning borders
      info: "#60a5fa", // Light blue for info borders
    },

    // Interactive colors - Bright, accessible interactive elements
    interactive: {
      primary: "#60a5fa", // Light blue for primary actions
      primaryHover: "#93c5fd", // Lighter blue for hover states
      primaryPressed: "#3b82f6", // Darker blue for pressed states
      secondary: "#94a3b8", // Medium gray for secondary actions
      secondaryHover: "#cbd5e1", // Light gray for hover states
      secondaryPressed: "#e2e8f0", // Very light gray for pressed states
      disabled: "#334155", // Dark gray for disabled elements
      disabledText: "#64748b", // Medium gray for disabled text
    },

    // Status colors - Bright status indicators for dark backgrounds
    status: {
      success: "#34d399", // Light green for success states
      successLight: "#064e3b", // Dark green for success backgrounds
      warning: "#fbbf24", // Light orange for warning states
      warningLight: "#451a03", // Dark orange for warning backgrounds
      error: "#f87171", // Light red for error states
      errorLight: "#450a0a", // Dark red for error backgrounds
      info: "#60a5fa", // Light blue for info states
      infoLight: "#1e3a8a", // Dark blue for info backgrounds
    },

    // Component-specific colors - Tailored for dark theme UI components
    components: {
      button: {
        primary: "#60a5fa", // Light blue for primary buttons
        primaryHover: "#93c5fd", // Lighter blue for hover
        secondary: "#94a3b8", // Medium gray for secondary buttons
        secondaryHover: "#cbd5e1", // Light gray for hover
        outline: "transparent", // Transparent for outline buttons
        outlineBorder: "#334155", // Dark gray border for outline buttons
      },
      card: {
        background: "#1e293b", // Dark gray background for cards
        border: "#334155", // Medium dark gray border for cards
        shadow: "#000000", // Black shadow for cards
      },
      input: {
        background: "#1e293b", // Dark gray background for inputs
        border: "#334155", // Medium dark gray border for inputs
        borderFocus: "#60a5fa", // Light blue border for focused inputs
        placeholder: "#64748b", // Medium gray for placeholder text
      },
    },
  },
};
