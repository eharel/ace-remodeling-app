/**
 * Search Feature Module
 * Exports all search-related components, hooks, types, and utils
 */

// Components
export { FilterButton } from "./components/FilterButton";
export { FilterDropdown } from "./components/FilterDropdown";
export { SearchFiltersBar } from "./components/SearchFiltersBar";
export { SearchInputWithHistory } from "./components/SearchInputWithHistory";
export { SearchSuggestions } from "./components/SearchSuggestions";
export { useSearchFilters } from "./components/useSearchFilters";

// Types
export type {
  FilterDropdownProps,
  FilterOption,
  SearchFilters,
} from "./types/types";

// Utils
export * from "./utils/filterConfig";
export * from "./utils/searchFilters";
export * from "./utils/searchScoring";
