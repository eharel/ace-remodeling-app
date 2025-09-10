import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";
import { ProjectSummary } from "@/types";
import { getStatusDisplayText, getStatusStyleKey } from "@/utils/statusUtils";

interface ProjectCardProps {
  project: ProjectSummary;
  onPress?: (project: ProjectSummary) => void;
  style?: ViewStyle;
}

export function ProjectCard({ project, onPress, style }: ProjectCardProps) {
  const { theme } = useTheme();

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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: DesignTokens.spacing[4],
        },
        card: {
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.lg,
          shadowColor: theme.colors.components.card.shadow,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
        },
        thumbnail: {
          width: "100%",
          height: 200,
        },
        content: {
          padding: DesignTokens.spacing[4],
          gap: DesignTokens.spacing[2],
        },
        title: {
          fontSize: DesignTokens.typography.fontSize.lg,
          lineHeight: 22,
        },
        description: {
          fontSize: DesignTokens.typography.fontSize.sm,
          lineHeight: 18,
          opacity: 0.7,
        },
        meta: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: DesignTokens.spacing[2],
        },
        statusBadge: {
          paddingHorizontal: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[1],
          borderRadius: DesignTokens.borderRadius.lg,
        },
        status_completed: {
          backgroundColor: theme.colors.status.successLight,
        },
        status_in_progress: {
          backgroundColor: theme.colors.status.warningLight,
        },
        status_planning: {
          backgroundColor: theme.colors.status.infoLight,
        },
        status_on_hold: {
          backgroundColor: theme.colors.status.errorLight,
        },
        statusText: {
          fontSize: DesignTokens.typography.fontSize.xs,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.text.secondary,
        },
        category: {
          fontSize: DesignTokens.typography.fontSize.xs,
          opacity: 0.6,
          textTransform: "capitalize",
        },
      }),
    [theme]
  );

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
          <ThemedText variant="body" style={styles.title}>
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
                styles[getStatusStyleKey(project.status)] as ViewStyle,
              ]}
            >
              <ThemedText style={styles.statusText}>
                {getStatusDisplayText(project.status)}
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
