import {
  ComponentCategory,
  CoreCategory,
  getCategoryLabel,
} from "@/shared/types/ComponentCategory";
import { getStatusDisplayText, ProjectStatus } from "@/shared/types/Status";
import { getAllCategories } from "@/shared/utils/categoryUtils";
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
  // Category options - dynamically generated from centralized category constants
  const categoryOptions: FilterOption<ComponentCategory>[] = getAllCategories().map(
    (category) => ({
      value: category,
      label: getCategoryLabel(category),
    })
  );

  // Status options - static list from status config
  const statusOptions: FilterOption<ProjectStatus>[] = [
    { value: "in-progress", label: getStatusDisplayText("in-progress") },
    { value: "completed", label: getStatusDisplayText("completed") },
  ];

  // Project Manager options - dynamic based on available PMs
  const projectManagerOptions: FilterOption<string>[] = (() => {
    if (availableProjectManagers.length === 0) {
      // Fallback options if no PMs are found (alphabetically ordered)
      return [
        { value: "Asaf Shoshanan", label: "Asaf Shoshanan" },
        { value: "Gabe Lisus-Lean", label: "Gabe Lisus-Lean" },
        { value: "Gal Kameron", label: "Gal Kameron" },
        { value: "Jake Rose", label: "Jake Rose" },
        { value: "Matan Efrat", label: "Matan Efrat" },
        { value: "Rose Otano", label: "Rose Otano" },
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
