import React, { useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { Document } from "@/core/types";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

/**
 * Asset category tab type definition
 */
export type AssetCategoryValue = "floor-plan" | "materials" | "rendering-3d" | "contract" | "permit" | "invoice" | "other";

/**
 * Asset category counts for each category
 */
export interface AssetCounts {
  "floor-plan": number;
  materials: number;
  "rendering-3d": number;
  contract: number;
  permit: number;
  invoice: number;
  other: number;
}

/**
 * AssetCategoryTabs component props
 */
export interface AssetCategoryTabsProps {
  /** Currently active tab */
  activeTab: AssetCategoryValue;
  /** Callback when tab is changed */
  onTabChange: (tab: AssetCategoryValue) => void;
  /** Documents to count and filter */
  documents: Document[];
  /** Optional test ID */
  testID?: string;
}

/**
 * Tab configuration for rendering
 */
interface TabConfig {
  value: AssetCategoryValue;
  label: string;
  accessibilityLabel: string;
  documentType?: Document["type"];
}

/**
 * AssetCategoryTabs - Tab navigation component for filtering project assets
 *
 * Features:
 * - Dynamic tabs based on available document types
 * - Shows asset count for each category
 * - Theme-aware styling with clear active state
 * - Touch-optimized for iPad (44pt minimum height)
 * - Horizontally scrollable for smaller screens
 * - Accessible with proper ARIA roles
 *
 * @component
 */
export const AssetCategoryTabs: React.FC<AssetCategoryTabsProps> = ({
  activeTab,
  onTabChange,
  documents,
  testID = "asset-category-tabs",
}) => {
  const { theme } = useTheme();

  // Helper function to map category string to AssetCategoryValue
  const mapCategoryToTabValue = (category: string | undefined): AssetCategoryValue => {
    if (!category) return "other";
    const normalizedCategory = category.toLowerCase().trim();
    
    // Map common category values to tab values
    if (normalizedCategory === "plans" || normalizedCategory === "floor-plan" || normalizedCategory === "floor plan") {
      return "floor-plan";
    }
    if (normalizedCategory === "materials") {
      return "materials";
    }
    if (normalizedCategory === "rendering" || normalizedCategory === "rendering-3d" || normalizedCategory === "3d rendering" || normalizedCategory === "3d") {
      return "rendering-3d";
    }
    if (normalizedCategory === "contract" || normalizedCategory === "contracts") {
      return "contract";
    }
    if (normalizedCategory === "permit" || normalizedCategory === "permits") {
      return "permit";
    }
    if (normalizedCategory === "invoice" || normalizedCategory === "invoices") {
      return "invoice";
    }
    return "other";
  };

  // Calculate counts for each category using doc.category
  const assetCounts = useMemo<AssetCounts>(() => {
    const counts: AssetCounts = {
      "floor-plan": 0,
      materials: 0,
      "rendering-3d": 0,
      contract: 0,
      permit: 0,
      invoice: 0,
      other: 0,
    };

    documents.forEach((doc) => {
      const tabValue = mapCategoryToTabValue(doc.category);
      counts[tabValue]++;
    });

    return counts;
  }, [documents]);

  // Debug logging to investigate categorization issues

  // Helper function to get label for tab value
  const getTabLabel = (tabValue: AssetCategoryValue): string => {
    const labels: Record<AssetCategoryValue, string> = {
      "floor-plan": "Plans",
      "materials": "Materials",
      "rendering-3d": "Renderings",
      "contract": "Contracts",
      "permit": "Permits",
      "invoice": "Invoices",
      "other": "Other",
    };
    return labels[tabValue] || tabValue;
  };

  // Build tab configurations - only show tabs for categories that have documents
  const tabs: TabConfig[] = useMemo(() => {
    const tabConfigs: TabConfig[] = [];

    // Add tabs for each category that has documents (ordered by priority)
    const categoryOrder: AssetCategoryValue[] = [
      "floor-plan",
      "materials",
      "rendering-3d",
      "contract",
      "permit",
      "invoice",
      "other",
    ];

    categoryOrder.forEach((tabValue) => {
      if (assetCounts[tabValue] > 0) {
        tabConfigs.push({
          value: tabValue,
          label: getTabLabel(tabValue),
          accessibilityLabel: `${getTabLabel(tabValue)}, ${assetCounts[tabValue]} assets`,
        });
      }
    });

    return tabConfigs;
  }, [assetCounts]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.secondary,
          marginBottom: DesignTokens.spacing[4],
        },
        scrollView: {
          flexGrow: 0,
        },
        tabsContainer: {
          flexDirection: "row",
          gap: DesignTokens.spacing[6],
        },
        tab: {
          paddingHorizontal: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[3],
          minHeight: 44, // iPad touch target minimum
          justifyContent: "center",
          alignItems: "center",
          borderBottomWidth: 3,
          borderBottomColor: "transparent",
          marginBottom: -1, // Overlap with container border for clean look
        },
        tabActive: {
          borderBottomColor: theme.colors.components.button.primary,
        },
        tabContent: {
          flexDirection: "row",
          alignItems: "center",
          gap: DesignTokens.spacing[2],
        },
        tabLabel: {
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: DesignTokens.typography.fontWeight.normal,
          color: theme.colors.text.secondary,
        },
        tabLabelActive: {
          color: theme.colors.components.button.primary,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
        },
        tabCount: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.normal,
          color: theme.colors.text.secondary,
        },
        tabCountActive: {
          color: theme.colors.components.button.primary,
          fontWeight: DesignTokens.typography.fontWeight.medium,
        },
      }),
    [theme]
  );

  /**
   * Renders a single tab button
   */
  const renderTab = (tab: TabConfig) => {
    const isActive = activeTab === tab.value;
    const count = assetCounts[tab.value];

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

