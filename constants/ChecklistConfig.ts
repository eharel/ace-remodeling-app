/**
 * Configuration constants for the Meeting Checklist feature
 * Business logic and content only - styling values moved to DesignTokens
 */

/**
 * Checklist behavior configuration interface
 */
export interface ChecklistBehavior {
  /** Should the checklist state persist between app sessions? */
  PERSIST_STATE: boolean;
  /** Should progress be automatically saved as user checks items? */
  AUTO_SAVE: boolean;
  /** Should the progress percentage be displayed in the header? */
  SHOW_PROGRESS: boolean;
  /** Should the FAB be visible on all screens or only specific ones? */
  FAB_VISIBILITY: "all" | "specific" | "none";
  /** Should the modal close when all items are completed? */
  AUTO_CLOSE_ON_COMPLETION: boolean;
  /** Should there be haptic feedback when checking items? */
  HAPTIC_FEEDBACK: boolean;
}

/**
 * Feature flags interface for future functionality
 */
export interface ChecklistFeatures {
  /** Enable checklist customization (add/remove items) */
  CUSTOMIZATION_ENABLED: boolean;
  /** Enable checklist sharing between team members */
  SHARING_ENABLED: boolean;
  /** Enable checklist templates for different meeting types */
  TEMPLATES_ENABLED: boolean;
}

/**
 * Main checklist configuration
 * Uses satisfies for type safety and better autocomplete
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
    PERSIST_STATE: true,
    AUTO_SAVE: true,
    SHOW_PROGRESS: true,
    FAB_VISIBILITY: "all" as const,
    AUTO_CLOSE_ON_COMPLETION: false,
    HAPTIC_FEEDBACK: true,
  } satisfies ChecklistBehavior,

  // Feature flags for future functionality
  FEATURES: {
    CUSTOMIZATION_ENABLED: false,
    SHARING_ENABLED: false,
    TEMPLATES_ENABLED: false,
  } satisfies ChecklistFeatures,
} as const;

// Type exports for better TypeScript support
export type ChecklistItem = (typeof CHECKLIST_CONFIG.ITEMS)[number];
export type ChecklistItems = readonly ChecklistItem[];
