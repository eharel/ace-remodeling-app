import { PROJECT_CATEGORIES, ProjectCategory } from "@/types/Category";

// Use centralized category types instead of duplicating
export type CategoryKey = ProjectCategory;

/**
 * Configuration interface for category settings
 */
export interface CategoryConfig {
  title: string;
  subtitle: string;
  galleryTitle: string;
  gallerySubtitle: string;
  emptyIcon: string;
  emptyTitle: string;
  emptyMessage: string;
}

/**
 * Configuration for each category
 * Uses centralized category constants for consistency
 * Satisfies ensures all categories have complete config
 */
export const CATEGORY_CONFIG = {
  [PROJECT_CATEGORIES.BATHROOM]: {
    title: "Bathroom Projects",
    subtitle: "Transform your bathroom with our expert remodeling services",
    galleryTitle: "Featured Bathroom Renovations",
    gallerySubtitle: "See our latest bathroom transformation projects",
    emptyIcon: "bathtub",
    emptyTitle: "No Bathroom Projects Yet",
    emptyMessage:
      "We haven't completed any bathroom renovation projects yet. Check back soon for our latest work!",
  },
  [PROJECT_CATEGORIES.KITCHEN]: {
    title: "Kitchen Projects",
    subtitle: "Transform your kitchen with our expert remodeling services",
    galleryTitle: "Featured Kitchen Renovations",
    gallerySubtitle: "See our latest kitchen transformation projects",
    emptyIcon: "kitchen",
    emptyTitle: "No Kitchen Projects Yet",
    emptyMessage:
      "We haven't completed any kitchen renovation projects yet. Check back soon for our latest work!",
  },
  [PROJECT_CATEGORIES.GENERAL_REMODELING]: {
    title: "General Remodeling Projects",
    subtitle: "Transform your home with our expert remodeling services",
    galleryTitle: "Featured Remodeling Projects",
    gallerySubtitle: "See our latest home transformation projects",
    emptyIcon: "build",
    emptyTitle: "No Remodeling Projects Yet",
    emptyMessage:
      "We haven't completed any general remodeling projects yet. Check back soon for our latest work!",
  },
  [PROJECT_CATEGORIES.OUTDOOR]: {
    title: "Outdoor Projects",
    subtitle: "Transform your outdoor space with our expert services",
    galleryTitle: "Featured Outdoor Projects",
    gallerySubtitle: "See our latest outdoor transformation projects",
    emptyIcon: "yard",
    emptyTitle: "No Outdoor Projects Yet",
    emptyMessage:
      "We haven't completed any outdoor projects yet. Check back soon for our latest work!",
  },
  [PROJECT_CATEGORIES.BASEMENT]: {
    title: "Basement Projects",
    subtitle: "Transform your basement with our expert remodeling services",
    galleryTitle: "Featured Basement Renovations",
    gallerySubtitle: "See our latest basement transformation projects",
    emptyIcon: "basement",
    emptyTitle: "No Basement Projects Yet",
    emptyMessage:
      "We haven't completed any basement renovation projects yet. Check back soon for our latest work!",
  },
  [PROJECT_CATEGORIES.ATTIC]: {
    title: "Attic Projects",
    subtitle: "Transform your attic with our expert remodeling services",
    galleryTitle: "Featured Attic Renovations",
    gallerySubtitle: "See our latest attic transformation projects",
    emptyIcon: "attic",
    emptyTitle: "No Attic Projects Yet",
    emptyMessage:
      "We haven't completed any attic renovation projects yet. Check back soon for our latest work!",
  },
} satisfies Record<CategoryKey, CategoryConfig>;

/**
 * Get category configuration
 * Direct access - no need for wrapper function
 */
export const getCategoryConfig = (category: CategoryKey) =>
  CATEGORY_CONFIG[category];

/**
 * Type guard to check if a string is a valid category key
 * Uses centralized validation from types
 */
export function isValidCategoryKey(category: string): category is CategoryKey {
  return category in PROJECT_CATEGORIES;
}
