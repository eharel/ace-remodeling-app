import { ProjectCategory } from "@/types/Category";

/**
 * Get the display name for a category
 */
export function getCategoryDisplayName(category: ProjectCategory): string {
  const names: Record<ProjectCategory, string> = {
    bathroom: "Bathrooms",
    kitchen: "Kitchens",
    deck: "Decks",
    pool: "Pools",
    "full-house": "Full House",
    "general-remodeling": "General Remodeling",
    outdoor: "Outdoor",
    basement: "Basement",
    attic: "Attic",
  };
  return names[category] || category;
}

/**
 * Get the icon name for a category
 */
export function getCategoryIcon(category: ProjectCategory): string {
  const icons: Record<ProjectCategory, string> = {
    bathroom: "bathroom",
    kitchen: "kitchen",
    deck: "deck",
    pool: "pool",
    "full-house": "home",
    "general-remodeling": "build",
    outdoor: "yard",
    basement: "basement",
    attic: "attic",
  };
  return icons[category] || "folder";
}

/**
 * Get all available categories
 */
export function getAllCategories(): ProjectCategory[] {
  return [
    "bathroom",
    "kitchen",
    "deck",
    "pool",
    "full-house",
    "general-remodeling",
    "outdoor",
    "basement",
    "attic",
  ];
}
