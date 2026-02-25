import { z } from "zod";

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
  DESIGN_DEVELOPMENT: "design-&-development",
  MISCELLANEOUS: "miscellaneous",
} as const;

export type CoreCategory =
  (typeof CORE_CATEGORIES)[keyof typeof CORE_CATEGORIES];

const coreCategoryValues = Object.values(CORE_CATEGORIES);
export const CoreCategorySchema = z.enum(
  coreCategoryValues as [CoreCategory, ...CoreCategory[]]
);

/**
 * Component category can be any core category OR a custom string.
 *
 * This allows flexibility for one-off components like 'home-theater', 'study-room', etc.
 * Core categories are type-checked, while custom categories provide flexibility
 * for unique project components that don't fit standard classifications.
 */
export type ComponentCategory = CoreCategory | string;

/**
 * Common subcategories by category
 *
 * These are displayed as quick-select buttons in the UI.
 * Users can also enter custom subcategories via text input.
 *
 * Only categories with meaningful, commonly-used subcategories are included.
 * Categories not in this map simply won't show predefined subcategory options.
 */
export const COMMON_SUBCATEGORIES: Partial<
  Record<CoreCategory, { value: string; label: string }[]>
> = {
  [CORE_CATEGORIES.ADU_ADDITION]: [
    { value: "adu", label: "ADU" },
    { value: "addition", label: "Addition" },
  ],
  [CORE_CATEGORIES.OUTDOOR_LIVING]: [
    { value: "pool", label: "Pool" },
    { value: "deck", label: "Deck" },
    { value: "patio", label: "Patio" },
    { value: "pergola", label: "Pergola" },
    { value: "outdoor-kitchen", label: "Outdoor Kitchen" },
  ],
};

/**
 * @deprecated Use COMMON_SUBCATEGORIES instead.
 * Kept for backwards compatibility.
 */
export const COMPONENT_SUBCATEGORIES = {
  ADU: "adu",
  ADDITION: "addition",
} as const;

/**
 * Type-safe component subcategory type
 *
 * Subcategories provide additional classification within a category.
 * Unlike category, subcategories are fully flexible - any string is valid.
 *
 * EXAMPLES:
 * - ADU/Addition category: subcategory "adu" or "addition"
 * - Outdoor category: subcategory "pool", "deck", "patio", "pergola", etc.
 * - Most categories: no subcategory (undefined)
 *
 * The COMPONENT_SUBCATEGORIES constant documents common values but does not
 * restrict what values are allowed.
 */
export type ComponentSubcategory = string;

/**
 * Human-readable display labels for core categories
 *
 * Maps core category keys to user-friendly text for UI display.
 * Used for component tabs and other UI elements where singular form is preferred.
 */
export const CORE_CATEGORY_LABELS: Record<CoreCategory, string> = {
  [CORE_CATEGORIES.BATHROOM]: "Bathroom",
  [CORE_CATEGORIES.KITCHEN]: "Kitchen",
  [CORE_CATEGORIES.FULL_HOME]: "Full Home",
  [CORE_CATEGORIES.ADU_ADDITION]: "ADU-Addition",
  [CORE_CATEGORIES.OUTDOOR_LIVING]: "Outdoor",
  [CORE_CATEGORIES.NEW_CONSTRUCTION]: "New Construction",
  [CORE_CATEGORIES.COMMERCIAL]: "Commercial",
  [CORE_CATEGORIES.DESIGN_DEVELOPMENT]: "Design & Development",
  [CORE_CATEGORIES.MISCELLANEOUS]: "Other",
};

/**
 * Human-readable display labels for common subcategories
 *
 * For subcategories not in this map, use getSubcategoryLabel() to format
 * the subcategory string (kebab-case to Title Case).
 */
export const SUBCATEGORY_LABELS: Record<string, string> = {
  [COMPONENT_SUBCATEGORIES.ADU]: "ADU",
  [COMPONENT_SUBCATEGORIES.ADDITION]: "Addition",
};

/**
 * Get display label for a subcategory
 *
 * Returns predefined label if available, otherwise formats the subcategory
 * string from kebab-case to Title Case.
 *
 * @param subcategory - The subcategory string
 * @returns Human-readable display label
 *
 * @example
 * getSubcategoryLabel("adu") // "ADU"
 * getSubcategoryLabel("pool") // "Pool"
 * getSubcategoryLabel("bbq-island") // "BBQ Island"
 */
export function getSubcategoryLabel(subcategory: string): string {
  // Check if we have a predefined label
  if (subcategory in SUBCATEGORY_LABELS) {
    return SUBCATEGORY_LABELS[subcategory];
  }

  // Otherwise, format kebab-case to Title Case
  return subcategory
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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
