import { ProjectCategory } from "@/core/types/Category";
import { ProjectStatus } from "@/core/types/Status";

/**
 * Search filter state supporting multi-select functionality
 *
 * Each filter type uses an array to support multiple selections.
 * Empty arrays mean "no filter applied" (show all items).
 * Non-empty arrays mean "show only items matching ANY of the selected values".
 *
 * @example
 * ```typescript
 * const filters: SearchFilters = {
 *   categories: ["kitchen", "bathroom"], // Show kitchen OR bathroom projects
 *   statuses: ["completed"], // Show only completed projects
 *   projectManagers: [], // Show projects from any PM
 *   tags: ["renovation", "modern"] // Show projects with renovation OR modern tags
 * };
 * ```
 */
export interface SearchFilters {
  /** Selected project categories (multi-select) */
  categories: ProjectCategory[];
  /** Selected project statuses (multi-select) */
  statuses: ProjectStatus[];
  /** Selected project manager names (multi-select) */
  projectManagers: string[];
  /** Selected project tags (multi-select) */
  tags: string[];
}

/**
 * Generic filter option for dropdown components
 *
 * @template T - The type of the option value (string, ProjectCategory, etc.)
 *
 * @example
 * ```typescript
 * const categoryOption: FilterOption<ProjectCategory> = {
 *   value: "kitchen",
 *   label: "Kitchen"
 * };
 * ```
 */
export interface FilterOption<T = string> {
  /** The actual value used for filtering */
  value: T;
  /** Display text shown to the user */
  label: string;
}

/**
 * Props for the FilterDropdown component
 *
 * A reusable multi-select dropdown that can filter by any type of value.
 * Supports generic typing for type-safe filtering.
 *
 * @template T - The type of values being filtered (string, ProjectCategory, etc.)
 *
 * @example
 * ```typescript
 * <FilterDropdown<ProjectCategory>
 *   label="Category"
 *   selectedValues={["kitchen", "bathroom"]}
 *   options={categoryOptions}
 *   onChange={(values) => setCategories(values)}
 * />
 * ```
 */
export interface FilterDropdownProps<T = string> {
  /** Display label for the dropdown (e.g., "Category", "Status") */
  label: string;
  /** Currently selected values (array for multi-select) */
  selectedValues: T[];
  /** Available options to choose from */
  options: FilterOption<T>[];
  /** Callback when selection changes */
  onChange: (values: T[]) => void;
  /** Optional test ID for automated testing */
  testID?: string;
}
