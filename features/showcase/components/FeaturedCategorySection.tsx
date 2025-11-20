import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { getCategoryConfig } from "@/core/constants/categoryConfig";
import { DesignTokens } from "@/core/themes";
import { Project, getProjectThumbnail } from "@/core/types";
import { ComponentCategory, CoreCategory } from "@/core/types/ComponentCategory";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { getCategoryIcon } from "@/shared/utils";

const CARD_WIDTH = 300; // ~280-320px for iPad
const CARD_HEIGHT = 240; // ~200-240px tall
const CARD_SPACING = DesignTokens.spacing[4];
const LIST_PADDING_LEFT = DesignTokens.spacing[6];
const BLURHASH_PLACEHOLDER = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";

interface FeaturedCategorySectionProps {
  category: ComponentCategory;
  projects: Project[];
}

// Static styles - created once, never change
const staticCardStyles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    height: 160,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000", // Prevent white flash while loading
  },
  featuredIcon: {
    marginRight: DesignTokens.spacing[1],
  },
  content: {
    padding: DesignTokens.spacing[3],
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.base,
    lineHeight:
      DesignTokens.typography.fontSize.base *
      DesignTokens.typography.lineHeight.tight,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    fontFamily: DesignTokens.typography.fontFamily.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  description: {
    fontSize: DesignTokens.typography.fontSize.sm,
    lineHeight:
      DesignTokens.typography.fontSize.sm *
      DesignTokens.typography.lineHeight.normal,
  },
});

const staticSectionStyles = StyleSheet.create({
  section: {
    marginTop: DesignTokens.spacing[8],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: LIST_PADDING_LEFT,
    marginBottom: DesignTokens.spacing[4],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: DesignTokens.borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: DesignTokens.spacing[3],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize["2xl"],
    lineHeight:
      DesignTokens.typography.fontSize["2xl"] *
      DesignTokens.typography.lineHeight.tight,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: DesignTokens.typography.fontFamily.bold,
    flex: 1,
  },
  listContainer: {
    paddingLeft: LIST_PADDING_LEFT,
  },
  cardWrapper: {
    marginRight: CARD_SPACING,
  },
});

/**
 * FeaturedProjectCard - Card component for horizontal scrolling featured projects
 *
 * Displays project thumbnail, name, brief description, and featured badge.
 * Optimized for horizontal FlatList with consistent sizing.
 */
function FeaturedProjectCard({ project }: { project: Project }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const shadowElevation = useSharedValue(4);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/project/${project.id}`);
  }, [project.id]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, {
      damping: 18,
      stiffness: 200,
      mass: 1,
    });
    shadowElevation.value = withSpring(8, {
      damping: 18,
      stiffness: 200,
    });
  }, [scale, shadowElevation]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: 18,
      stiffness: 200,
      mass: 1,
    });
    shadowElevation.value = withSpring(4, {
      damping: 18,
      stiffness: 200,
    });
  }, [scale, shadowElevation]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowElevation.value / 10,
    shadowRadius: shadowElevation.value * 1.5,
    elevation: shadowElevation.value,
  }));

  // Dynamic styles - only theme-dependent colors
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.lg,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          shadowColor: theme.colors.components.card.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
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
          shadowColor: theme.colors.showcase.accent,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.4,
          shadowRadius: 3,
          elevation: 2,
        },
        title: {
          ...staticCardStyles.title,
          color: theme.colors.text.primary,
        },
        description: {
          ...staticCardStyles.description,
          color: theme.colors.text.secondary,
        },
      }),
    [theme]
  );

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[dynamicStyles.card, animatedCardStyle]}
      accessibilityRole="button"
      accessibilityLabel={`View ${project.name} project details`}
      accessibilityHint="Double tap to view full project details"
    >
      {/* Project Image */}
      <View style={staticCardStyles.imageContainer}>
        <Image
          source={{ uri: getProjectThumbnail(project) }}
          style={staticCardStyles.image}
          contentFit="cover"
          placeholder={{ blurhash: BLURHASH_PLACEHOLDER }}
          transition={200}
          cachePolicy="memory-disk"
        />
        {/* Featured Badge */}
        <View style={dynamicStyles.featuredBadge}>
          <MaterialIcons
            name="star"
            size={14}
            color={theme.colors.showcase.accent}
            style={staticCardStyles.featuredIcon}
          />
          <ThemedText
            style={{
              fontSize: DesignTokens.typography.fontSize.xs,
              color: "#ffffff",
              fontWeight: DesignTokens.typography.fontWeight.semibold,
            }}
          >
            Featured
          </ThemedText>
        </View>
      </View>

      {/* Project Info */}
      <View style={staticCardStyles.content}>
        <ThemedText style={dynamicStyles.title} numberOfLines={1}>
          {project.name}
        </ThemedText>
        <ThemedText style={dynamicStyles.description} numberOfLines={2}>
          {project.summary}
        </ThemedText>
      </View>
    </AnimatedPressable>
  );
}

/**
 * FeaturedCategorySection - Horizontal scrolling section for featured projects by category
 *
 * Displays a section header with category icon and title, followed by a
 * horizontal FlatList of featured project cards. Only renders if projects array
 * has items.
 *
 * @param {ProjectCategory} category - The category for this section
 * @param {Project[]} projects - Featured projects in this category
 */
export function FeaturedCategorySection({
  category,
  projects,
}: FeaturedCategorySectionProps) {
  const { theme } = useTheme();

  // Get category config and icon - use fallbacks if not found
  const categoryConfig = getCategoryConfig(category as CoreCategory);
  const categoryIcon = getCategoryIcon(category);

  // Dynamic styles - only theme-dependent colors
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        iconContainer: {
          ...staticSectionStyles.iconContainer,
          backgroundColor: theme.colors.background.secondary,
        },
        title: {
          ...staticSectionStyles.title,
          color: theme.colors.text.primary,
        },
      }),
    [theme]
  );

  const renderCard = useCallback(
    ({ item }: ListRenderItemInfo<Project>) => (
      <View style={staticSectionStyles.cardWrapper}>
        <FeaturedProjectCard project={item} />
      </View>
    ),
    []
  );

  // Fixed getItemLayout - accounts for listContainer paddingLeft
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CARD_WIDTH + CARD_SPACING,
      // First item starts at paddingLeft, subsequent items are offset by card width + spacing
      offset: LIST_PADDING_LEFT + (CARD_WIDTH + CARD_SPACING) * index,
      index,
    }),
    []
  );

  // Early returns after all hooks
  if (projects.length === 0) {
    return null;
  }

  if (!categoryConfig) {
    // Skip categories without config
    return null;
  }

  return (
    <View style={staticSectionStyles.section}>
      {/* Section Header */}
      <View style={staticSectionStyles.header}>
        <View style={dynamicStyles.iconContainer}>
          <MaterialIcons
            name={categoryIcon as any}
            size={24}
            color={theme.colors.interactive.primary}
          />
        </View>
        <ThemedText style={dynamicStyles.title}>
          Featured {categoryConfig.title}
        </ThemedText>
      </View>

      {/* Horizontal Project List */}
      <FlatList
        data={projects}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={staticSectionStyles.listContainer}
        getItemLayout={getItemLayout}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
        pagingEnabled={false}
      />
    </View>
  );
}
