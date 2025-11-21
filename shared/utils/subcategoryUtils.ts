import { Project, ProjectSummary } from "@/core/types";
import {
  ComponentCategory,
  CORE_CATEGORIES,
  getSubcategoryLabel,
} from "@/core/types/ComponentCategory";

/**
 * Normalize category names (e.g., "outdoor" -> "outdoor-living")
 * This handles legacy data where projects may use "outdoor" instead of "outdoor-living"
 */
function normalizeCategory(category: string): ComponentCategory {
  if (category === "outdoor") {
    return CORE_CATEGORIES.OUTDOOR_LIVING;
  }
  return category as ComponentCategory;
}

/**
 * Extract unique subcategories from projects that match a specific category
 *
 * Returns array starting with 'all', followed by unique subcategory values
 * sorted alphabetically by their display labels.
 *
 * @param projects - Array of projects to extract subcategories from
 * @param category - Category to filter components by
 * @returns Array of unique subcategories with 'all' as first option
 *
 * @example
 * const projects = [
 *   { components: [{ category: 'outdoor-living', subcategory: 'pool' }] },
 *   { components: [{ category: 'outdoor-living', subcategory: 'deck' }] },
 *   { components: [{ category: 'outdoor-living', subcategory: 'pool' }] },
 * ];
 * getSubcategories(projects, 'outdoor-living') // ['all', 'deck', 'pool']
 */
export function getSubcategories(
  projects: Project[],
  category: ComponentCategory
): string[] {
  // Extract unique subcategories from components matching the category
  const uniqueSubcategories = Array.from(
    new Set(
      projects.flatMap((project) =>
        project.components
          .filter((component) => {
            const normalizedComponentCategory = normalizeCategory(
              component.category
            );
            return normalizedComponentCategory === category;
          })
          .map((component) => component.subcategory)
          .filter((sub): sub is string => Boolean(sub))
      )
    )
  ).sort((a, b) => {
    // Sort by display label for better UX
    const labelA = getSubcategoryLabel(a);
    const labelB = getSubcategoryLabel(b);
    return labelA.localeCompare(labelB);
  });

  // Always include 'all' as first option
  return ["all", ...uniqueSubcategories];
}

/**
 * Check if a category has meaningful subcategories to display
 *
 * Returns false if:
 * - No subcategories exist
 * - Only one subcategory exists (filtering would be pointless)
 *
 * @param subcategories - Array of subcategories (including 'all')
 * @returns True if filtering UI should be shown
 *
 * @example
 * shouldShowSubcategoryFilter(['all']) // false
 * shouldShowSubcategoryFilter(['all', 'pools']) // false (only 1 real subcategory)
 * shouldShowSubcategoryFilter(['all', 'pools', 'decks']) // true
 */
export function shouldShowSubcategoryFilter(subcategories: string[]): boolean {
  // Need at least 'all' + 2 actual subcategories to justify filtering UI
  return subcategories.length >= 3;
}

/**
 * Filter projects by selected subcategory
 *
 * A project matches if it has at least one component that:
 * 1. Matches the target category
 * 2. Matches the selected subcategory (or any subcategory if 'all' is selected)
 *
 * @param projects - Array of projects to filter
 * @param category - Category to filter by
 * @param selectedSubcategory - Selected subcategory ('all' shows everything)
 * @returns Filtered array of projects
 *
 * @example
 * filterBySubcategory(projects, 'outdoor-living', 'all') // returns all outdoor projects
 * filterBySubcategory(projects, 'outdoor-living', 'pool') // returns only pool projects
 */
export function filterBySubcategory(
  projects: Project[],
  category: ComponentCategory,
  selectedSubcategory: string
): Project[] {
  if (selectedSubcategory === "all") {
    // Return all projects that have at least one component matching the category
    return projects.filter((project) =>
      project.components.some((component) => {
        const normalizedComponentCategory = normalizeCategory(
          component.category
        );
        return normalizedComponentCategory === category;
      })
    );
  }

  // Return projects that have at least one component matching both category and subcategory
  return projects.filter((project) =>
    project.components.some((component) => {
      const normalizedComponentCategory = normalizeCategory(component.category);
      return (
        normalizedComponentCategory === category &&
        component.subcategory === selectedSubcategory
      );
    })
  );
}

/**
 * Get count of projects for a specific subcategory
 *
 * @param projects - Array of projects
 * @param category - Category to filter by
 * @param subcategory - Subcategory to count ('all' returns total count)
 * @returns Number of projects matching subcategory
 */
export function getSubcategoryCount(
  projects: Project[],
  category: ComponentCategory,
  subcategory: string
): number {
  if (subcategory === "all") {
    return projects.filter((project) =>
      project.components.some((component) => {
        const normalizedComponentCategory = normalizeCategory(
          component.category
        );
        return normalizedComponentCategory === category;
      })
    ).length;
  }

  return projects.filter((project) =>
    project.components.some((component) => {
      const normalizedComponentCategory = normalizeCategory(component.category);
      return (
        normalizedComponentCategory === category &&
        component.subcategory === subcategory
      );
    })
  ).length;
}

/**
 * Filter ProjectSummary array by subcategory
 *
 * This is a helper for when working with ProjectSummary instead of full Project objects.
 * Note: ProjectSummary doesn't contain subcategory info, so this filters based on
 * the original projects array and maps back to summaries.
 *
 * @param projectSummaries - Array of project summaries
 * @param projects - Full project objects (for subcategory lookup)
 * @param category - Category to filter by
 * @param selectedSubcategory - Selected subcategory ('all' shows everything)
 * @returns Filtered array of project summaries
 */
export function filterSummariesBySubcategory(
  projectSummaries: ProjectSummary[],
  projects: Project[],
  category: ComponentCategory,
  selectedSubcategory: string
): ProjectSummary[] {
  // Create a map of project IDs to full projects for quick lookup
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Filter summaries based on their corresponding full project's subcategory
  return projectSummaries.filter((summary) => {
    const fullProject = projectMap.get(summary.id);
    if (!fullProject) return false;

    if (selectedSubcategory === "all") {
      return fullProject.components.some((component) => {
        const normalizedComponentCategory = normalizeCategory(
          component.category
        );
        return normalizedComponentCategory === category;
      });
    }

    return fullProject.components.some((component) => {
      const normalizedComponentCategory = normalizeCategory(component.category);
      return (
        normalizedComponentCategory === category &&
        component.subcategory === selectedSubcategory
      );
    });
  });
}
