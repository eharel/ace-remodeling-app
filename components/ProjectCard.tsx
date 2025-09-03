import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ProjectSummary } from "@/types";

interface ProjectCardProps {
  project: ProjectSummary;
  onPress?: (project: ProjectSummary) => void;
  style?: ViewStyle;
}

export function ProjectCard({ project, onPress, style }: ProjectCardProps) {
  const handlePress = () => {
    onPress?.(project);
  };

  const handleImageError = (error: any) => {
    console.error(
      `❌ Failed to load image for project "${project.name}":`,
      error
    );
    console.log(
      `Project ID: ${project.id}, Thumbnail URL: ${project.thumbnail}`
    );
  };

  const handleImageLoad = () => {
    console.log(`✅ Successfully loaded image for project "${project.name}"`);
  };

  const handleImageLoadStart = () => {
    console.log(`🔄 Starting to load image for project "${project.name}"`);
  };

  // Debug: Log when component renders
  console.log(
    `🎨 Rendering ProjectCard for: ${project.name} (ID: ${project.id})`
  );
  console.log(`   Thumbnail URL: ${project.thumbnail}`);

  return (
    <Pressable onPress={handlePress} style={[styles.container, style]}>
      <ThemedView style={styles.card}>
        {/* Project Image */}
        <Image
          source={{ uri: project.thumbnail }}
          style={styles.thumbnail}
          contentFit="cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          onLoadStart={handleImageLoadStart}
          placeholder="Loading..."
          transition={200}
        />

        {/* Project Info */}
        <ThemedView style={styles.content}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {project.name}
          </ThemedText>

          <ThemedText style={styles.description} numberOfLines={2}>
            {project.briefDescription || "No description available"}
          </ThemedText>

          {/* Status and Category */}
          <ThemedView style={styles.meta}>
            <ThemedView
              style={[
                styles.statusBadge,
                styles[
                  `status_${project.status.replace(
                    "-",
                    "_"
                  )}` as keyof typeof styles
                ] as ViewStyle,
              ]}
            >
              <ThemedText style={styles.statusText}>
                {project.status.replace("-", " ").toUpperCase()}
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.category}>
              {project.category.charAt(0).toUpperCase() +
                project.category.slice(1)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.7,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status_completed: {
    backgroundColor: "#d4edda",
  },
  "status_in-progress": {
    backgroundColor: "#fff3cd",
  },
  status_planning: {
    backgroundColor: "#d1ecf1",
  },
  status_on_hold: {
    backgroundColor: "#f8d7da",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#495057",
  },
  category: {
    fontSize: 12,
    opacity: 0.6,
    textTransform: "capitalize",
  },
});
