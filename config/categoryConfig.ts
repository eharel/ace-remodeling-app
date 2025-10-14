// Define the category keys we support
export type CategoryKey = "bathroom" | "kitchen";

// Configuration for each category
export const CATEGORY_CONFIG: Record<
  CategoryKey,
  {
    title: string;
    subtitle: string;
    galleryTitle: string;
    gallerySubtitle: string;
    emptyIcon: string;
    emptyTitle: string;
    emptyMessage: string;
  }
> = {
  bathroom: {
    title: "Bathroom Projects",
    subtitle: "Transform your bathroom with our expert remodeling services",
    galleryTitle: "Featured Bathroom Renovations",
    gallerySubtitle: "See our latest bathroom transformation projects",
    emptyIcon: "bathtub",
    emptyTitle: "No Bathroom Projects Yet",
    emptyMessage:
      "We haven't completed any bathroom renovation projects yet. Check back soon for our latest work!",
  },
  kitchen: {
    title: "Kitchen Projects",
    subtitle: "Transform your kitchen with our expert remodeling services",
    galleryTitle: "Featured Kitchen Renovations",
    gallerySubtitle: "See our latest kitchen transformation projects",
    emptyIcon: "kitchen",
    emptyTitle: "No Kitchen Projects Yet",
    emptyMessage:
      "We haven't completed any kitchen renovation projects yet. Check back soon for our latest work!",
  },
};

// Helper function to get category config
export function getCategoryConfig(category: CategoryKey) {
  return CATEGORY_CONFIG[category];
}

// Type guard to check if a string is a valid category key
export function isValidCategoryKey(category: string): category is CategoryKey {
  return category in CATEGORY_CONFIG;
}
