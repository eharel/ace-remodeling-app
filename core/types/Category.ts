/**
 * Project category constants for type safety and consistency
 */
export const PROJECT_CATEGORIES = {
  KITCHEN: "kitchen",
  BATHROOM: "bathroom",
  FULL_HOME: "full-home",
  ADU_ADDITION: "adu-addition",
  OUTDOOR: "outdoor",
  POOLS: "pools",
  COMMERCIAL: "commercial",
  NEW_CONSTRUCTION: "new-construction",
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
  [PROJECT_CATEGORIES.KITCHEN]: "Kitchen",
  [PROJECT_CATEGORIES.BATHROOM]: "Bathroom",
  [PROJECT_CATEGORIES.FULL_HOME]: "Full Home",
  [PROJECT_CATEGORIES.ADU_ADDITION]: "ADU/Addition",
  [PROJECT_CATEGORIES.OUTDOOR]: "Outdoor Living",
  [PROJECT_CATEGORIES.POOLS]: "Pools",
  [PROJECT_CATEGORIES.COMMERCIAL]: "Commercial",
  [PROJECT_CATEGORIES.NEW_CONSTRUCTION]: "New Construction",
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
