import { PROJECT_CATEGORIES, ProjectCategory } from "../types/Category";

// Use centralized category types instead of duplicating
export type CategoryKey = ProjectCategory;

/**
 * Configuration interface for category settings
 *
 * Each category must have complete configuration for display across the app.
 * The `internal` flag prevents categories from appearing in client-facing areas.
 */
export interface CategoryConfig {
  title: string;
  subtitle: string;
  galleryTitle: string;
  gallerySubtitle: string;
  emptyIcon: string;
  emptyTitle: string;
  emptyMessage: string;
  /**
   * Internal flag - if true, category won't appear in Showcase or public areas
   * Used for management tools, templates, and other internal categories
   */
  internal?: boolean;
  /**
   * Display order for consistent category ordering
   * Lower numbers appear first
   */
  order?: number;
}

/**
 * Configuration for each category
 *
 * IMPORTANT: Keys MUST match Firestore database values exactly (kebab-case).
 * This is the single source of truth for category metadata across the app.
 *
 * Categories are ordered by importance/frequency:
 * 1. bathroom - Most common remodel type
 * 2. kitchen - Most common remodel type
 * 3. full-home - Complete renovations
 * 4. adu-addition - Growing category
 * 5. outdoor-living - Popular specialty
 * 6. new-construction - Major projects
 * 7. commercial - Business projects
 * 8. miscellaneous - Catch-all for unique projects
 * 9. management-tools - Internal only
 *
 * To add a new category:
 * 1. Add to PROJECT_CATEGORIES in types/Category.ts
 * 2. Add configuration here
 * 3. TypeScript will enforce proper usage throughout the app
 *
 * The `internal` flag prevents categories from appearing in client-facing
 * areas like the Showcase tab, even if projects are marked as featured.
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
    order: 1,
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
    order: 2,
  },
  [PROJECT_CATEGORIES.FULL_HOME]: {
    title: "Full Home Renovations",
    subtitle: "Complete home transformations from top to bottom",
    galleryTitle: "Featured Full Home Renovations",
    gallerySubtitle: "See our complete home transformation projects",
    emptyIcon: "home",
    emptyTitle: "No Full Home Projects Yet",
    emptyMessage:
      "We haven't completed any full home renovation projects yet. Check back soon for our latest work!",
    order: 3,
  },
  [PROJECT_CATEGORIES.ADU_ADDITION]: {
    title: "ADUs & Additions",
    subtitle:
      "Expand your living space with accessory dwelling units and additions",
    galleryTitle: "Featured ADUs & Additions",
    gallerySubtitle: "See our space expansion projects",
    emptyIcon: "home-work",
    emptyTitle: "No ADU/Addition Projects Yet",
    emptyMessage:
      "We haven't completed any ADU or addition projects yet. Check back soon for our latest work!",
    order: 4,
  },
  [PROJECT_CATEGORIES.OUTDOOR_LIVING]: {
    title: "Outdoor Living Projects",
    subtitle: "Transform your outdoor space into a living oasis",
    galleryTitle: "Featured Outdoor Living Projects",
    gallerySubtitle: "See our outdoor transformation projects",
    emptyIcon: "yard",
    emptyTitle: "No Outdoor Projects Yet",
    emptyMessage:
      "We haven't completed any outdoor living projects yet. Check back soon for our latest work!",
    order: 5,
  },
  [PROJECT_CATEGORIES.NEW_CONSTRUCTION]: {
    title: "New Construction Projects",
    subtitle: "Ground-up construction projects built to your vision",
    galleryTitle: "Featured New Construction Projects",
    gallerySubtitle: "See our new build projects",
    emptyIcon: "foundation",
    emptyTitle: "No New Construction Projects Yet",
    emptyMessage:
      "We haven't completed any new construction projects yet. Check back soon for our latest work!",
    order: 6,
  },
  [PROJECT_CATEGORIES.COMMERCIAL]: {
    title: "Commercial Projects",
    subtitle: "Professional remodeling services for business spaces",
    galleryTitle: "Featured Commercial Projects",
    gallerySubtitle: "See our commercial transformation projects",
    emptyIcon: "business",
    emptyTitle: "No Commercial Projects Yet",
    emptyMessage:
      "We haven't completed any commercial projects yet. Check back soon for our latest work!",
    order: 7,
  },
  [PROJECT_CATEGORIES.MISCELLANEOUS]: {
    title: "Other Projects",
    subtitle: "Unique projects and specialized services",
    galleryTitle: "Featured Projects",
    gallerySubtitle: "See our diverse project portfolio",
    emptyIcon: "folder",
    emptyTitle: "No Projects Yet",
    emptyMessage:
      "We haven't completed any projects in this category yet. Check back soon for our latest work!",
    order: 8,
  },
  [PROJECT_CATEGORIES.MANAGEMENT_TOOLS]: {
    title: "Management Tools",
    subtitle: "Internal project management and documentation",
    galleryTitle: "Management Projects",
    gallerySubtitle: "Internal use only",
    emptyIcon: "build",
    emptyTitle: "No Management Projects",
    emptyMessage: "Internal category for management tools and templates.",
    internal: true,
    order: 9,
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
