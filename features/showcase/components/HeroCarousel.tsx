import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import { Project } from "@/core/types";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

const { width: screenWidth } = Dimensions.get("window");
const CAROUSEL_HEIGHT = 480; // ~40% of typical iPad height
const AUTO_ADVANCE_INTERVAL = DesignTokens.carousel.autoAdvanceInterval;
const RESUME_DELAY = 3000; // 3 seconds after user interaction

interface HeroCarouselProps {
  projects: Project[];
}

/**
 * HeroCarousel - Auto-advancing hero carousel for featured projects
 *
 * Features:
 * - Auto-advances through projects every 5 seconds
 * - Pauses when user interacts (swipes)
 * - Resumes after 3 seconds of no interaction
 * - Smooth spring-based transitions
 * - Pagination dots with showcase accent color
 * - Semi-transparent gradient overlay for text readability
 * - Loops back to first project after reaching the end
 *
 * @param {Project[]} projects - Array of featured projects to display
 */
export function HeroCarousel({ projects }: HeroCarouselProps) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const flatListRef = useRef<FlatList<Project>>(null);
  const autoAdvanceTimer = useRef<NodeJS.Timeout | null>(null);
  const resumeTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear all timers on unmount or when dependencies change
   */
  const clearTimers = useCallback(() => {
    if (autoAdvanceTimer.current) {
      clearInterval(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
  }, []);

  /**
   * Advance to next project in carousel
   * Loops back to first project after reaching the end
   */
  const advanceToNext = useCallback(() => {
    if (projects.length === 0) return;

    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % projects.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      return nextIndex;
    });
  }, [projects.length]);

  /**
   * Start auto-advance timer
   * Only starts if not user interacting and there are projects
   */
  const startAutoAdvance = useCallback(() => {
    if (projects.length <= 1 || isUserInteracting) return;

    clearTimers();
    autoAdvanceTimer.current = setInterval(advanceToNext, AUTO_ADVANCE_INTERVAL);
  }, [projects.length, isUserInteracting, advanceToNext, clearTimers]);

  /**
   * Handle user interaction (scroll begin)
   * Pauses auto-advance and schedules resume after delay
   */
  const handleScrollBegin = useCallback(() => {
    setIsUserInteracting(true);
    clearTimers();

    // Schedule resume after user stops interacting
    resumeTimer.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, RESUME_DELAY);
  }, [clearTimers]);

  /**
   * Handle viewable items change (when scrolling stops)
   * Updates current index based on visible item
   */
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  // Start auto-advance when component mounts or when isUserInteracting changes
  useEffect(() => {
    if (!isUserInteracting) {
      startAutoAdvance();
    }

    return () => {
      clearTimers();
    };
  }, [isUserInteracting, startAutoAdvance, clearTimers]);

  const styles = StyleSheet.create({
    container: {
      height: CAROUSEL_HEIGHT,
      width: screenWidth,
    },
    slideContainer: {
      width: screenWidth,
      height: CAROUSEL_HEIGHT,
      position: "relative",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    gradientOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "50%",
      justifyContent: "flex-end",
      paddingHorizontal: DesignTokens.spacing[6],
      paddingBottom: DesignTokens.spacing[8],
      backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent dark overlay
    },
    featuredBadge: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: DesignTokens.spacing[2],
    },
    featuredText: {
      fontSize: DesignTokens.typography.fontSize.sm,
      fontWeight: DesignTokens.typography.fontWeight.semibold,
      fontFamily: DesignTokens.typography.fontFamily.semibold,
      color: theme.colors.showcase.accent,
      marginLeft: DesignTokens.spacing[1],
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    projectName: {
      fontSize: DesignTokens.typography.fontSize["4xl"],
      lineHeight:
        DesignTokens.typography.fontSize["4xl"] *
        DesignTokens.typography.lineHeight.tight,
      fontWeight: DesignTokens.typography.fontWeight.bold,
      fontFamily: DesignTokens.typography.fontFamily.bold,
      color: "#ffffff",
      marginBottom: DesignTokens.spacing[2],
    },
    location: {
      fontSize: DesignTokens.typography.fontSize.lg,
      lineHeight:
        DesignTokens.typography.fontSize.lg *
        DesignTokens.typography.lineHeight.normal,
      fontWeight: DesignTokens.typography.fontWeight.medium,
      fontFamily: DesignTokens.typography.fontFamily.medium,
      color: "rgba(255, 255, 255, 0.9)",
      marginBottom: DesignTokens.spacing[2],
    },
    description: {
      fontSize: DesignTokens.typography.fontSize.base,
      lineHeight:
        DesignTokens.typography.fontSize.base *
        DesignTokens.typography.lineHeight.normal,
      fontFamily: DesignTokens.typography.fontFamily.regular,
      color: "rgba(255, 255, 255, 0.85)",
      numberOfLines: 2,
    },
    paginationContainer: {
      position: "absolute",
      bottom: DesignTokens.spacing[3],
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: DesignTokens.spacing[1],
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: DesignTokens.spacing[8],
    },
    emptyStateIcon: {
      marginBottom: DesignTokens.spacing[4],
    },
    emptyStateTitle: {
      fontSize: DesignTokens.typography.fontSize.xl,
      fontWeight: DesignTokens.typography.fontWeight.semibold,
      fontFamily: DesignTokens.typography.fontFamily.semibold,
      color: theme.colors.text.primary,
      textAlign: "center",
      marginBottom: DesignTokens.spacing[2],
    },
    emptyStateMessage: {
      fontSize: DesignTokens.typography.fontSize.base,
      lineHeight:
        DesignTokens.typography.fontSize.base *
        DesignTokens.typography.lineHeight.normal,
      color: theme.colors.text.secondary,
      textAlign: "center",
    },
  });

  /**
   * Render a single carousel slide
   */
  const renderSlide = useCallback(
    ({ item: project }: ListRenderItemInfo<Project>) => (
      <View style={styles.slideContainer}>
        {/* Project Image */}
        <Image
          source={{ uri: project.thumbnail }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
          transition={300}
        />

        {/* Dark Overlay with Project Info */}
        <View style={styles.gradientOverlay}>
          {/* Featured Badge */}
          <View style={styles.featuredBadge}>
            <MaterialIcons
              name="star"
              size={16}
              color={theme.colors.showcase.accent}
            />
            <ThemedText style={styles.featuredText}>Featured</ThemedText>
          </View>

          {/* Project Name */}
          <ThemedText style={styles.projectName} numberOfLines={2}>
            {project.name}
          </ThemedText>

          {/* Location */}
          <ThemedText style={styles.location}>
            {project.location.neighborhood}
          </ThemedText>

          {/* Description */}
          <ThemedText style={styles.description} numberOfLines={2}>
            {project.briefDescription}
          </ThemedText>
        </View>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {projects.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor:
                    index === currentIndex
                      ? theme.colors.showcase.accent
                      : theme.colors.text.tertiary,
                  opacity: index === currentIndex ? 1 : 0.4,
                },
              ]}
            />
          ))}
        </View>
      </View>
    ),
    [projects, currentIndex, theme, styles]
  );

  // Empty state
  if (projects.length === 0) {
    return (
      <View style={[styles.container, styles.emptyStateContainer]}>
        <MaterialIcons
          name="star-border"
          size={64}
          color={theme.colors.showcase.accent}
          style={styles.emptyStateIcon}
        />
        <ThemedText style={styles.emptyStateTitle}>
          No featured projects yet
        </ThemedText>
        <ThemedText style={styles.emptyStateMessage}>
          Projects marked as featured will appear here
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={projects}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBegin}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        initialScrollIndex={0}
        onScrollToIndexFailed={() => {
          // Handle scroll failure gracefully
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        }}
      />
    </View>
  );
}

