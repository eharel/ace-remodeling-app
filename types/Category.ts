export const PROJECT_CATEGORIES = [
  "bathroom",
  "kitchen",
  "general-remodeling",
  "outdoor",
  "basement",
  "attic",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  bathroom: "Bathroom",
  kitchen: "Kitchen",
  "general-remodeling": "General Remodeling",
  outdoor: "Outdoor",
  basement: "Basement",
  attic: "Attic",
};
