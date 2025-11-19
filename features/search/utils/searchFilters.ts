import { ComponentCategory } from "@/core/types/ComponentCategory";
import { Project } from "@/core/types/Project";
import { ProjectStatus } from "@/core/types/Status";

/**
 * Pure utility functions for filtering projects
 *
 * These functions are side-effect free and can be easily unit tested.
 * Each function implements OR logic within its filter type.
 */

/**
 * Checks if a project matches any of the selected categories
 *
 * With the new multi-component structure, a project matches if ANY of its
 * components matches any of the selected categories.
 *
 * @param project - Project to check
 * @param categories - Array of selected categories (empty = no filter)
 * @returns true if any component matches any category or no categories selected
 *
 * @example
 * ```typescript
 * filterByCategory(project, ["kitchen", "bathroom"]) // true if any component is kitchen OR bathroom
 * filterByCategory(project, []) // true (no filter)
 * ```
 */
export function filterByCategory(
  project: Project,
  categories: ComponentCategory[]
): boolean {
  if (categories.length === 0) {
    return true; // No filter applied
  }
  // Check if any component matches any selected category
  return project.components.some((component) =>
    categories.includes(component.category)
  );
}

/**
 * Checks if a project matches any of the selected statuses
 *
 * @param project - Project to check
 * @param statuses - Array of selected statuses (empty = no filter)
 * @returns true if project matches any status or no statuses selected
 *
 * @example
 * ```typescript
 * filterByStatus(project, ["completed", "in-progress"]) // true if completed OR in-progress
 * filterByStatus(project, []) // true (no filter)
 * ```
 */
export function filterByStatus(
  project: Project,
  statuses: ProjectStatus[]
): boolean {
  if (statuses.length === 0) {
    return true; // No filter applied
  }
  return statuses.includes(project.status);
}

/**
 * Checks if a project has any of the selected project managers
 *
 * @param project - Project to check
 * @param projectManagers - Array of selected PM names (empty = no filter)
 * @returns true if project has any selected PM or no PMs selected
 *
 * @example
 * ```typescript
 * filterByProjectManager(project, ["John Doe", "Jane Smith"]) // true if has John OR Jane
 * filterByProjectManager(project, []) // true (no filter)
 * ```
 */
export function filterByProjectManager(
  project: Project,
  projectManagers: string[]
): boolean {
  if (projectManagers.length === 0) {
    return true; // No filter applied
  }

  const projectPmNames = project.projectManagers?.map((pm) => pm.name) || [];
  return projectManagers.some((pmName) => projectPmNames.includes(pmName));
}

/**
 * Checks if a project has any of the selected tags
 *
 * @param project - Project to check
 * @param tags - Array of selected tags (empty = no filter)
 * @returns true if project has any selected tag or no tags selected
 *
 * @example
 * ```typescript
 * filterByTags(project, ["renovation", "modern"]) // true if has renovation OR modern
 * filterByTags(project, []) // true (no filter)
 * ```
 */
export function filterByTags(project: Project, tags: string[]): boolean {
  if (tags.length === 0) {
    return true; // No filter applied
  }

  const projectTags = project.tags || [];
  return tags.some((tag) => projectTags.includes(tag));
}

/**
 * Applies all filters to a project using AND logic between filter types
 *
 * This is the main orchestration function that combines all filter types.
 * Uses AND logic: project must pass ALL active filter types.
 *
 * @param project - Project to check
 * @param filters - Complete filter state object
 * @returns true if project passes all active filters
 *
 * @example
 * ```typescript
 * const passesAllFilters = applyAllFilters(project, {
 *   categories: ["kitchen"],
 *   statuses: ["completed"],
 *   projectManagers: [],
 *   tags: []
 * });
 * // Returns true only if project is kitchen AND completed
 * ```
 */
export function applyAllFilters(
  project: Project,
  filters: {
    categories: ComponentCategory[];
    statuses: ProjectStatus[];
    projectManagers: string[];
    tags: string[];
  }
): boolean {
  return (
    filterByCategory(project, filters.categories) &&
    filterByStatus(project, filters.statuses) &&
    filterByProjectManager(project, filters.projectManagers) &&
    filterByTags(project, filters.tags)
  );
}
