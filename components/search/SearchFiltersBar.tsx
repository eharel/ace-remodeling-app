import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens, ThemedText } from "@/components/themed";
import { useTheme } from "@/contexts";
import { CATEGORY_LABELS, ProjectCategory } from "@/types/Category";
import { getStatusDisplayText, ProjectStatus } from "@/types/Status";

import { FilterDropdown } from "./FilterDropdown";
import { FilterOption } from "./types";

/**
 * Props for the SearchFiltersBar component
 *
 * This component renders a row of multi-select filter dropdowns for
 * searching projects by category, status, project manager, and tags.
 * Also includes a "Clear All" button when filters are active.
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
 * Displays multi-select filter dropdowns for category, status, and project manager
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

  // Category options
  const categoryOptions = useMemo<FilterOption<ProjectCategory>[]>(
    () => [
      { value: "bathroom", label: CATEGORY_LABELS.bathroom },
      { value: "kitchen", label: CATEGORY_LABELS.kitchen },
      { value: "outdoor", label: CATEGORY_LABELS.outdoor },
      {
        value: "general-remodeling",
        label: CATEGORY_LABELS["general-remodeling"],
      },
      { value: "basement", label: CATEGORY_LABELS.basement },
      { value: "attic", label: CATEGORY_LABELS.attic },
    ],
    []
  );

  // Status options
  const statusOptions = useMemo<FilterOption<ProjectStatus>[]>(
    () => [
      { value: "planning", label: getStatusDisplayText("planning") },
      { value: "in-progress", label: getStatusDisplayText("in-progress") },
      { value: "completed", label: getStatusDisplayText("completed") },
      { value: "on-hold", label: getStatusDisplayText("on-hold") },
    ],
    []
  );

  // Project Manager options
  const projectManagerOptions = useMemo<FilterOption<string>[]>(() => {
    if (availableProjectManagers.length === 0) {
      // Fallback options if no PMs are found
      return [
        { value: "Mike Johnson", label: "Mike Johnson" },
        { value: "Sarah Wilson", label: "Sarah Wilson" },
        { value: "Carlos Martinez", label: "Carlos Martinez" },
      ];
    }
    return availableProjectManagers.map((pm) => ({ value: pm, label: pm }));
  }, [availableProjectManagers]);

  // Tag options
  const tagOptions = useMemo<FilterOption<string>[]>(() => {
    return availableTags.map((tag) => ({ value: tag, label: tag }));
  }, [availableTags]);

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
    filterItem: {
      flex: 1,
      minWidth: 140,
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
        <View style={styles.filterItem}>
          <FilterDropdown
            label="Category"
            selectedValues={categoryValues}
            options={categoryOptions}
            onChange={onCategoryChange}
            testID="category-filter"
          />
        </View>
        <View style={styles.filterItem}>
          <FilterDropdown
            label="Status"
            selectedValues={statusValues}
            options={statusOptions}
            onChange={onStatusChange}
            testID="status-filter"
          />
        </View>
        <View style={styles.filterItem}>
          <FilterDropdown
            label="PM"
            selectedValues={projectManagerValues}
            options={projectManagerOptions}
            onChange={onProjectManagerChange}
            testID="pm-filter"
          />
        </View>
        <View style={styles.filterItem}>
          <FilterDropdown
            label="Tags"
            selectedValues={tagValues}
            options={tagOptions}
            onChange={onTagChange}
            testID="tag-filter"
          />
        </View>
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
