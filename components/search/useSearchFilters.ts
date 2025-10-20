import { useCallback, useMemo, useState } from "react";

import { ProjectCategory } from "@/types/Category";
import { Project } from "@/types/Project";
import { ProjectStatus } from "@/types/Status";

import { SearchFilters } from "./types";

/**
 * Hook for managing multi-select search filters and applying them to projects
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
      project.pms?.forEach((pm) => {
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
  const applyFilters = useCallback(
    (projectsToFilter: Project[]): Project[] => {
      return projectsToFilter.filter((project) => {
        // Category filter (OR logic: match ANY selected category)
        if (filters.categories.length > 0) {
          if (!filters.categories.includes(project.category)) {
            return false;
          }
        }

        // Status filter (OR logic: match ANY selected status)
        if (filters.statuses.length > 0) {
          if (!filters.statuses.includes(project.status)) {
            return false;
          }
        }

        // Project Manager filter (OR logic: match ANY selected PM)
        if (filters.projectManagers.length > 0) {
          const projectPmNames = project.pms?.map((pm) => pm.name) || [];
          const hasMatchingPm = filters.projectManagers.some((pmName) =>
            projectPmNames.includes(pmName)
          );
          if (!hasMatchingPm) {
            return false;
          }
        }

        // Tags filter (OR logic: match ANY selected tag)
        if (filters.tags.length > 0) {
          const projectTags = project.tags || [];
          const hasMatchingTag = filters.tags.some((tag) =>
            projectTags.includes(tag)
          );
          if (!hasMatchingTag) {
            return false;
          }
        }

        return true;
      });
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
  const getCategoryFilters = useCallback(
    () => filters.categories as ProjectCategory[],
    [filters.categories]
  );

  const getStatusFilters = useCallback(
    () => filters.statuses as ProjectStatus[],
    [filters.statuses]
  );

  const getProjectManagerFilters = useCallback(
    () => filters.projectManagers,
    [filters.projectManagers]
  );

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
