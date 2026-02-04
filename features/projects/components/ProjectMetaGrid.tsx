import React, { useMemo } from "react";

import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import {
  getCategoryLabel,
  Project,
  ProjectComponent,
} from "@/shared/types";
import { ProjectStatus } from "@/shared/types/Status";
import { getProjectDuration } from "@/shared/utils";

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
}

/**
 * ProjectMetaGrid - Displays project metadata in a 2x2 grid layout
 *
 * Shows Status, Category, Location, and Duration in a consistent grid format.
 * Adapts to show component-specific data when a component is selected.
 */
export const ProjectMetaGrid: React.FC<ProjectMetaGridProps> = ({
  project,
  selectedComponent,
  displayTimeline,
  isEditMode = false,
  onStatusChange,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () => ({
      metaGrid: {
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
        marginTop: DesignTokens.spacing[6],
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.primary,
        paddingTop: DesignTokens.spacing[4],
      },
      metaItem: {
        width: "50%" as const,
        paddingVertical: DesignTokens.spacing[2],
        paddingRight: DesignTokens.spacing[4],
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

  return (
    <ThemedView style={styles.metaGrid}>
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

      <ThemedView style={styles.metaItem}>
        <ThemedText
          style={[styles.metaLabel, { color: theme.colors.text.secondary }]}
        >
          Category
        </ThemedText>
        <ThemedText style={styles.metaValue}>
          {selectedComponent
            ? getCategoryLabel(selectedComponent.category)
            : "Miscellaneous"}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.metaItem}>
        <ThemedText
          style={[styles.metaLabel, { color: theme.colors.text.secondary }]}
        >
          Location
        </ThemedText>
        <ThemedText style={styles.metaValue}>
          {project.location?.neighborhood || "Austin, TX"}{" "}
          {project.location?.zipCode || ""}
        </ThemedText>
      </ThemedView>

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
    </ThemedView>
  );
};
