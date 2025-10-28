import { DesignTokens } from "@/core/themes";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../contexts";
import { ThemedText } from "./themed/ThemedText";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // For custom content below title/subtitle
  variant?: "default" | "compact"; // Spacing variant
}

/**
 * PageHeader - Standardized page header component
 *
 * Features:
 * - Consistent top spacing (64px default, 32px compact)
 * - Standardized typography
 * - Optional subtitle
 * - Optional custom content
 * - Theme-aware styling
 * - Variant support for different spacing needs
 *
 * Variants:
 * - default: 64px top spacing (for pages without nav bars)
 * - compact: 32px top spacing (for pages with nav bars)
 *
 * Usage:
 * <PageHeader title="Portfolio" subtitle="Browse our projects by category" />
 * <PageHeader title="Kitchen" variant="compact" />
 */
export function PageHeader({
  title,
  subtitle,
  children,
  variant = "default",
}: PageHeaderProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        variant === "compact" && styles.containerCompact,
      ]}
    >
      <ThemedText variant="title" style={styles.title}>
        {title}
      </ThemedText>

      {subtitle && (
        <ThemedText variant="body" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      )}

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
