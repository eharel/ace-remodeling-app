import { ProjectCategory } from "@/types/Category";
import { ProjectStatus } from "@/types/Status";

/**
 * Filter state for search functionality
 * Each filter now supports multiple selections
 */
export interface SearchFilters {
  categories: ProjectCategory[];
  statuses: ProjectStatus[];
  projectManagers: string[];
  tags: string[];
}

/**
 * Filter option for dropdowns
 */
export interface FilterOption<T = string> {
  value: T;
  label: string;
}

/**
 * Props for filter dropdown component (multi-select)
 */
export interface FilterDropdownProps<T = string> {
  label: string;
  selectedValues: T[];
  options: FilterOption<T>[];
  onChange: (values: T[]) => void;
  testID?: string;
}
