import React from "react";
import { FlatList, StyleSheet } from "react-native";

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
  const renderProject = ({ item }: { item: ProjectSummary }) => (
    <ProjectCard project={item} onPress={onProjectPress} />
  );

  if (projects.length === 0) {
    return (
      <ThemedView style={styles.emptyState}>
        <ThemedText style={styles.emptyText}>No projects found</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Projects will appear here once they're added
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

      {/* Project List */}
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        numColumns={1}
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
});
