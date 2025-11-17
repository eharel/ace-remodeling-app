/**
 * Project category constants for type safety and consistency
 * 
 * IMPORTANT: These keys MUST match Firestore database values exactly (kebab-case).
 * This is the single source of truth for all project categories.
 * 
 * Categories are ordered by importance/frequency for consistent display ordering.
 */
export const PROJECT_CATEGORIES = {
  BATHROOM: "bathroom",
  KITCHEN: "kitchen",
  FULL_HOME: "full-home",
  ADU_ADDITION: "adu-addition",
  OUTDOOR_LIVING: "outdoor-living",
  NEW_CONSTRUCTION: "new-construction",
  COMMERCIAL: "commercial",
  MISCELLANEOUS: "miscellaneous",
  MANAGEMENT_TOOLS: "management-tools",
} as const;

/**
 * Type-safe project category type
 */
export type ProjectCategory =
  (typeof PROJECT_CATEGORIES)[keyof typeof PROJECT_CATEGORIES];

/**
 * Subcategory for ADU/Addition projects
 */
export const PROJECT_SUBCATEGORIES = {
  ADU: "adu",
  ADDITION: "addition",
} as const;

/**
 * Type-safe project subcategory type
 */
export type ProjectSubcategory =
  (typeof PROJECT_SUBCATEGORIES)[keyof typeof PROJECT_SUBCATEGORIES];

/**
 * Human-readable labels for project categories
 * Maps category keys to display-friendly text
 */
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  [PROJECT_CATEGORIES.BATHROOM]: "Bathrooms",
  [PROJECT_CATEGORIES.KITCHEN]: "Kitchens",
  [PROJECT_CATEGORIES.FULL_HOME]: "Full Home Renovations",
  [PROJECT_CATEGORIES.ADU_ADDITION]: "ADUs & Additions",
  [PROJECT_CATEGORIES.OUTDOOR_LIVING]: "Outdoor Living",
  [PROJECT_CATEGORIES.NEW_CONSTRUCTION]: "New Construction",
  [PROJECT_CATEGORIES.COMMERCIAL]: "Commercial Projects",
  [PROJECT_CATEGORIES.MISCELLANEOUS]: "Other Projects",
  [PROJECT_CATEGORIES.MANAGEMENT_TOOLS]: "Management Tools",
};

/**
 * Human-readable labels for project subcategories
 */
export const SUBCATEGORY_LABELS: Record<ProjectSubcategory, string> = {
  [PROJECT_SUBCATEGORIES.ADU]: "ADU",
  [PROJECT_SUBCATEGORIES.ADDITION]: "Addition",
};

/**
 * Type guard to check if a string is a valid ProjectCategory
 */
export function isValidProjectCategory(
  category: string
): category is ProjectCategory {
  return category in PROJECT_CATEGORIES;
}
