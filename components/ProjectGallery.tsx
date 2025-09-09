import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, useWindowDimensions } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { ProjectSummary } from "@/types";
import { styling } from "@/utils/styling";
import { ProjectCard } from "./ProjectCard";
import { ThemedText, ThemedView } from "./themed";

interface ProjectGalleryProps {
  projects: ProjectSummary[];
  onProjectPress?: (project: ProjectSummary) => void;
  style?: any; // Allow custom styling
}

export function ProjectGallery({
  projects,
  onProjectPress,
  style,
}: ProjectGalleryProps) {
  const { width } = useWindowDimensions();
  const { getThemeColor } = useTheme();

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
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
      color: getThemeColor("text.secondary"),
      fontWeight: styling.fontWeight("semibold"),
      textAlign: "center",
    },
    emptySubtext: {
      fontSize: styling.fontSize("base"),
      color: getThemeColor("text.tertiary"),
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
          color={getThemeColor("text.tertiary")}
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
    <ThemedView style={[styles.container, style]}>
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
