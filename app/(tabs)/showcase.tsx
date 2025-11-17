import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DesignTokens } from "@/core/themes";
import { HeroCarousel } from "@/features/showcase";
import { PageHeader, ThemedView } from "@/shared/components";
import { useProjects, useTheme } from "@/shared/contexts";

/**
 * Showcase Tab - Portfolio Showcase Screen
 *
 * Primary entry point for the app, displaying featured projects.
 * This is the new home screen that showcases our finest work.
 */
export default function ShowcaseScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { featuredProjects } = useProjects();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      paddingBottom: DesignTokens.spacing[8] + insets.bottom,
    },
    accentContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: DesignTokens.spacing[2],
    },
    accentLine: {
      width: 40,
      height: 3,
      backgroundColor: theme.colors.showcase.accent,
      borderRadius: DesignTokens.borderRadius.full,
      marginRight: DesignTokens.spacing[2],
    },
    accentIcon: {
      marginRight: DesignTokens.spacing[1],
    },
    carouselContainer: {
      marginTop: DesignTokens.spacing[6],
    },
  });

  return (
    <ThemedView style={styles.container}>
      <PageHeader
        title="Portfolio Showcase"
        subtitle="Our finest work"
        variant="default"
      >
        {/* Subtle showcase accent - gold line with star icon */}
        <View style={styles.accentContainer}>
          <View style={styles.accentLine} />
          <MaterialIcons
            name="star"
            size={16}
            color={theme.colors.showcase.accent}
            style={styles.accentIcon}
          />
        </View>
      </PageHeader>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero Carousel - Auto-advancing featured projects */}
        <View style={styles.carouselContainer}>
          <HeroCarousel projects={featuredProjects} />
        </View>

        {/* TODO: Category sections will be added in next phase */}
      </ScrollView>
    </ThemedView>
  );
}

