import {
  CORE_CATEGORIES,
  CoreCategory,
  ComponentCategory,
  getCategoryLabel,
} from "@/core/types/ComponentCategory";

/**
 * Get the display name for a category
 * Uses the centralized category labels from types
 */
export function getCategoryDisplayName(category: ComponentCategory): string {
  return getCategoryLabel(category);
}

/**
 * Get the icon name for a category
 * Uses Material Icons names for React Native
 */
export function getCategoryIcon(category: ComponentCategory): string {
  const icons: Record<CoreCategory, string> = {
    [CORE_CATEGORIES.BATHROOM]: "bathroom",
    [CORE_CATEGORIES.KITCHEN]: "kitchen",
    [CORE_CATEGORIES.FULL_HOME]: "home",
    [CORE_CATEGORIES.ADU_ADDITION]: "home-work",
    [CORE_CATEGORIES.OUTDOOR_LIVING]: "yard",
    [CORE_CATEGORIES.NEW_CONSTRUCTION]: "foundation",
    [CORE_CATEGORIES.COMMERCIAL]: "business",
    [CORE_CATEGORIES.MISCELLANEOUS]: "folder",
  };
  
  // Check if it's a core category
  if (Object.values(CORE_CATEGORIES).includes(category as CoreCategory)) {
    return icons[category as CoreCategory] || "folder";
  }
  
  // Default icon for custom categories
  return "folder";
}

/**
 * Get all available core categories
 * Uses the centralized category constants from types
 */
export function getAllCategories(): CoreCategory[] {
  return Object.values(CORE_CATEGORIES);
}
