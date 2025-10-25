import { useTheme } from "@/contexts";
import { DesignTokens } from "@/themes";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed/ThemedText";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // For custom content below title/subtitle
}

/**
 * PageHeader - Standardized page header component
 *
 * Features:
 * - Consistent top spacing (64px from top)
 * - Standardized typography
 * - Optional subtitle
 * - Optional custom content
 * - Theme-aware styling
 *
 * Usage:
 * <PageHeader title="Portfolio" subtitle="Browse our projects by category" />
 */
export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
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
    paddingTop: DesignTokens.spacing[16], // 64px - standardized top spacing
    paddingHorizontal: DesignTokens.spacing[4], // 16px side padding
    marginBottom: DesignTokens.spacing[6], // 24px bottom margin
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
