import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { DesignTokens } from "@/shared/themes";
import { Project, getProjectThumbnail } from "@/shared/types";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

const { width: screenWidth } = Dimensions.get("window");
const CAROUSEL_HEIGHT = 480; // ~40% of typical iPad height
const AUTO_ADVANCE_INTERVAL = DesignTokens.carousel.autoAdvanceInterval;
const RESUME_DELAY = 3000; // 3 seconds after user interaction
const BLURHASH_PLACEHOLDER = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface HeroCarouselProps {
  projects: Project[];
}

interface HeroSlideProps {
  project: Project;
  onPress: (id: string) => void;
  showcaseAccent: string;
  textTertiary: string;
  projects: Project[];
  currentIndex: number;
}

// Static styles - created once, never change
const staticStyles = StyleSheet.create({
  container: {
    height: CAROUSEL_HEIGHT,
    width: screenWidth,
  },
  slideContainer: {
    width: screenWidth,
    height: CAROUSEL_HEIGHT,
    position: "relative",
    backgroundColor: "#000", // Prevent white flash during transitions
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000", // Prevent white flash while loading
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
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DesignTokens.spacing[2],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    fontFamily: DesignTokens.typography.fontFamily.semibold,
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
    textAlign: "center",
    marginBottom: DesignTokens.spacing[2],
  },
  emptyStateMessage: {
    fontSize: DesignTokens.typography.fontSize.base,
    lineHeight:
      DesignTokens.typography.fontSize.base *
      DesignTokens.typography.lineHeight.normal,
    textAlign: "center",
  },
});

/**
 * HeroSlide - Individual carousel slide with animations
 * Optimized: only receives specific color props, not entire theme
 * Removed overlay fade animation to prevent white flash
 */
const HeroSlide = React.memo(
  ({
    project,
    onPress,
    showcaseAccent,
    textTertiary,
    projects,
    currentIndex,
  }: HeroSlideProps) => {
    const scale = useSharedValue(1);

    const animatedPressableStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.98, {
        damping: 18,
        stiffness: 200,
        mass: 1,
      });
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 200,
        mass: 1,
      });
    }, [scale]);

    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

    // Dynamic styles - only colors that change with theme
    const dynamicStyles = useMemo(
      () => ({
        featuredText: {
          ...staticStyles.featuredText,
          color: showcaseAccent,
        },
      }),
      [showcaseAccent]
    );

    return (
      <AnimatedPressable
        style={[staticStyles.slideContainer, animatedPressableStyle]}
        onPress={() => onPress(project.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`View ${project.name} project details`}
        accessibilityHint="Tap to view full project details"
      >
        {/* Project Image */}
        <Image
          source={{ uri: getProjectThumbnail(project) }}
          style={staticStyles.image}
          contentFit="cover"
          placeholder={{ blurhash: BLURHASH_PLACEHOLDER }}
          transition={200}
          cachePolicy="memory-disk"
          priority="high"
        />

        {/* Dark Overlay with Project Info - No fade animation to prevent flash */}
        <View style={staticStyles.gradientOverlay}>
          {/* Featured Badge */}
          <View style={staticStyles.featuredBadge}>
            <MaterialIcons name="star" size={16} color={showcaseAccent} />
            <ThemedText style={dynamicStyles.featuredText}>Featured</ThemedText>
          </View>

          {/* Project Name */}
          <ThemedText style={staticStyles.projectName} numberOfLines={2}>
            {project.name}
          </ThemedText>

          {/* Location */}
          {project.location?.neighborhood && (
            <ThemedText style={staticStyles.location}>
              {project.location.neighborhood}
            </ThemedText>
          )}

          {/* Description */}
          <ThemedText style={staticStyles.description} numberOfLines={2}>
            {project.summary}
          </ThemedText>
        </View>

        {/* Pagination Dots - Memoized to prevent unnecessary re-renders */}
        <View style={staticStyles.paginationContainer}>
          {projects.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={[
                  staticStyles.paginationDot,
                  {
                    backgroundColor: isActive ? showcaseAccent : textTertiary,
                    opacity: isActive ? 1 : 0.4,
                  },
                ]}
              />
            );
          })}
        </View>
      </AnimatedPressable>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memoization
    // Only re-render if project or currentIndex changes, or colors change
    return (
      prevProps.project.id === nextProps.project.id &&
      prevProps.currentIndex === nextProps.currentIndex &&
      prevProps.showcaseAccent === nextProps.showcaseAccent &&
      prevProps.textTertiary === nextProps.textTertiary
    );
  }
);

// Set display name for better debugging
HeroSlide.displayName = "HeroSlide";

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
  const autoAdvanceTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract only the colors we need for HeroSlide
  const showcaseAccent = theme.colors.showcase.accent;
  const textTertiary = theme.colors.text.tertiary;

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
   * Only advances if user is not currently interacting
   */
  const advanceToNext = useCallback(() => {
    if (projects.length === 0 || isUserInteracting) return;

    setCurrentIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % projects.length;
      // Use requestAnimationFrame to ensure smooth animation
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      });
      return nextIndex;
    });
  }, [projects.length, isUserInteracting]);

  /**
   * Start auto-advance timer
   * Only starts if not user interacting and there are projects
   */
  const startAutoAdvance = useCallback(() => {
    if (projects.length <= 1 || isUserInteracting) return;

    clearTimers();
    autoAdvanceTimer.current = setInterval(
      advanceToNext,
      AUTO_ADVANCE_INTERVAL
    );
  }, [projects.length, isUserInteracting, advanceToNext, clearTimers]);

  /**
   * Handle user interaction (scroll begin)
   * Pauses auto-advance and schedules resume after delay
   * Also clears any pending auto-advance to prevent conflicts
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
   * Handle scroll end - reset resume timer if user continues scrolling
   */
  const handleScrollEndDrag = useCallback(() => {
    // Reset resume timer when user finishes dragging
    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
    }
    resumeTimer.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, RESUME_DELAY);
  }, []);

  /**
   * Handle viewable items change (when scrolling stops)
   * Updates current index based on visible item
   * Optimized to only update when index actually changes
   */
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100, // Require item to be visible for 100ms before considering it viewed
  });

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        // Only update if index actually changed to avoid unnecessary re-renders
        if (
          newIndex !== currentIndex &&
          newIndex >= 0 &&
          newIndex < projects.length
        ) {
          setCurrentIndex(newIndex);
          // Haptic feedback on slide change (defer to avoid blocking scroll)
          setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }, 0);
        }
      }
    },
    [currentIndex, projects.length]
  );

  /**
   * Handle momentum scroll end for more reliable index updates
   * This fires after scroll animation completes, ensuring accurate index
   */
  const handleMomentumScrollEnd = useCallback(
    (event: any) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(offsetX / screenWidth);

      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < projects.length
      ) {
        setCurrentIndex(newIndex);
      }
    },
    [currentIndex, projects.length]
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

  // Dynamic styles - only theme-dependent colors
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        emptyStateTitle: {
          ...staticStyles.emptyStateTitle,
          color: theme.colors.text.primary,
        },
        emptyStateMessage: {
          ...staticStyles.emptyStateMessage,
          color: theme.colors.text.secondary,
        },
      }),
    [theme]
  );

  /**
   * Handle project slide press - navigate to project detail
   * Includes haptic feedback for premium feel
   */
  const handleProjectPress = useCallback((projectId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/project/${projectId}`);
  }, []);

  /**
   * Render a single carousel slide
   * Optimized: Memoized with stable dependencies
   */
  const renderSlide = useCallback(
    ({ item: project }: ListRenderItemInfo<Project>) => (
      <HeroSlide
        project={project}
        onPress={handleProjectPress}
        showcaseAccent={showcaseAccent}
        textTertiary={textTertiary}
        projects={projects}
        currentIndex={currentIndex}
      />
    ),
    [handleProjectPress, showcaseAccent, textTertiary, projects, currentIndex]
  );

  /**
   * Key extractor - stable function reference
   */
  const keyExtractor = useCallback((item: Project) => item.id, []);

  /**
   * Get item layout - stable function reference for performance
   */
  const getItemLayout = useCallback(
    (_data: ArrayLike<Project> | null | undefined, index: number) => ({
      length: screenWidth,
      offset: screenWidth * index,
      index,
    }),
    []
  );

  // Empty state
  if (projects.length === 0) {
    return (
      <View style={[staticStyles.container, staticStyles.emptyStateContainer]}>
        <MaterialIcons
          name="star-border"
          size={64}
          color={showcaseAccent}
          style={staticStyles.emptyStateIcon}
        />
        <ThemedText style={dynamicStyles.emptyStateTitle}>
          No featured projects yet
        </ThemedText>
        <ThemedText style={dynamicStyles.emptyStateMessage}>
          Projects marked as featured will appear here
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={staticStyles.container}>
      <FlatList
        ref={flatListRef}
        data={projects}
        renderItem={renderSlide}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth}
        snapToAlignment="center"
        decelerationRate="fast"
        onScrollBeginDrag={handleScrollBegin}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfigRef.current}
        getItemLayout={getItemLayout}
        initialScrollIndex={0}
        // Performance optimizations
        removeClippedSubviews={true} // Enable for better memory management
        maxToRenderPerBatch={2} // Render 2 items per batch for smooth scrolling
        windowSize={3} // Keep 3 screens worth of items in memory (current + 1 on each side)
        initialNumToRender={2} // Render 2 items initially
        updateCellsBatchingPeriod={50} // Batch updates every 50ms
        onScrollToIndexFailed={(info) => {
          // Handle scroll failure gracefully - wait for layout then retry
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            if (flatListRef.current && info.index < projects.length) {
              flatListRef.current.scrollToIndex({
                index: info.index,
                animated: false,
              });
            }
          });
        }}
      />
    </View>
  );
}
