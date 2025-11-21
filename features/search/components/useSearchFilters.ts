import { useCallback, useMemo, useState } from "react";

import { ComponentCategory } from "@/core/types/ComponentCategory";
import { Project } from "@/core/types/Project";
import { ProjectStatus } from "@/core/types/Status";
import { applyAllFilters } from "../utils/searchFilters";

import { SearchFilters } from "../types/types";

/**
 * Hook for managing multi-select search filters and applying them to projects
 *
 * Provides a complete filtering system with:
 * - Multi-select filter state management
 * - Automatic extraction of available filter options from projects
 * - Filter application logic with OR/AND semantics
 * - Helper functions for accessing individual filter values
 *
 * Filter Logic:
 * - Within each filter type: OR logic (match ANY selected value)
 * - Between filter types: AND logic (must match ALL active filter types)
 * - Empty arrays = no filter applied (show all items)
 *
 * @param projects - Array of projects to filter and extract options from
 * @returns Object containing filter state, actions, and computed values
 *
 * @example
 * ```typescript
 * const {
 *   filters,
 *   updateFilter,
 *   applyFilters,
 *   hasActiveFilters,
 *   availableProjectManagers
 * } = useSearchFilters(projects);
 *
 * // Apply filters to projects
 * const filteredProjects = applyFilters(projects);
 *
 * // Update a specific filter
 * updateFilter('categories', ['kitchen', 'bathroom']);
 * ```
 */
export function useSearchFilters(projects: Project[]) {
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    statuses: [],
    projectManagers: [],
    tags: [],
  });

  // Extract unique project managers from all projects
  const availableProjectManagers = useMemo(() => {
    const pmSet = new Set<string>();
    projects.forEach((project) => {
      project.projectManagers?.forEach((pm) => {
        if (pm.name) {
          pmSet.add(pm.name);
        }
      });
    });
    return Array.from(pmSet).sort();
  }, [projects]);

  // Extract unique tags from all projects
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    projects.forEach((project) => {
      project.tags?.forEach((tag) => {
        if (tag.trim()) {
          tagSet.add(tag.trim());
        }
      });
    });
    return Array.from(tagSet).sort();
  }, [projects]);

  // Update individual filter
  const updateFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      categories: [],
      statuses: [],
      projectManagers: [],
      tags: [],
    });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.categories.length > 0 ||
      filters.statuses.length > 0 ||
      filters.projectManagers.length > 0 ||
      filters.tags.length > 0
    );
  }, [filters]);

  // Apply filters to projects
  // Uses OR logic within each filter type, AND logic between filter types
  /**
   * Applies current filter state to a list of projects
   *
   * Filter Logic:
   * - Category filter: Show projects matching ANY selected category (OR logic)
   * - Status filter: Show projects matching ANY selected status (OR logic)
   * - Project Manager filter: Show projects with ANY selected PM (OR logic)
   * - Tags filter: Show projects with ANY selected tag (OR logic)
   * - Between filter types: Project must match ALL active filter types (AND logic)
   *
   * Empty filter arrays are ignored (no filtering applied for that type).
   *
   * @param projectsToFilter - Array of projects to filter
   * @returns Filtered array of projects matching all active filter criteria
   *
   * @example
   * ```typescript
   * // Filter for kitchen OR bathroom projects that are completed
   * const filtered = applyFilters(projects);
   * // Returns projects where:
   * // - category is "kitchen" OR "bathroom"
   * // - AND status is "completed"
   * ```
   */
  const applyFilters = useCallback(
    (projectsToFilter: Project[]): Project[] => {
      return projectsToFilter.filter((project) =>
        applyAllFilters(project, filters)
      );
    },
    [filters]
  );

  // Get active filter count (sum of all selected items across all filter types)
  const activeFilterCount = useMemo(() => {
    return (
      filters.categories.length +
      filters.statuses.length +
      filters.projectManagers.length +
      filters.tags.length
    );
  }, [filters]);

  // Get filter values for specific filter types
  /**
   * Gets the currently selected category filters
   * @returns Array of selected ComponentCategory values
   */
  const getCategoryFilters = useCallback(
    () => filters.categories as ComponentCategory[],
    [filters.categories]
  );

  /**
   * Gets the currently selected status filters
   * @returns Array of selected ProjectStatus values
   */
  const getStatusFilters = useCallback(
    () => filters.statuses as ProjectStatus[],
    [filters.statuses]
  );

  /**
   * Gets the currently selected project manager filters
   * @returns Array of selected project manager names
   */
  const getProjectManagerFilters = useCallback(
    () => filters.projectManagers,
    [filters.projectManagers]
  );

  /**
   * Gets the currently selected tag filters
   * @returns Array of selected tag values
   */
  const getTagFilters = useCallback(() => filters.tags, [filters.tags]);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
    applyFilters,
    availableProjectManagers,
    availableTags,
    getCategoryFilters,
    getStatusFilters,
    getProjectManagerFilters,
    getTagFilters,
  };
}
