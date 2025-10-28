import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ProjectCategory } from "@/core/types/Category";
import { ProjectStatus } from "@/core/types/Status";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { createFilterConfig } from "../utils/filterConfig";

import { FilterButton } from "./FilterButton";

/**
 * Props for the SearchFiltersBar component
 *
 * This component renders a row of multi-select filter dropdowns for
 * searching projects by category, status, project manager, and tags.
 * Also includes a "Clear All" button when filters are active.
 *
 * Simplified interface that reduces prop drilling by using the
 * useFilterConfig hook internally for filter configuration.
 */
interface SearchFiltersBarProps {
  /** Currently selected category values */
  categoryValues: ProjectCategory[];
  /** Currently selected status values */
  statusValues: ProjectStatus[];
  /** Currently selected project manager names */
  projectManagerValues: string[];
  /** Currently selected tag values */
  tagValues: string[];
  /** Available project managers extracted from all projects */
  availableProjectManagers: string[];
  /** Available tags extracted from all projects */
  availableTags: string[];
  /** Callback when category selection changes */
  onCategoryChange: (values: ProjectCategory[]) => void;
  /** Callback when status selection changes */
  onStatusChange: (values: ProjectStatus[]) => void;
  /** Callback when project manager selection changes */
  onProjectManagerChange: (values: string[]) => void;
  /** Callback when tag selection changes */
  onTagChange: (values: string[]) => void;
  /** Callback to reset all filters to empty state */
  onResetFilters: () => void;
  /** Whether any filters are currently active (non-empty arrays) */
  hasActiveFilters: boolean;
  /** Total count of active filter selections across all filter types */
  activeFilterCount: number;
}

/**
 * SearchFiltersBar Component
 *
 * Displays multi-select filter dropdowns for category, status, project manager, and tags.
 * Uses the useFilterConfig hook internally to reduce prop drilling and separate concerns.
 *
 * This component is now focused purely on orchestration and rendering, with all
 * filter configuration logic extracted to the useFilterConfig hook.
 */
export function SearchFiltersBar({
  categoryValues,
  statusValues,
  projectManagerValues,
  tagValues,
  availableProjectManagers,
  availableTags,
  onCategoryChange,
  onStatusChange,
  onProjectManagerChange,
  onTagChange,
  onResetFilters,
  hasActiveFilters,
  activeFilterCount,
}: SearchFiltersBarProps) {
  const { theme } = useTheme();

  // Get filter configurations from utility function (component-level memoization)
  const { categoryOptions, statusOptions, projectManagerOptions, tagOptions } =
    useMemo(
      () => createFilterConfig(availableProjectManagers, availableTags),
      [availableProjectManagers, availableTags]
    );

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: DesignTokens.spacing[5],
      paddingVertical: DesignTokens.spacing[3],
      gap: DesignTokens.spacing[3],
    },
    filtersRow: {
      flexDirection: "row",
      gap: DesignTokens.spacing[3],
      flexWrap: "wrap",
    },
    clearRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    clearButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: DesignTokens.spacing[1],
      paddingHorizontal: DesignTokens.spacing[3],
      paddingVertical: DesignTokens.spacing[2],
      borderRadius: DesignTokens.borderRadius.md,
      backgroundColor: theme.colors.background.elevated,
    },
    clearButtonText: {
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.text.accent,
      fontWeight: "500",
    },
    filterCountText: {
      fontSize: DesignTokens.typography.fontSize.sm,
      opacity: 0.7,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.filtersRow}>
        <FilterButton
          label="Category"
          selectedValues={categoryValues}
          options={categoryOptions}
          onChange={onCategoryChange}
          testID="category-filter"
        />
        <FilterButton
          label="Status"
          selectedValues={statusValues}
          options={statusOptions}
          onChange={onStatusChange}
          testID="status-filter"
        />
        <FilterButton
          label="PM"
          selectedValues={projectManagerValues}
          options={projectManagerOptions}
          onChange={onProjectManagerChange}
          testID="pm-filter"
        />
        <FilterButton
          label="Tags"
          selectedValues={tagValues}
          options={tagOptions}
          onChange={onTagChange}
          testID="tag-filter"
        />
      </View>

      {hasActiveFilters && (
        <View style={styles.clearRow}>
          <ThemedText style={styles.filterCountText}>
            {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"}{" "}
            active
          </ThemedText>
          <Pressable
            style={styles.clearButton}
            onPress={onResetFilters}
            accessibilityLabel="Clear all filters"
            accessibilityRole="button"
          >
            <MaterialIcons
              name="clear"
              size={16}
              color={theme.colors.text.accent}
            />
            <ThemedText style={styles.clearButtonText}>Clear All</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}
