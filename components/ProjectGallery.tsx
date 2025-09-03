import React from "react";
import { FlatList, StyleSheet, useWindowDimensions } from "react-native";

import { ProjectSummary } from "@/types";
import { ProjectCard } from "./ProjectCard";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface ProjectGalleryProps {
  projects: ProjectSummary[];
  title?: string;
  subtitle?: string;
  onProjectPress?: (project: ProjectSummary) => void;
}

export function ProjectGallery({
  projects,
  title,
  subtitle,
  onProjectPress,
}: ProjectGalleryProps) {
  const { width } = useWindowDimensions();

  // Calculate number of columns based on screen width
  const getColumnCount = () => {
    if (width >= 1024) return 3; // iPad Pro and larger
    if (width >= 768) return 2; // iPad and smaller tablets
    return 1; // iPhone and small devices
  };

  const columnCount = getColumnCount();
  const itemWidth = (width - 40 - (columnCount - 1) * 16) / columnCount; // 40 for padding, 16 for gaps

  const renderProject = ({ item }: { item: ProjectSummary }) => (
    <ProjectCard
      project={item}
      onPress={onProjectPress}
      style={{ width: itemWidth }}
    />
  );

  if (projects.length === 0) {
    return (
      <ThemedView style={styles.emptyState}>
        <ThemedText style={styles.emptyText}>No projects found</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Projects will appear here once they&apos;re added
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      {(title || subtitle) && (
        <ThemedView style={styles.header}>
          {title && (
            <ThemedText type="subtitle" style={styles.title}>
              {title}
            </ThemedText>
          )}
          {subtitle && (
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          )}
        </ThemedView>
      )}

      {/* Project Grid */}
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        numColumns={columnCount}
        columnWrapperStyle={[
          styles.row,
          projects.length < columnCount && styles.rowCentered,
        ]}
        key={columnCount} // Force re-render when column count changes
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 20,
    gap: 4,
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    opacity: 0.6,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.4,
    textAlign: "center",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rowCentered: {
    justifyContent: "center",
    gap: 16, // Add spacing between centered items
  },
});
