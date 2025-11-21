import { MaterialIcons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  ViewStyle,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import { ProjectSummary } from "@/core/types";
import { ThemedText, ThemedView } from "@/shared/components";
import { useProjects, useTheme } from "@/shared/contexts";
import { ProjectCard } from "./ProjectCard";

// Minimum duration for refresh animation to feel smooth (in milliseconds)
const MIN_REFRESH_DURATION = 500;

interface ProjectGalleryProps {
  projects: ProjectSummary[];
  onProjectPress?: (project: ProjectSummary) => void;
  style?: ViewStyle; // Allow custom styling
  testID?: string; // For testing purposes
  /**
   * Enable pull-to-refresh functionality.
   * When true, adds RefreshControl to the FlatList.
   */
  enableRefresh?: boolean;
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
  enableRefresh = false,
}: ProjectGalleryProps) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const { refetchProjects, loading } = useProjects();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshStartTime = useRef<number | null>(null);

  // Handle smooth refresh animation when refresh is enabled
  useEffect(() => {
    if (!enableRefresh) return;

    if (loading) {
      // Refresh started - record start time
      if (!refreshStartTime.current) {
        refreshStartTime.current = Date.now();
        setIsRefreshing(true);
      }
    } else {
      // Refresh completed - wait for minimum duration before hiding spinner
      if (refreshStartTime.current) {
        const elapsed = Date.now() - refreshStartTime.current;
        const remaining = Math.max(0, MIN_REFRESH_DURATION - elapsed);

        const timeoutId = setTimeout(() => {
          setIsRefreshing(false);
          refreshStartTime.current = null;
        }, remaining);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [loading, enableRefresh]);

  const handleRefresh = useCallback(async () => {
    if (!enableRefresh) return;
    refreshStartTime.current = Date.now();
    setIsRefreshing(true);
    await refetchProjects();
  }, [enableRefresh, refetchProjects]);

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

  // Memoize style object to prevent recreation on every render
  const cardStyle = useMemo(
    () => (itemWidth ? { width: itemWidth } : { flex: 1 }),
    [itemWidth]
  );

  // Memoize render function to prevent unnecessary re-renders
  const renderProject = useCallback(
    ({ item }: { item: ProjectSummary }) => (
      <ProjectCard project={item} onPress={onProjectPress} style={cardStyle} />
    ),
    [onProjectPress, cardStyle]
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
        maxToRenderPerBatch={5} // Render 5 items per batch (reduced for better performance)
        windowSize={5} // Keep 5 screens worth of items in memory (reduced for better performance)
        initialNumToRender={columnCount * 2} // Render 2 rows initially
        updateCellsBatchingPeriod={50} // Batch updates every 50ms
        refreshControl={
          enableRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.text.secondary}
              colors={[theme.colors.text.secondary]} // Android
            />
          ) : undefined
        }
        accessibilityLabel="Project list"
        accessibilityRole="list"
        testID={testID ? `${testID}-list` : "project-gallery-list"}
      />
    </ThemedView>
  );
}
