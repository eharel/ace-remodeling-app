import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

/**
 * Photo tab type definition
 */
export type PhotoTabValue = "all" | "before" | "progress" | "after";

/**
 * Photo counts for each category
 */
export interface PhotoCounts {
  all: number;
  before: number;
  progress: number;
  after: number;
}

/**
 * PhotoTabs component props
 */
export interface PhotoTabsProps {
  /** Currently active tab */
  activeTab: PhotoTabValue;
  /** Callback when tab is changed */
  onTabChange: (tab: PhotoTabValue) => void;
  /** Photo counts for each category */
  photoCounts: PhotoCounts;
  /** Optional test ID */
  testID?: string;
}

/**
 * Tab configuration for rendering
 */
interface TabConfig {
  value: PhotoTabValue;
  label: string;
  accessibilityLabel: string;
}

/**
 * PhotoTabs - Tab navigation component for filtering project photos
 *
 * Features:
 * - 4 tabs: All Photos, Before, In Progress, After
 * - Shows photo count for each category
 * - Theme-aware styling with clear active state
 * - Touch-optimized for iPad (44pt minimum height)
 * - Horizontally scrollable for smaller screens
 * - Accessible with proper ARIA roles
 *
 * @component
 * @example
 * ```tsx
 * <PhotoTabs
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   photoCounts={{ all: 20, before: 5, progress: 10, after: 5 }}
 * />
 * ```
 */
export const PhotoTabs: React.FC<PhotoTabsProps> = ({
  activeTab,
  onTabChange,
  photoCounts,
  testID = "photo-tabs",
}) => {
  const { theme } = useTheme();

  // Tab configurations
  const tabs: TabConfig[] = useMemo(
    () => [
      {
        value: "all" as const,
        label: "All Photos",
        accessibilityLabel: `All Photos, ${photoCounts.all} total`,
      },
      {
        value: "before" as const,
        label: "Before",
        accessibilityLabel: `Before photos, ${photoCounts.before} photos`,
      },
      {
        value: "progress" as const,
        label: "In Progress",
        accessibilityLabel: `In Progress photos, ${photoCounts.progress} photos`,
      },
      {
        value: "after" as const,
        label: "After",
        accessibilityLabel: `After photos, ${photoCounts.after} photos`,
      },
    ],
    [photoCounts]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.primary,
          backgroundColor: theme.colors.background.primary,
        },
        scrollView: {
          flexGrow: 0,
        },
        tabsContainer: {
          flexDirection: "row",
          paddingHorizontal: DesignTokens.spacing[4],
        },
        tab: {
          paddingHorizontal: DesignTokens.spacing[4],
          paddingVertical: DesignTokens.spacing[3],
          marginRight: DesignTokens.spacing[2],
          minHeight: 44, // iPad touch target minimum
          justifyContent: "center",
          alignItems: "center",
          borderBottomWidth: 3,
          borderBottomColor: "transparent",
        },
        tabActive: {
          borderBottomColor: theme.colors.interactive.primary,
        },
        tabContent: {
          flexDirection: "row",
          alignItems: "center",
          gap: DesignTokens.spacing[2],
        },
        tabLabel: {
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          color: theme.colors.text.secondary,
        },
        tabLabelActive: {
          color: theme.colors.interactive.primary,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
        },
        tabCount: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          color: theme.colors.text.secondary,
        },
        tabCountActive: {
          color: theme.colors.interactive.primary,
        },
      }),
    [theme]
  );

  /**
   * Renders a single tab button
   */
  const renderTab = (tab: TabConfig) => {
    const isActive = activeTab === tab.value;
    const count = photoCounts[tab.value];

    return (
      <Pressable
        key={tab.value}
        onPress={() => onTabChange(tab.value)}
        style={[styles.tab, isActive && styles.tabActive]}
        accessibilityRole="tab"
        accessibilityLabel={tab.accessibilityLabel}
        accessibilityState={{ selected: isActive }}
        testID={`${testID}-${tab.value}`}
        android_ripple={{
          color: `${theme.colors.interactive.primary}20`,
          borderless: false,
        }}
      >
        <View style={styles.tabContent}>
          <ThemedText style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
            {tab.label}
          </ThemedText>
          <ThemedText style={[styles.tabCount, isActive && styles.tabCountActive]}>
            ({count})
          </ThemedText>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
        testID={`${testID}-scroll`}
      >
        <View style={styles.tabsContainer}>{tabs.map(renderTab)}</View>
      </ScrollView>
    </View>
  );
};

