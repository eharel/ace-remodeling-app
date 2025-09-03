import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ProjectSummary } from "@/types";
import { statusStyles, styling } from "@/utils/styling";

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
          transition={styling.transition("normal")}
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
                statusStyles[project.status as keyof typeof statusStyles],
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
    marginBottom: styling.spacing(4),
  },
  card: {
    backgroundColor: styling.color("background.card"),
    borderRadius: styling.borderRadius("lg"),
    overflow: "hidden",
    ...styling.shadow("md"),
    borderWidth: 1,
    borderColor: styling.color("accent.border"),
  },
  thumbnail: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: styling.spacing(5),
    gap: styling.spacing(3),
  },
  title: {
    fontSize: styling.fontSize("lg"),
    lineHeight: styling.lineHeight("tight"),
    color: styling.color("text.primary"),
    fontWeight: styling.fontWeight("semibold"),
  },
  description: {
    fontSize: styling.fontSize("base"),
    lineHeight: styling.lineHeight("relaxed"),
    color: styling.color("text.secondary"),
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: styling.spacing(2),
  },
  statusBadge: {
    paddingHorizontal: styling.spacing(3),
    paddingVertical: styling.spacing(2),
    borderRadius: styling.borderRadius("full"),
    borderWidth: 1,
  },
  statusText: {
    fontSize: styling.fontSize("xs"),
    fontWeight: styling.fontWeight("semibold"),
    textAlign: "center",
  },
  category: {
    fontSize: styling.fontSize("sm"),
    color: styling.color("text.tertiary"),
    textTransform: "capitalize",
    fontWeight: styling.fontWeight("medium"),
  },
});
