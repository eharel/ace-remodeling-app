/**
 * Project category constants for type safety and consistency
 */
export const PROJECT_CATEGORIES = {
  BATHROOM: "bathroom",
  KITCHEN: "kitchen",
  GENERAL_REMODELING: "general-remodeling",
  OUTDOOR: "outdoor",
  BASEMENT: "basement",
  ATTIC: "attic",
} as const;

/**
 * Type-safe project category type
 */
export type ProjectCategory =
  (typeof PROJECT_CATEGORIES)[keyof typeof PROJECT_CATEGORIES];

/**
 * Human-readable labels for project categories
 * Maps category keys to display-friendly text
 */
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  [PROJECT_CATEGORIES.BATHROOM]: "Bathroom",
  [PROJECT_CATEGORIES.KITCHEN]: "Kitchen",
  [PROJECT_CATEGORIES.GENERAL_REMODELING]: "General Remodeling",
  [PROJECT_CATEGORIES.OUTDOOR]: "Outdoor",
  [PROJECT_CATEGORIES.BASEMENT]: "Basement",
  [PROJECT_CATEGORIES.ATTIC]: "Attic",
};
