import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import { ProjectSummary } from "@/core/types";
import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { ProjectCard } from "./ProjectCard";

interface ProjectGalleryProps {
  projects: ProjectSummary[];
  onProjectPress?: (project: ProjectSummary) => void;
  style?: ViewStyle; // Allow custom styling
  testID?: string; // For testing purposes
}

// Calculate number of columns based on screen width - moved outside component for performance
const getColumnCount = (width: number): number => {
  if (width >= 1024) return 3; // iPad Pro and larger
  if (width >= 768) return 2; // iPad and smaller tablets
  return 1; // iPhone and small devices
};

export function ProjectGallery({
  projects,
  onProjectPress,
  style,
  testID,
}: ProjectGalleryProps) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();

  // Error handling: Ensure projects is an array
  const safeProjects = Array.isArray(projects) ? projects : [];

  // Memoize column count calculation
  const columnCount = useMemo(() => getColumnCount(width), [width]);

  // Use flex instead of manual width calculation for responsive layout
  const itemWidth = useMemo(() => {
    // For single column, use full width minus padding
    if (columnCount === 1) {
      return width - DesignTokens.spacing[6] * 2;
    }
    // For multiple columns, let flex handle the sizing naturally
    return undefined;
  }, [width, columnCount]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: DesignTokens.spacing[6],
      paddingBottom: DesignTokens.spacing[5],
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: DesignTokens.spacing[10],
      gap: DesignTokens.spacing[4],
    },
    emptyIcon: {
      marginBottom: DesignTokens.spacing[4],
      opacity: 0.3,
    },
    emptyText: {
      fontSize: DesignTokens.typography.fontSize.xl,
      color: theme.colors.text.secondary,
      fontWeight: DesignTokens.typography.fontWeight.semibold,
      textAlign: "center",
    },
    emptySubtext: {
      fontSize: DesignTokens.typography.fontSize.base,
      color: theme.colors.text.tertiary,
      textAlign: "center",
      lineHeight: DesignTokens.typography.lineHeight.relaxed,
      maxWidth: 300,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: DesignTokens.spacing[12],
      gap: DesignTokens.spacing[4],
    },
    rowCentered: {
      flexDirection: "row",
      justifyContent: "center",
      gap: DesignTokens.spacing[4],
    },
  });

  // Memoize render function to prevent unnecessary re-renders
  const renderProject = useCallback(
    ({ item }: { item: ProjectSummary }) => (
      <ProjectCard
        project={item}
        onPress={onProjectPress}
        style={itemWidth ? { width: itemWidth } : { flex: 1 }}
      />
    ),
    [onProjectPress, itemWidth]
  );

  // Memoize key extractor
  const keyExtractor = useCallback((item: ProjectSummary) => item.id, []);

  if (safeProjects.length === 0) {
    return (
      <ThemedView
        style={styles.emptyState}
        testID={
          testID ? `${testID}-empty-state` : "project-gallery-empty-state"
        }
        accessibilityLabel="No projects found"
        accessibilityHint="Projects will appear here once they are added"
      >
        <MaterialIcons
          name="folder-open"
          size={64}
          color={theme.colors.text.tertiary}
          style={styles.emptyIcon}
          accessibilityLabel="Empty folder icon"
        />
        <ThemedText style={styles.emptyText}>No projects found</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Projects will appear here once they&apos;re added
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[styles.container, style]}
      testID={testID || "project-gallery"}
      accessibilityLabel={`Project gallery with ${safeProjects.length} projects`}
      accessibilityRole="list"
    >
      {/* Project Grid */}
      <FlatList
        data={safeProjects}
        renderItem={renderProject}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        numColumns={columnCount}
        {...(columnCount > 1 && {
          columnWrapperStyle: [
            styles.row,
            safeProjects.length < columnCount && styles.rowCentered,
          ],
        })}
        key={columnCount} // Force re-render when column count changes
        removeClippedSubviews={true} // Performance optimization for large lists
        maxToRenderPerBatch={10} // Render 10 items per batch
        windowSize={10} // Keep 10 screens worth of items in memory
        initialNumToRender={6} // Render 6 items initially
        accessibilityLabel="Project list"
        accessibilityRole="list"
        testID={testID ? `${testID}-list` : "project-gallery-list"}
      />
    </ThemedView>
  );
}
