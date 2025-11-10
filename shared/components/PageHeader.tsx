import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { useTheme } from "../contexts";
import { ThemedIconButton } from "./themed/ThemedIconButton";
import { ThemedText } from "./themed/ThemedText";

interface PageHeaderProps {
  title?: string; // Make optional since we now support customTitle
  customTitle?: React.ReactNode; // Support custom React components as title (e.g., dropdown pickers)
  subtitle?: string;
  children?: React.ReactNode; // For custom content below title/subtitle
  variant?: "default" | "compact"; // Spacing variant
  // Back button props
  showBack?: boolean; // Whether to show back button
  backLabel?: string; // Optional label next to back button
  onBack?: () => void; // Custom back handler (defaults to router.back())
  // Layout mode
  layoutMode?: "stacked" | "inline"; // Layout pattern (stacked for content, inline for control bars)
}

/**
 * PageHeader - Standardized page header component
 *
 * Single source of truth for all page headers across the app.
 * Supports both simple text titles and complex custom components.
 * Supports two layout modes for different header patterns.
 *
 * Features:
 * - Consistent top spacing (64px default, 32px compact)
 * - Standardized typography
 * - Optional back button with custom labels
 * - Support for custom title components (dropdowns, filters, etc.)
 * - Two layout modes: stacked (default) and inline
 * - Optional subtitle
 * - Optional custom content below header
 * - Theme-aware styling
 *
 * Layout Modes:
 * - stacked (default): Back button above title, for content pages
 * - inline: Back button and title side-by-side, for control bars
 *
 * Variants:
 * - default: 64px top spacing (for pages without nav bars)
 * - compact: 32px top spacing (for pages with nav bars)
 *
 * Usage Examples:
 *
 * // Content page (stacked layout - default):
 * <PageHeader
 *   title="About Us"
 *   subtitle="Our story"
 *   showBack
 *   backLabel="Settings"
 * />
 *
 * // Control bar (inline layout):
 * <PageHeader
 *   customTitle={<CategoryPicker />}
 *   showBack
 *   backLabel="Portfolio"
 *   layoutMode="inline"
 * />
 *
 * // Simple text with inline layout:
 * <PageHeader
 *   title="Projects"
 *   showBack
 *   layoutMode="inline"
 * />
 */
export function PageHeader({
  title,
  customTitle,
  subtitle,
  children,
  variant = "default",
  showBack = false,
  backLabel,
  onBack,
  layoutMode = "stacked", // Default to stacked for backward compatibility
}: PageHeaderProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Render inline layout (control bar pattern)
  if (layoutMode === "inline") {
    return (
      <View
        style={[
          styles.container,
          variant === "compact" && styles.containerCompact,
        ]}
      >
        {/* Control Bar: Back button and title on same line */}
        <View style={styles.controlBar}>
          {/* Back Button - Left Side */}
          {showBack && (
            <Pressable
              style={styles.controlBarBackButton}
              onPress={handleBackPress}
              accessibilityLabel={`Go back to ${
                backLabel || "previous screen"
              }`}
              accessibilityRole="button"
            >
              <MaterialIcons
                name="chevron-left"
                size={28}
                color={theme.colors.text.primary}
              />
              {backLabel && (
                <ThemedText variant="body" style={styles.backLabel}>
                  {backLabel}
                </ThemedText>
              )}
            </Pressable>
          )}

          {/* Title - Right Side (custom or text) */}
          {customTitle ? (
            <View style={styles.controlBarTitle}>{customTitle}</View>
          ) : title ? (
            <View style={styles.controlBarTitle}>
              <ThemedText variant="title" style={styles.title}>
                {title}
              </ThemedText>
            </View>
          ) : null}
        </View>

        {/* Subtitle (appears below control bar) */}
        {subtitle && (
          <ThemedText variant="body" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}

        {/* Custom Children */}
        {children && <View style={styles.children}>{children}</View>}
      </View>
    );
  }

  // Render stacked layout (content page pattern) - DEFAULT
  return (
    <View
      style={[
        styles.container,
        variant === "compact" && styles.containerCompact,
      ]}
    >
      {/* Back Button (on its own line above title) */}
      {showBack && (
        <Pressable
          style={styles.backButton}
          onPress={handleBackPress}
          accessibilityLabel={`Go back to ${backLabel || "previous screen"}`}
          accessibilityRole="button"
        >
          <MaterialIcons
            name="chevron-left"
            size={28}
            color={theme.colors.text.primary}
          />
          {backLabel && (
            <ThemedText variant="body" style={styles.backLabel}>
              {backLabel}
            </ThemedText>
          )}
        </Pressable>
      )}

      {/* Title - Render customTitle if provided, otherwise use text title */}
      {customTitle ? (
        <View style={styles.customTitleContainer}>{customTitle}</View>
      ) : title ? (
        <ThemedText variant="title" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}

      {/* Subtitle */}
      {subtitle && (
        <ThemedText variant="body" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      )}

      {/* Custom Children */}
      {children && <View style={styles.children}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: DesignTokens.spacing[16], // 64px - for pages WITHOUT nav bar
    paddingHorizontal: DesignTokens.spacing[4], // 16px side padding
    marginBottom: DesignTokens.spacing[6], // 24px bottom margin
  },
  containerCompact: {
    paddingTop: DesignTokens.spacing[8], // 32px - for pages WITH nav bar
  },
  // STACKED LAYOUT STYLES
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: DesignTokens.spacing[2], // 8px vertical padding for touch target
    paddingRight: DesignTokens.spacing[3], // 12px right padding
    marginBottom: DesignTokens.spacing[4], // 16px space below back button
    marginLeft: -DesignTokens.spacing[1], // -4px optical alignment with title
  },
  backLabel: {
    marginLeft: DesignTokens.spacing[1], // 4px space between icon and label
  },
  customTitleContainer: {
    // Match the spacing/alignment of text titles
    // No additional styling needed - let custom component control its own appearance
  },
  title: {
    // Uses ThemedText variant="title" styling
    // No additional styles needed - handled by variant
  },
  subtitle: {
    marginTop: DesignTokens.spacing[2], // 8px between title and subtitle
    opacity: 0.7, // Subtle subtitle
  },
  children: {
    marginTop: DesignTokens.spacing[4], // 16px between header content and children
  },
  // INLINE LAYOUT STYLES
  controlBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: DesignTokens.spacing[4], // 16px space below control bar
  },
  controlBarBackButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: DesignTokens.spacing[2], // 8px vertical padding for touch target
    paddingRight: DesignTokens.spacing[3], // 12px right padding
    marginLeft: -DesignTokens.spacing[1], // -4px optical alignment
  },
  controlBarTitle: {
    flex: 1,
    alignItems: "flex-end", // Align to right side
    paddingLeft: DesignTokens.spacing[4], // 16px space from back button
  },
});
