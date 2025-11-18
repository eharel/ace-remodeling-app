/**
 * Core project categories that appear in main navigation.
 * These are the primary categories users browse.
 * 
 * IMPORTANT: Values MUST match Firestore database (kebab-case).
 * 
 * Note: MANAGEMENT_TOOLS has been removed and will become a StandaloneCollection.
 */
export const CORE_CATEGORIES = {
  BATHROOM: "bathroom",
  KITCHEN: "kitchen",
  FULL_HOME: "full-home",
  ADU_ADDITION: "adu-addition",
  OUTDOOR_LIVING: "outdoor-living",
  NEW_CONSTRUCTION: "new-construction",
  COMMERCIAL: "commercial",
  MISCELLANEOUS: "miscellaneous",
} as const;

/**
 * Type-safe core category type derived from CORE_CATEGORIES
 */
export type CoreCategory = (typeof CORE_CATEGORIES)[keyof typeof CORE_CATEGORIES];

/**
 * Component category can be any core category OR a custom string.
 * 
 * This allows flexibility for one-off components like 'home-theater', 'study-room', etc.
 * Core categories are type-checked, while custom categories provide flexibility
 * for unique project components that don't fit standard classifications.
 */
export type ComponentCategory = CoreCategory | string;

/**
 * Subcategory constants for ADU/Addition projects
 * 
 * Used to further classify projects under the ADU_ADDITION core category.
 */
export const COMPONENT_SUBCATEGORIES = {
  ADU: "adu",
  ADDITION: "addition",
} as const;

/**
 * Type-safe component subcategory type
 */
export type ComponentSubcategory =
  (typeof COMPONENT_SUBCATEGORIES)[keyof typeof COMPONENT_SUBCATEGORIES];

/**
 * Human-readable display labels for core categories
 * 
 * Maps core category keys to user-friendly text for UI display.
 */
export const CORE_CATEGORY_LABELS: Record<CoreCategory, string> = {
  [CORE_CATEGORIES.BATHROOM]: "Bathrooms",
  [CORE_CATEGORIES.KITCHEN]: "Kitchens",
  [CORE_CATEGORIES.FULL_HOME]: "Full Home Renovations",
  [CORE_CATEGORIES.ADU_ADDITION]: "ADUs & Additions",
  [CORE_CATEGORIES.OUTDOOR_LIVING]: "Outdoor Living",
  [CORE_CATEGORIES.NEW_CONSTRUCTION]: "New Construction",
  [CORE_CATEGORIES.COMMERCIAL]: "Commercial Projects",
  [CORE_CATEGORIES.MISCELLANEOUS]: "Other Projects",
};

/**
 * Human-readable display labels for component subcategories
 */
export const SUBCATEGORY_LABELS: Record<ComponentSubcategory, string> = {
  [COMPONENT_SUBCATEGORIES.ADU]: "ADU",
  [COMPONENT_SUBCATEGORIES.ADDITION]: "Addition",
};

/**
 * Type guard to check if a category is a core category
 * 
 * Provides type narrowing from ComponentCategory (string) to CoreCategory (literal union).
 * Use this to distinguish between core navigation categories and custom one-off categories.
 * 
 * @param category - The category string to check
 * @returns True if the category is a core category, false for custom categories
 */
export function isCoreCategory(category: string): category is CoreCategory {
  return Object.values(CORE_CATEGORIES).includes(category as CoreCategory);
}

/**
 * Get display label for any component category
 * 
 * Returns formatted label for core categories from CORE_CATEGORY_LABELS,
 * or converts custom categories to Title Case (e.g., "home-theater" → "Home Theater").
 * 
 * @param category - The component category (core or custom)
 * @returns Human-readable display label
 */
export function getCategoryLabel(category: ComponentCategory): string {
  // Check if it's a core category with a predefined label
  if (isCoreCategory(category)) {
    return CORE_CATEGORY_LABELS[category];
  }

  // Custom category: convert kebab-case to Title Case
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

