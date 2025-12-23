import React, { useMemo } from "react";
import { Text, type TextProps } from "react-native";

import { DesignTokens } from "@/shared/themes";
import { useTheme } from "../../contexts";

/**
 * ThemedText Component
 *
 * A theme-aware Text component that provides consistent typography across the app.
 *
 * Line Height Guidelines:
 * - Compact UI variants (title, subtitle, caption): Use tight lineHeight (1.2x)
 * - Readable text (body, link, status): Use normal lineHeight (1.4x)
 * - Never rely on React Native's default lineHeight in compact layouts
 *
 * Variants:
 * - title: Large heading text with tight lineHeight
 * - subtitle: Medium heading text with tight lineHeight
 * - body: Regular body text with normal lineHeight
 * - caption: Small UI text with tight lineHeight
 * - link: Interactive text with normal lineHeight
 * - error/success/warning/info: Status text with normal lineHeight
 * - default: Standard text with normal lineHeight
 */

export type ThemedTextProps = TextProps & {
  variant?:
    | "default"
    | "title"
    | "subtitle"
    | "body"
    | "caption"
    | "link"
    | "error"
    | "success"
    | "warning"
    | "info";
};

export function ThemedText({
  style,
  variant = "default",
  ...rest
}: ThemedTextProps) {
  const { theme } = useTheme();

  // Generate theme-aware styles based on variant
  const themedStyles = useMemo(() => {
    const baseStyles: any = {};

    // Apply variant-based styling
    switch (variant) {
      case "title":
        baseStyles.fontSize = DesignTokens.typography.fontSize["2xl"];
        baseStyles.fontWeight = DesignTokens.typography.fontWeight.bold;
        baseStyles.lineHeight =
          DesignTokens.typography.fontSize["2xl"] *
          DesignTokens.typography.lineHeight.tight;
        baseStyles.fontFamily = DesignTokens.typography.fontFamily.bold;
        baseStyles.color = theme.colors.text.primary;
        break;
      case "subtitle":
        baseStyles.fontSize = DesignTokens.typography.fontSize.xl;
        baseStyles.fontWeight = DesignTokens.typography.fontWeight.bold;
        baseStyles.lineHeight =
          DesignTokens.typography.fontSize.xl *
          DesignTokens.typography.lineHeight.tight;
        baseStyles.fontFamily = DesignTokens.typography.fontFamily.bold;
        baseStyles.color = theme.colors.text.primary;
        break;
      case "body":
        baseStyles.fontSize = DesignTokens.typography.fontSize.base;
        baseStyles.lineHeight =
          DesignTokens.typography.fontSize.base *
          DesignTokens.typography.lineHeight.normal;
        baseStyles.fontFamily = DesignTokens.typography.fontFamily.regular;
        baseStyles.color = theme.colors.text.secondary;
        break;
      case "caption":
        baseStyles.fontSize = DesignTokens.typography.fontSize.sm;
        baseStyles.lineHeight =
          DesignTokens.typography.fontSize.sm *
          DesignTokens.typography.lineHeight.tight;
        baseStyles.fontFamily = DesignTokens.typography.fontFamily.regular;
        baseStyles.color = theme.colors.text.secondary;
        break;
      case "link":
        baseStyles.fontSize = DesignTokens.typography.fontSize.base;
        baseStyles.lineHeight =
          DesignTokens.typography.fontSize.base *
          DesignTokens.typography.lineHeight.normal;
        baseStyles.fontFamily = DesignTokens.typography.fontFamily.regular;
        baseStyles.color = theme.colors.text.accent;
        break;
      case "error":
        baseStyles.fontSize = DesignTokens.typography.fontSize.base;
        baseStyles.lineHeight =
          DesignTokens.typography.fontSize.base *
          DesignTokens.typography.lineHeight.normal;
        baseStyles.fontFamily = DesignTokens.typography.fontFamily.regular;
        baseStyles.color = theme.colors.status.error;
        break;
      case "success":
        baseStyles.fontSize = DesignTokens.typography.fontSize.base;
        baseStyles.lineHeight =
          DesignTokens.typography.fontSize.base *
          DesignTokens.typography.lineHeight.normal;
        baseStyles.fontFamily = DesignTokens.typography.fontFamily.regular;
        baseStyles.color = theme.colors.status.success;
        break;
      case "warning":
        baseStyles.fontSize = DesignTokens.typography.fontSize.base;
        baseStyles.lineHeight =
          DesignTokens.typography.fontSize.base *
          DesignTokens.typography.lineHeight.normal;
        baseStyles.fontFamily = DesignTokens.typography.fontFamily.regular;
        baseStyles.color = theme.colors.status.warning;
        break;
      case "info":
        baseStyles.fontSize = DesignTokens.typography.fontSize.base;
        baseStyles.lineHeight =
          DesignTokens.typography.fontSize.base *
          DesignTokens.typography.lineHeight.normal;
        baseStyles.fontFamily = DesignTokens.typography.fontFamily.regular;
        baseStyles.color = theme.colors.status.info;
        break;
      case "default":
      default:
        baseStyles.fontSize = DesignTokens.typography.fontSize.base;
        baseStyles.lineHeight =
          DesignTokens.typography.fontSize.base *
          DesignTokens.typography.lineHeight.normal;
        baseStyles.fontFamily = DesignTokens.typography.fontFamily.regular;
        baseStyles.color = theme.colors.text.primary;
        break;
    }

    return baseStyles;
  }, [variant, theme]);

  return <Text style={[themedStyles, style]} {...rest} />;
}

// Predefined text variants for common use cases
export const ThemedTextVariants = {
  // Heading variants
  heading: {
    variant: "title" as const,
  },
  subheading: {
    variant: "subtitle" as const,
  },

  // Content variants
  body: {
    variant: "body" as const,
  },
  caption: {
    variant: "caption" as const,
  },

  // Interactive variants
  link: {
    variant: "link" as const,
  },

  // Status variants
  error: {
    variant: "error" as const,
  },
  success: {
    variant: "success" as const,
  },
  warning: {
    variant: "warning" as const,
  },
  info: {
    variant: "info" as const,
  },
} as const;
