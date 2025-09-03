import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, useWindowDimensions } from "react-native";

import { ProjectSummary } from "@/types";
import { styling } from "@/utils/styling";
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
  const itemWidth =
    (width - styling.spacing(10) - (columnCount - 1) * styling.spacing(4)) /
    columnCount;

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
        <MaterialIcons
          name="folder-open"
          size={64}
          color="#cbd5e1"
          style={styles.emptyIcon}
        />
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
    marginBottom: styling.spacing(6),
    paddingHorizontal: styling.spacing(5),
    gap: styling.spacing(2),
  },
  title: {
    fontSize: styling.fontSize("2xl"),
    color: styling.color("text.primary"),
    fontWeight: styling.fontWeight("bold"),
    lineHeight: styling.lineHeight("tight"),
  },
  subtitle: {
    fontSize: styling.fontSize("lg"),
    color: styling.color("text.secondary"),
    lineHeight: styling.lineHeight("relaxed"),
  },
  listContent: {
    paddingHorizontal: styling.spacing(5),
    paddingBottom: styling.spacing(5),
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: styling.spacing(10),
    gap: styling.spacing(4),
  },
  emptyIcon: {
    marginBottom: styling.spacing(4),
    opacity: 0.3,
  },
  emptyText: {
    fontSize: styling.fontSize("xl"),
    color: styling.color("text.secondary"),
    fontWeight: styling.fontWeight("semibold"),
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: styling.fontSize("base"),
    color: styling.color("text.tertiary"),
    textAlign: "center",
    lineHeight: styling.lineHeight("relaxed"),
    maxWidth: 300,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: styling.spacing(4),
  },
  rowCentered: {
    justifyContent: "center",
    gap: styling.spacing(4),
  },
});
