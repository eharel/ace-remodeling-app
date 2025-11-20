import { Image } from "expo-image";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import { ProjectSummary } from "@/core/types";
import { getStatusDisplayText, getStatusStyleKey } from "@/core/types/Status";
import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { logError } from "@/shared/utils";

interface ProjectCardProps {
  project: ProjectSummary;
  onPress?: (project: ProjectSummary) => void;
  style?: ViewStyle;
}

export function ProjectCard({ project, onPress, style }: ProjectCardProps) {
  const { theme } = useTheme();

  // Image loading state
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handlePress = () => {
    onPress?.(project);
  };

  const handleImageError = (error: any) => {
    // Image load error - silently fail

    setImageLoading(false);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageLoadStart = () => {
    setImageLoading(true);
    setImageError(false);
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
          lineHeight:
            DesignTokens.typography.fontSize.lg *
            DesignTokens.typography.lineHeight.tight,
        },
        description: {
          fontSize: DesignTokens.typography.fontSize.sm,
          lineHeight:
            DesignTokens.typography.fontSize.sm *
            DesignTokens.typography.lineHeight.normal,
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
          lineHeight:
            DesignTokens.typography.fontSize.xs *
            DesignTokens.typography.lineHeight.tight,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.text.secondary,
        },
        category: {
          fontSize: DesignTokens.typography.fontSize.xs,
          lineHeight:
            DesignTokens.typography.fontSize.xs *
            DesignTokens.typography.lineHeight.tight,
          opacity: 0.6,
          textTransform: "capitalize",
        },
        // Image loading and error states
        imageContainer: {
          position: "relative",
          width: "100%",
          height: 200,
        },
        loadingOverlay: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.background.secondary,
          justifyContent: "center",
          alignItems: "center",
        },
        errorOverlay: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.background.secondary,
          justifyContent: "center",
          alignItems: "center",
          padding: DesignTokens.spacing[4],
        },
        errorText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          lineHeight:
            DesignTokens.typography.fontSize.sm *
            DesignTokens.typography.lineHeight.normal,
          color: theme.colors.text.secondary,
          textAlign: "center",
          opacity: 0.7,
        },
      }),
    [theme]
  );

  return (
    <Pressable onPress={handlePress} style={[styles.container, style]}>
      <ThemedView style={styles.card}>
        {/* Project Image */}
        <View style={styles.imageContainer}>
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

          {/* Loading Overlay */}
          {imageLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                size="large"
                color={theme.colors.interactive.primary}
              />
            </View>
          )}

          {/* Error Overlay */}
          {imageError && (
            <View style={styles.errorOverlay}>
              <ThemedText style={styles.errorText}>
                Failed to load image
              </ThemedText>
            </View>
          )}
        </View>

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
              {project.category
                ? project.category.charAt(0).toUpperCase() +
                  project.category.slice(1)
                : "Miscellaneous"}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </Pressable>
  );
}
