import { CATEGORY_LABELS, ProjectCategory } from "@/core/types/Category";
import { getStatusDisplayText, ProjectStatus } from "@/core/types/Status";
import { FilterOption } from "../types/types";

/**
 * Creates filter configuration options from available project managers and tags
 *
 * Extracts and formats filter options for categories, statuses, project managers,
 * and tags for use in filter dropdowns. This is a pure utility function that
 * transforms data without any side effects or state management.
 *
 * @param availableProjectManagers - List of available project manager names
 * @param availableTags - List of available tag values
 * @returns Filter configuration object with all available options
 *
 * @example
 * const config = createFilterConfig(['John Doe', 'Jane Smith'], ['modern', 'luxury']);
 * // Returns: {
 * //   categoryOptions: [...],
 * //   statusOptions: [...],
 * //   projectManagerOptions: [...],
 * //   tagOptions: [...]
 * // }
 */
export function createFilterConfig(
  availableProjectManagers: string[],
  availableTags: string[]
) {
  // Category options - static list from category config
  const categoryOptions: FilterOption<ProjectCategory>[] = [
    { value: "bathroom", label: CATEGORY_LABELS.bathroom },
    { value: "kitchen", label: CATEGORY_LABELS.kitchen },
    { value: "outdoor", label: CATEGORY_LABELS.outdoor },
    {
      value: "general-remodeling",
      label: CATEGORY_LABELS["general-remodeling"],
    },
    { value: "basement", label: CATEGORY_LABELS.basement },
    { value: "attic", label: CATEGORY_LABELS.attic },
  ];

  // Status options - static list from status config
  const statusOptions: FilterOption<ProjectStatus>[] = [
    { value: "planning", label: getStatusDisplayText("planning") },
    { value: "in-progress", label: getStatusDisplayText("in-progress") },
    { value: "completed", label: getStatusDisplayText("completed") },
    { value: "on-hold", label: getStatusDisplayText("on-hold") },
  ];

  // Project Manager options - dynamic based on available PMs
  const projectManagerOptions: FilterOption<string>[] = (() => {
    if (availableProjectManagers.length === 0) {
      // Fallback options if no PMs are found
      return [
        { value: "Mike Johnson", label: "Mike Johnson" },
        { value: "Sarah Wilson", label: "Sarah Wilson" },
        { value: "Carlos Martinez", label: "Carlos Martinez" },
      ];
    }
    return availableProjectManagers.map((pm) => ({ value: pm, label: pm }));
  })();

  // Tag options - dynamic based on available tags
  const tagOptions: FilterOption<string>[] = availableTags.map((tag) => ({
    value: tag,
    label: tag,
  }));

  return {
    categoryOptions,
    statusOptions,
    projectManagerOptions,
    tagOptions,
  };
}
