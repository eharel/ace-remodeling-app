import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { View } from "react-native";

import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";

interface LogEntry {
  date: Date | string;
  description: string;
  type?: string;
}

export interface ProjectLogsSectionProps {
  logs: LogEntry[] | undefined;
}

/**
 * ProjectLogsSection - Displays project activity logs in a timeline format
 *
 * Shows a vertical timeline of project events with icons based on log type.
 * Only renders if logs data is provided and has entries.
 */
export const ProjectLogsSection: React.FC<ProjectLogsSectionProps> = ({
  logs,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(
    () => ({
      section: {
        paddingHorizontal: DesignTokens.spacing[6],
        marginTop: DesignTokens.spacing[8],
      },
      sectionTitle: {
        fontSize: DesignTokens.typography.fontSize.lg,
        fontWeight: DesignTokens.typography.fontWeight.semibold,
        marginBottom: DesignTokens.spacing[4],
      },
      logsList: {
        paddingLeft: DesignTokens.spacing[2],
      },
      logContainer: {
        flexDirection: "row" as const,
        alignItems: "flex-start" as const,
        paddingBottom: DesignTokens.spacing[4],
        position: "relative" as const,
      },
      logContainerLast: {
        paddingBottom: 0,
      },
      logTimeline: {
        position: "absolute" as const,
        left: 9,
        top: 24,
        bottom: 0,
        width: 2,
        backgroundColor: theme.colors.border.primary,
      },
      logTimelineLast: {
        display: "none" as const,
      },
      logIcon: {
        marginRight: DesignTokens.spacing[3],
        zIndex: 1,
      },
      logContent: {
        flex: 1,
      },
      logDate: {
        fontSize: DesignTokens.typography.fontSize.xs,
        color: theme.colors.text.tertiary,
        marginBottom: DesignTokens.spacing[1],
      },
      logDescription: {
        fontSize: DesignTokens.typography.fontSize.sm,
        color: theme.colors.text.secondary,
        lineHeight: DesignTokens.typography.lineHeight.normal,
      },
    }),
    [theme]
  );

  const getLogIcon = (type: string): string => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case "milestone":
        return "flag";
      case "update":
        return "update";
      case "issue":
        return "warning";
      case "note":
        return "note";
      default:
        return "info";
    }
  };

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <ThemedView style={styles.section}>
      <ThemedText
        style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
      >
        Project Logs ({logs.length})
      </ThemedText>
      <ThemedView style={styles.logsList}>
        {logs.map((item, index) => {
          const isLast = index === logs.length - 1;
          return (
            <ThemedView
              key={`log-${index}`}
              style={[styles.logContainer, isLast && styles.logContainerLast]}
            >
              <View
                style={[styles.logTimeline, isLast && styles.logTimelineLast]}
              />
              <MaterialIcons
                name={getLogIcon(item.type || "update") as any}
                size={20}
                color={theme.colors.interactive.primary}
                style={styles.logIcon}
              />
              <ThemedView style={styles.logContent}>
                <ThemedText style={styles.logDate}>
                  {item.date instanceof Date
                    ? item.date.toLocaleDateString()
                    : item.date}
                </ThemedText>
                <ThemedText style={styles.logDescription}>
                  {item.description}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          );
        })}
      </ThemedView>
    </ThemedView>
  );
};
