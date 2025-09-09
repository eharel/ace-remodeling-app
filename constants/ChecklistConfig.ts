/**
 * Configuration constants for the Meeting Checklist feature
 * Single source of truth for all checklist-related values
 */

export const CHECKLIST_CONFIG = {
  // Checklist content
  ITEM_COUNT: 7,
  ITEMS: [
    "Introduce company overview",
    "Show similar past projects",
    "Discuss timeline & budget",
    "Review material options",
    "Address client concerns",
    "Explain next steps",
    "Schedule follow-up",
  ] as const,

  // Floating Action Button (FAB) configuration
  FAB: {
    SIZE: 56,
    BOTTOM_OFFSET: 100, // Position above tab bar
    RIGHT_OFFSET: 20,
    ICON_SIZE: 24,
    BORDER_RADIUS: 28, // Half of size for perfect circle
    ELEVATION: 8,
    SHADOW_OFFSET: { width: 0, height: 4 },
    SHADOW_OPACITY: 0.3,
    SHADOW_RADIUS: 8,
    Z_INDEX: 1000,
  },

  // Modal configuration
  MODAL: {
    MAX_WIDTH: 500,
    MAX_HEIGHT_PERCENT: 70,
    MIN_HEIGHT: 500,
    BORDER_RADIUS: 12,
    BORDER_WIDTH: 1,
    OVERLAY_OPACITY: 0.5,
    ANIMATION_TYPE: "slide" as const,
  },

  // Header configuration
  HEADER: {
    PADDING: 20,
    BORDER_BOTTOM_WIDTH: 1,
    TITLE_FONT_SIZE: 20,
    TITLE_FONT_WEIGHT: "600" as const,
    TITLE_MARGIN_BOTTOM: 4,
    PROGRESS_FONT_SIZE: 14,
    PROGRESS_FONT_WEIGHT: "500" as const,
    ACTIONS_GAP: 12,
    RESET_BUTTON_PADDING: 4,
    RESET_ICON_SIZE: 20,
    CLOSE_ICON_SIZE: 24,
  },

  // Body configuration
  BODY: {
    PADDING: 20,
  },

  // Checklist item configuration
  ITEM: {
    PADDING_VERTICAL: 12,
    PADDING_HORIZONTAL: 4,
    ICON_SIZE: 24,
    TEXT_FONT_SIZE: 16,
    TEXT_MARGIN_LEFT: 12,
    CHECKED_OPACITY: 0.6,
    ACTIVE_OPACITY: 0.7,
  },

  // Alert configuration
  ALERT: {
    TITLE: "Reset Checklist",
    MESSAGE: "Reset checklist for new meeting?",
    CANCEL_TEXT: "Cancel",
    RESET_TEXT: "Reset",
    CANCELABLE: true,
  },
} as const;

// Type exports for better TypeScript support
export type ChecklistItem = (typeof CHECKLIST_CONFIG.ITEMS)[number];
export type ChecklistItems = readonly ChecklistItem[];
