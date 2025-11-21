import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { DesignTokens } from "@/core/themes";
import { ProjectSummary, ProjectStatus } from "@/core/types";
import { getSubcategoryLabel } from "@/core/types/ComponentCategory";
import { getStatusDisplayText, getStatusStyleKey } from "@/core/types/Status";
import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { getCategoryDisplayName, logError } from "@/shared/utils";

interface ProjectCardProps {
  project: ProjectSummary;
  onPress?: (project: ProjectSummary) => void;
  style?: ViewStyle;
  /**
   * Layout variant - "vertical" for flexible width cards in lists,
   * "horizontal" for fixed-width cards in horizontal scrolling lists
   */
  variant?: "vertical" | "horizontal";
  /**
   * Show status badge (default: true for vertical, false for horizontal)
   */
  showStatus?: boolean;
  /**
   * Show category/subcategory info (default: true for vertical, false for horizontal)
   */
  showCategory?: boolean;
  /**
   * Enable press animations (default: false, true for horizontal variant)
   */
  enableAnimations?: boolean;
  /**
   * Blurhash placeholder for image loading (optional)
   */
  blurhashPlaceholder?: string;
}

// Constants for horizontal variant
const HORIZONTAL_CARD_WIDTH = 300;
const HORIZONTAL_CARD_HEIGHT = 240;
const HORIZONTAL_IMAGE_HEIGHT = 160;

function ProjectCardComponent({
  project,
  onPress,
  style,
  variant = "vertical",
  showStatus,
  showCategory,
  enableAnimations,
  blurhashPlaceholder,
}: ProjectCardProps) {
  const { theme } = useTheme();

  // Determine defaults based on variant
  const shouldShowStatus = showStatus ?? (variant === "vertical");
  const shouldShowCategory = showCategory ?? (variant === "vertical");
  const shouldEnableAnimations = enableAnimations ?? (variant === "horizontal");

  // Animation values - always create (hooks must be unconditional)
  // But only use them when animations are enabled
  const scale = useSharedValue(shouldEnableAnimations ? 1 : 1);
  const shadowElevation = useSharedValue(shouldEnableAnimations ? 4 : 4);

  // Image loading state
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handlePress = useCallback(() => {
    if (shouldEnableAnimations) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(project);
  }, [onPress, project, shouldEnableAnimations]);

  const handlePressIn = useCallback(() => {
    if (shouldEnableAnimations) {
      scale.value = withSpring(0.97, {
        damping: 18,
        stiffness: 200,
        mass: 1,
      });
      shadowElevation.value = withSpring(8, {
        damping: 18,
        stiffness: 200,
      });
    }
  }, [shouldEnableAnimations, scale, shadowElevation]);

  const handlePressOut = useCallback(() => {
    if (shouldEnableAnimations) {
      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 200,
        mass: 1,
      });
      shadowElevation.value = withSpring(4, {
        damping: 18,
        stiffness: 200,
      });
    }
  }, [shouldEnableAnimations, scale, shadowElevation]);

  // Always call useAnimatedStyle (hooks must be unconditional)
  // Return identity transform when animations disabled to avoid issues
  const animatedCardStyle = useAnimatedStyle(
    () => {
      if (!shouldEnableAnimations) {
        return {};
      }
      return {
        transform: [{ scale: scale.value }],
        shadowOpacity: shadowElevation.value / 10,
        shadowRadius: shadowElevation.value * 1.5,
        elevation: shadowElevation.value,
      };
    },
    [scale, shadowElevation, shouldEnableAnimations]
  );

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
          marginBottom: variant === "vertical" ? DesignTokens.spacing[4] : 0,
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
          ...(variant === "horizontal" && {
            width: HORIZONTAL_CARD_WIDTH,
            height: HORIZONTAL_CARD_HEIGHT,
          }),
        },
        thumbnail: {
          width: "100%",
          height: variant === "horizontal" ? HORIZONTAL_IMAGE_HEIGHT : 200,
        },
        content: {
          padding: variant === "horizontal" ? DesignTokens.spacing[3] : DesignTokens.spacing[4],
          gap: DesignTokens.spacing[2],
          ...(variant === "horizontal" && {
            flex: 1,
            justifyContent: "space-between",
          }),
        },
        title: {
          fontSize:
            variant === "horizontal"
              ? DesignTokens.typography.fontSize.base
              : DesignTokens.typography.fontSize.lg,
          lineHeight:
            (variant === "horizontal"
              ? DesignTokens.typography.fontSize.base
              : DesignTokens.typography.fontSize.lg) *
            DesignTokens.typography.lineHeight.tight,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          color: theme.colors.text.primary,
          ...(variant === "horizontal" && {
            marginBottom: DesignTokens.spacing[1],
          }),
        },
        description: {
          fontSize: DesignTokens.typography.fontSize.sm,
          lineHeight:
            DesignTokens.typography.fontSize.sm *
            DesignTokens.typography.lineHeight.normal,
          color:
            variant === "horizontal"
              ? theme.colors.text.secondary
              : undefined,
          opacity: variant === "horizontal" ? 1 : 0.7,
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
          height: variant === "horizontal" ? HORIZONTAL_IMAGE_HEIGHT : 200,
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
        featuredBadge: {
          position: "absolute",
          top: DesignTokens.spacing[2],
          right: DesignTokens.spacing[2],
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          paddingHorizontal: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[1],
          borderRadius: DesignTokens.borderRadius.md,
          shadowColor: theme.colors.showcase?.accent || theme.colors.interactive.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.4,
          shadowRadius: 3,
          elevation: 2,
        },
        featuredIcon: {
          marginRight: DesignTokens.spacing[1],
        },
        featuredText: {
          fontSize: DesignTokens.typography.fontSize.xs,
          color: "#ffffff",
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
        },
      }),
    [theme, variant]
  );

  // Always use ThemedView, but wrap in Animated.View when animations are enabled
  const cardContent = (
    <>
      {/* Project Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: project.thumbnail }}
          style={styles.thumbnail}
          contentFit="cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          onLoadStart={handleImageLoadStart}
          placeholder={
            blurhashPlaceholder
              ? { blurhash: blurhashPlaceholder }
              : "Loading..."
          }
          transition={200}
          cachePolicy={variant === "horizontal" ? "memory-disk" : undefined}
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

        {/* Featured Badge */}
        {project.isFeatured && (
          <View style={styles.featuredBadge}>
            <MaterialIcons
              name="star"
              size={14}
              color={theme.colors.showcase?.accent || theme.colors.interactive.primary}
              style={styles.featuredIcon}
            />
            <ThemedText style={styles.featuredText}>
              Featured
            </ThemedText>
          </View>
        )}
      </View>

      {/* Project Info */}
      <View style={styles.content}>
        <ThemedText
          variant={variant === "horizontal" ? undefined : "body"}
          style={styles.title}
          numberOfLines={variant === "horizontal" ? 1 : undefined}
        >
          {project.name}
        </ThemedText>

        <ThemedText style={styles.description} numberOfLines={2}>
          {project.briefDescription || "No description available"}
        </ThemedText>

        {/* Status and Category - only shown if enabled */}
        {(shouldShowStatus || shouldShowCategory) && (
          <View style={styles.meta}>
            {shouldShowStatus && (
              <View
                style={[
                  styles.statusBadge,
                  styles[
                    getStatusStyleKey(project.status as ProjectStatus)
                  ] as ViewStyle,
                ]}
              >
                <ThemedText style={styles.statusText}>
                  {getStatusDisplayText(project.status as ProjectStatus)}
                </ThemedText>
              </View>
            )}

            {shouldShowCategory && (
              <ThemedText style={styles.category}>
                {project.subcategory
                  ? getSubcategoryLabel(project.subcategory)
                  : project.category
                  ? getCategoryDisplayName(project.category)
                  : "Miscellaneous"}
              </ThemedText>
            )}
          </View>
        )}
      </View>
    </>
  );

  // Render with separate paths to avoid React reconciliation issues
  if (shouldEnableAnimations) {
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, style]}
      >
        <Animated.View
          style={[
            styles.card,
            animatedCardStyle,
            { backgroundColor: theme.colors.background.card },
          ]}
        >
          {cardContent}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, style]}
    >
      <ThemedView style={styles.card}>
        {cardContent}
      </ThemedView>
    </Pressable>
  );
}

// Memoize ProjectCard to prevent unnecessary re-renders in FlatList
// This improves performance for large lists by only re-rendering when props actually change
export const ProjectCard = React.memo(ProjectCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  // Only re-render if these key props change
  // Note: We don't compare onPress or style as they may change reference but not meaning
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.project.thumbnail === nextProps.project.thumbnail &&
    prevProps.project.name === nextProps.project.name &&
    prevProps.project.briefDescription === nextProps.project.briefDescription &&
    prevProps.project.isFeatured === nextProps.project.isFeatured &&
    prevProps.project.status === nextProps.project.status &&
    prevProps.project.subcategory === nextProps.project.subcategory &&
    prevProps.project.category === nextProps.project.category &&
    prevProps.variant === nextProps.variant &&
    prevProps.showStatus === nextProps.showStatus &&
    prevProps.showCategory === nextProps.showCategory &&
    prevProps.enableAnimations === nextProps.enableAnimations &&
    // Compare style by checking if width/flex values are the same
    (prevProps.style === nextProps.style ||
      (prevProps.style?.width === nextProps.style?.width &&
        prevProps.style?.flex === nextProps.style?.flex))
  );
});
