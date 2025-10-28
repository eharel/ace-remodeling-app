import React from "react";
import { StyleSheet, View } from "react-native";

import { FilterDropdown } from "./FilterDropdown";
import { FilterOption } from "./types";

/**
 * Props for the FilterButton component
 *
 * A reusable wrapper around FilterDropdown that provides
 * consistent styling and layout for filter buttons in the
 * SearchFiltersBar component.
 */
interface FilterButtonProps<T extends string> {
  /** Label for the filter (e.g., "Category", "Status") */
  label: string;
  /** Currently selected values for this filter */
  selectedValues: T[];
  /** Available options for this filter */
  options: FilterOption<T>[];
  /** Callback when selection changes */
  onChange: (values: T[]) => void;
  /** Test ID for testing purposes */
  testID?: string;
}

/**
 * FilterButton Component
 *
 * A reusable wrapper around FilterDropdown that provides
 * consistent styling and layout. This component encapsulates
 * the common pattern of wrapping FilterDropdown in a styled
 * container with consistent spacing and sizing.
 *
 * @param props - FilterButtonProps containing filter configuration
 * @returns JSX element representing a single filter button
 */
export function FilterButton<T extends string>({
  label,
  selectedValues,
  options,
  onChange,
  testID,
}: FilterButtonProps<T>) {
  return (
    <View style={styles.filterItem}>
      <FilterDropdown
        label={label}
        selectedValues={selectedValues}
        options={options}
        onChange={onChange}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterItem: {
    flex: 1,
    minWidth: 140,
  },
});
