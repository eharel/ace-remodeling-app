import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import { ProjectSummary } from "@/types";
import { styling } from "@/utils/styling";

interface ProjectCardProps {
  project: ProjectSummary;
  onPress?: (project: ProjectSummary) => void;
  style?: ViewStyle;
}

export function ProjectCard({ project, onPress, style }: ProjectCardProps) {
  const { getThemeColor } = useTheme();

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

  const styles = StyleSheet.create({
    container: {
      marginBottom: styling.spacing(4),
    },
    card: {
      backgroundColor: getThemeColor("background.card"),
      borderRadius: styling.borderRadius("lg"),
      shadowColor: getThemeColor("components.card.shadow"),
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: getThemeColor("border.primary"),
    },
    thumbnail: {
      width: "100%",
      height: 200,
    },
    content: {
      padding: styling.spacing(4),
      gap: styling.spacing(2),
    },
    title: {
      fontSize: styling.fontSize("lg"),
      lineHeight: 22,
    },
    description: {
      fontSize: styling.fontSize("sm"),
      lineHeight: 18,
      opacity: 0.7,
    },
    meta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: styling.spacing(2),
    },
    statusBadge: {
      paddingHorizontal: styling.spacing(2),
      paddingVertical: styling.spacing(1),
      borderRadius: styling.borderRadius("lg"),
    },
    status_completed: {
      backgroundColor: getThemeColor("status.successLight"),
    },
    "status_in-progress": {
      backgroundColor: getThemeColor("status.warningLight"),
    },
    status_planning: {
      backgroundColor: getThemeColor("status.infoLight"),
    },
    status_on_hold: {
      backgroundColor: getThemeColor("status.errorLight"),
    },
    statusText: {
      fontSize: 10,
      fontWeight: "600",
      color: getThemeColor("text.secondary"),
    },
    category: {
      fontSize: styling.fontSize("xs"),
      opacity: 0.6,
      textTransform: "capitalize",
    },
  });

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
        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {project.name}
          </ThemedText>

          <ThemedText style={styles.description} numberOfLines={2}>
            {project.briefDescription || "No description available"}
          </ThemedText>

          {/* Status and Category */}
          <View style={styles.meta}>
            <View
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
            </View>

            <ThemedText style={styles.category}>
              {project.category.charAt(0).toUpperCase() +
                project.category.slice(1)}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}
