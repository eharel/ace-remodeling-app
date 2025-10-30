import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { useTheme } from "../contexts";
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
}

/**
 * PageHeader - Standardized page header component
 *
 * Single source of truth for all page headers across the app.
 * Supports both simple text titles and complex custom components.
 *
 * Features:
 * - Consistent top spacing (64px default, 32px compact)
 * - Standardized typography
 * - Optional back button with custom labels
 * - Support for custom title components (dropdowns, filters, etc.)
 * - Optional subtitle
 * - Optional custom content below header
 * - Theme-aware styling
 *
 * Variants:
 * - default: 64px top spacing (for pages without nav bars)
 * - compact: 32px top spacing (for pages with nav bars)
 *
 * Usage Examples:
 *
 * // Simple text title:
 * <PageHeader title="About Us" showBack backLabel="Settings" />
 *
 * // Custom interactive title:
 * <PageHeader customTitle={<CategoryPicker />} showBack backLabel="Portfolio" />
 *
 * // With subtitle:
 * <PageHeader
 *   title="Projects"
 *   subtitle="Browse our portfolio"
 *   showBack
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

  return (
    <View
      style={[
        styles.container,
        variant === "compact" && styles.containerCompact,
      ]}
    >
      {/* Back Button */}
      {showBack && (
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          activeOpacity={DesignTokens.interactions.activeOpacity}
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
        </TouchableOpacity>
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
});
