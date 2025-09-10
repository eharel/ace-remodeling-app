/**
 * Configuration constants for the Meeting Checklist feature
 * Business logic and content only - styling values moved to DesignTokens
 */

export const CHECKLIST_CONFIG = {
  // Checklist content - the actual meeting agenda items
  ITEMS: [
    "Introduce company overview",
    "Show similar past projects",
    "Discuss timeline & budget",
    "Review material options",
    "Address client concerns",
    "Explain next steps",
    "Schedule follow-up",
  ] as const,

  // Business behavior configuration
  BEHAVIOR: {
    // Should the checklist state persist between app sessions?
    PERSIST_STATE: true,

    // Should progress be automatically saved as user checks items?
    AUTO_SAVE: true,

    // Should the progress percentage be displayed in the header?
    SHOW_PROGRESS: true,

    // Should the FAB be visible on all screens or only specific ones?
    FAB_VISIBILITY: "all" as const, // "all" | "specific" | "none"

    // Should the modal close when all items are completed?
    AUTO_CLOSE_ON_COMPLETION: false,

    // Should there be haptic feedback when checking items?
    HAPTIC_FEEDBACK: true,
  },

  // Feature flags for future functionality
  FEATURES: {
    // Enable checklist customization (add/remove items)
    CUSTOMIZATION_ENABLED: false,

    // Enable checklist sharing between team members
    SHARING_ENABLED: false,

    // Enable checklist templates for different meeting types
    TEMPLATES_ENABLED: false,
  },
} as const;

// Type exports for better TypeScript support
export type ChecklistItem = (typeof CHECKLIST_CONFIG.ITEMS)[number];
export type ChecklistItems = readonly ChecklistItem[];
