import React, { useMemo, useState } from "react";
import { TextInput, View } from "react-native";

import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import {
  getCategoryLabel,
  Project,
  ProjectComponent,
} from "@/shared/types";
import { CoreCategory } from "@/shared/types/ComponentCategory";
import { ProjectStatus } from "@/shared/types/Status";
import { getProjectDuration } from "@/shared/utils";

import { CategoryPicker } from "./CategoryPicker";
import { StatusPicker } from "./StatusPicker";

interface Timeline {
  start?: string;
  end?: string;
  duration?: string;
}

export interface ProjectMetaGridProps {
  project: Project;
  selectedComponent: ProjectComponent | null;
  displayTimeline: Timeline | null;
  isEditMode?: boolean;
  onStatusChange?: (status: ProjectStatus) => void;
  onCategoryChange?: (category: CoreCategory) => void;
  onLocationChange?: (location: { neighborhood?: string; zipCode?: string }) => void;
  onProjectNumberChange?: (number: string) => Promise<{ valid: boolean; error?: string }>;
}

/**
 * ProjectMetaGrid - Displays project metadata in a grid layout
 *
 * Shows Status, Category, Location, and Duration in a consistent grid format.
 * In edit mode, fields become editable with pickers and inputs.
 * Adapts to show component-specific data when a component is selected.
 */
export const ProjectMetaGrid: React.FC<ProjectMetaGridProps> = ({
  project,
  selectedComponent,
  displayTimeline,
  isEditMode = false,
  onStatusChange,
  onCategoryChange,
  onLocationChange,
  onProjectNumberChange,
}) => {
  const { theme } = useTheme();

  // Local state for editable fields
  const [editedNeighborhood, setEditedNeighborhood] = useState(
    project.location?.neighborhood || ""
  );
  const [editedZipCode, setEditedZipCode] = useState(
    project.location?.zipCode || ""
  );
  const [editedProjectNumber, setEditedProjectNumber] = useState(project.number || "");
  const [projectNumberError, setProjectNumberError] = useState<string | null>(null);
  const [isSavingProjectNumber, setIsSavingProjectNumber] = useState(false);

  // Reset local state when project changes
  React.useEffect(() => {
    setEditedNeighborhood(project.location?.neighborhood || "");
    setEditedZipCode(project.location?.zipCode || "");
    setEditedProjectNumber(project.number || "");
    setProjectNumberError(null);
  }, [project.id]);

  const styles = useMemo(
    () => ({
      metaGrid: {
        flexDirection: "column" as const,
        marginTop: DesignTokens.spacing[6],
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.primary,
        paddingTop: DesignTokens.spacing[4],
      },
      metaRow: {
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
      },
      metaItem: {
        width: "50%" as const,
        paddingVertical: DesignTokens.spacing[2],
        paddingRight: DesignTokens.spacing[4],
      },
      metaItemFull: {
        width: "100%" as const,
        paddingRight: 0,
      },
      metaItemLast: {
        paddingRight: 0,
      },
      metaLabel: {
        fontSize: DesignTokens.typography.fontSize.xs,
        textTransform: "uppercase" as const,
        letterSpacing: 0.5,
        marginBottom: DesignTokens.spacing[1],
      },
      metaValue: {
        fontSize: DesignTokens.typography.fontSize.sm,
        fontWeight: DesignTokens.typography.fontWeight.medium,
      },
      metaValuePill: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
      },
      statusPill: {
        paddingHorizontal: DesignTokens.spacing[3],
        paddingVertical: DesignTokens.spacing[1],
        borderRadius: DesignTokens.borderRadius.full,
      },
      statusPillText: {
        fontSize: DesignTokens.typography.fontSize.xs,
        fontWeight: DesignTokens.typography.fontWeight.semibold,
        textTransform: "uppercase" as const,
        letterSpacing: 0.5,
      },
      editableInput: {
        fontSize: DesignTokens.typography.fontSize.sm,
        fontWeight: DesignTokens.typography.fontWeight.medium,
        color: theme.colors.text.primary,
        paddingHorizontal: DesignTokens.spacing[3],
        paddingVertical: DesignTokens.spacing[2],
        borderRadius: DesignTokens.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border.accent,
        backgroundColor: theme.colors.background.card,
        minWidth: 100,
      },
      editableInputError: {
        borderColor: theme.colors.status.error,
      },
      errorText: {
        fontSize: DesignTokens.typography.fontSize.xs,
        color: theme.colors.status.error,
        marginTop: DesignTokens.spacing[1],
      },
      locationRow: {
        flexDirection: "row" as const,
        gap: DesignTokens.spacing[2],
        alignItems: "center" as const,
      },
      neighborhoodInput: {
        flex: 1,
      },
      zipCodeInput: {
        width: 80,
      },
    }),
    [theme]
  );

  const getStatusBadgeStyle = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "completed":
        return {
          backgroundColor: theme.colors.status.successLight,
          color: theme.colors.status.success,
        };
      case "in-progress":
      case "in progress":
        return {
          backgroundColor: theme.colors.status.infoLight,
          color: theme.colors.status.info,
        };
      case "pending":
        return {
          backgroundColor: theme.colors.status.warningLight,
          color: theme.colors.status.warning,
        };
      case "cancelled":
      case "canceled":
        return {
          backgroundColor: theme.colors.status.errorLight,
          color: theme.colors.status.error,
        };
      default:
        return {
          backgroundColor: theme.colors.background.accent,
          color: theme.colors.text.secondary,
        };
    }
  };

  const handleLocationBlur = () => {
    if (onLocationChange) {
      const hasNeighborhoodChanged = editedNeighborhood !== (project.location?.neighborhood || "");
      const hasZipCodeChanged = editedZipCode !== (project.location?.zipCode || "");

      if (hasNeighborhoodChanged || hasZipCodeChanged) {
        onLocationChange({
          neighborhood: editedNeighborhood || undefined,
          zipCode: editedZipCode || undefined,
        });
      }
    }
  };

  const handleProjectNumberBlur = async () => {
    if (!onProjectNumberChange) return;
    if (editedProjectNumber === project.number) return;

    setIsSavingProjectNumber(true);
    setProjectNumberError(null);

    try {
      const result = await onProjectNumberChange(editedProjectNumber);
      if (!result.valid) {
        setProjectNumberError(result.error || "Invalid project number");
        setEditedProjectNumber(project.number || ""); // Reset to original
      }
    } catch (error) {
      setProjectNumberError("Failed to update project number");
      setEditedProjectNumber(project.number || "");
    } finally {
      setIsSavingProjectNumber(false);
    }
  };

  return (
    <ThemedView style={styles.metaGrid}>
      {/* Project Number - only in edit mode */}
      {isEditMode && onProjectNumberChange && (
        <ThemedView style={[styles.metaItem, styles.metaItemFull]}>
          <ThemedText
            style={[styles.metaLabel, { color: theme.colors.text.secondary }]}
          >
            Project Number
          </ThemedText>
          <TextInput
            style={[
              styles.editableInput,
              projectNumberError && styles.editableInputError,
            ]}
            value={editedProjectNumber}
            onChangeText={setEditedProjectNumber}
            onBlur={handleProjectNumberBlur}
            placeholder="e.g., 2024-001"
            placeholderTextColor={theme.colors.text.tertiary}
            editable={!isSavingProjectNumber}
            autoCapitalize="characters"
          />
          {projectNumberError && (
            <ThemedText style={styles.errorText}>{projectNumberError}</ThemedText>
          )}
        </ThemedView>
      )}

      <View style={styles.metaRow}>
        {/* Status */}
        <ThemedView style={styles.metaItem}>
          <ThemedText
            style={[styles.metaLabel, { color: theme.colors.text.secondary }]}
          >
            Status
          </ThemedText>
          {isEditMode && onStatusChange ? (
            <StatusPicker
              currentStatus={project.status as ProjectStatus}
              onStatusChange={onStatusChange}
            />
          ) : (
            <ThemedView style={styles.metaValuePill}>
              <ThemedView
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: getStatusBadgeStyle(project.status)
                      .backgroundColor,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.statusPillText,
                    { color: getStatusBadgeStyle(project.status).color },
                  ]}
                >
                  {project.status.replace("-", " ").toUpperCase()}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          )}
        </ThemedView>

        {/* Category */}
        <ThemedView style={styles.metaItem}>
          <ThemedText
            style={[styles.metaLabel, { color: theme.colors.text.secondary }]}
          >
            Category
          </ThemedText>
          {isEditMode && onCategoryChange && selectedComponent ? (
            <CategoryPicker
              currentCategory={selectedComponent.category}
              onCategoryChange={onCategoryChange}
            />
          ) : (
            <ThemedText style={styles.metaValue}>
              {selectedComponent
                ? getCategoryLabel(selectedComponent.category)
                : "Miscellaneous"}
            </ThemedText>
          )}
        </ThemedView>

        {/* Location */}
        <ThemedView style={styles.metaItem}>
          <ThemedText
            style={[styles.metaLabel, { color: theme.colors.text.secondary }]}
          >
            Location
          </ThemedText>
          {isEditMode && onLocationChange ? (
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.editableInput, styles.neighborhoodInput]}
                value={editedNeighborhood}
                onChangeText={setEditedNeighborhood}
                onBlur={handleLocationBlur}
                placeholder="Neighborhood"
                placeholderTextColor={theme.colors.text.tertiary}
              />
              <TextInput
                style={[styles.editableInput, styles.zipCodeInput]}
                value={editedZipCode}
                onChangeText={setEditedZipCode}
                onBlur={handleLocationBlur}
                placeholder="ZIP"
                placeholderTextColor={theme.colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          ) : (
            <ThemedText style={styles.metaValue}>
              {project.location?.neighborhood || "Austin, TX"}{" "}
              {project.location?.zipCode || ""}
            </ThemedText>
          )}
        </ThemedView>

        {/* Duration */}
        <ThemedView style={[styles.metaItem, styles.metaItemLast]}>
          <ThemedText
            style={[styles.metaLabel, { color: theme.colors.text.secondary }]}
          >
            Duration
          </ThemedText>
          <ThemedText style={styles.metaValue}>
            {displayTimeline
              ? getProjectDuration({ timeline: displayTimeline })
              : getProjectDuration(project)}
          </ThemedText>
        </ThemedView>
      </View>
    </ThemedView>
  );
};
