import {
  CATEGORY_LABELS,
  PROJECT_CATEGORIES,
  ProjectCategory,
} from "@/core/types/Category";

/**
 * Get the display name for a category
 * Uses the centralized category labels from types
 */
export function getCategoryDisplayName(category: ProjectCategory): string {
  return CATEGORY_LABELS[category] || category;
}

/**
 * Get the icon name for a category
 */
export function getCategoryIcon(category: ProjectCategory): string {
  const icons: Record<ProjectCategory, string> = {
    [PROJECT_CATEGORIES.KITCHEN]: "kitchen",
    [PROJECT_CATEGORIES.BATHROOM]: "bathroom",
    [PROJECT_CATEGORIES.FULL_HOME]: "home",
    [PROJECT_CATEGORIES.ADU_ADDITION]: "home-work",
    [PROJECT_CATEGORIES.OUTDOOR]: "yard",
    [PROJECT_CATEGORIES.POOLS]: "pool",
  };
  return icons[category] || "folder";
}

/**
 * Get all available categories
 * Uses the centralized category constants from types
 */
export function getAllCategories(): ProjectCategory[] {
  return Object.values(PROJECT_CATEGORIES);
}
