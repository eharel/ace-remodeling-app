import React, { useMemo } from "react";
import { Text, type TextProps } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

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
  type?: "default" | "defaultSemiBold"; // Legacy support
  color?: string; // Allow custom color override
};

export function ThemedText({
  style,
  variant = "default",
  type, // Legacy support
  color,
  ...rest
}: ThemedTextProps) {
  const { theme } = useTheme();

  // Generate theme-aware styles based on variant
  const themedStyles = useMemo(() => {
    const baseStyles: any = {};

    // Apply variant-based styling
    switch (variant) {
      case "title":
        baseStyles.fontSize = 32;
        baseStyles.fontWeight = "bold";
        baseStyles.lineHeight = 32;
        baseStyles.fontFamily = "Inter-Bold";
        baseStyles.color = color || theme.colors.text.primary;
        break;
      case "subtitle":
        baseStyles.fontSize = 20;
        baseStyles.fontWeight = "bold";
        baseStyles.fontFamily = "Inter-Bold";
        baseStyles.color = color || theme.colors.text.primary;
        break;
      case "body":
        baseStyles.fontSize = 16;
        baseStyles.lineHeight = 24;
        baseStyles.fontFamily = "Inter-Regular";
        baseStyles.color = color || theme.colors.text.secondary;
        break;
      case "caption":
        baseStyles.fontSize = 14;
        baseStyles.fontFamily = "Inter-Regular";
        baseStyles.color = color || theme.colors.text.secondary;
        break;
      case "link":
        baseStyles.fontSize = 16;
        baseStyles.lineHeight = 30;
        baseStyles.fontFamily = "Inter-Regular";
        baseStyles.color = color || theme.colors.text.accent;
        break;
      case "error":
        baseStyles.fontSize = 16;
        baseStyles.lineHeight = 24;
        baseStyles.fontFamily = "Inter-Regular";
        baseStyles.color = color || theme.colors.status.error;
        break;
      case "success":
        baseStyles.fontSize = 16;
        baseStyles.lineHeight = 24;
        baseStyles.fontFamily = "Inter-Regular";
        baseStyles.color = color || theme.colors.status.success;
        break;
      case "warning":
        baseStyles.fontSize = 16;
        baseStyles.lineHeight = 24;
        baseStyles.fontFamily = "Inter-Regular";
        baseStyles.color = color || theme.colors.status.warning;
        break;
      case "info":
        baseStyles.fontSize = 16;
        baseStyles.lineHeight = 24;
        baseStyles.fontFamily = "Inter-Regular";
        baseStyles.color = color || theme.colors.status.info;
        break;
      case "default":
      default:
        baseStyles.fontSize = 16;
        baseStyles.lineHeight = 24;
        baseStyles.fontFamily = "Inter-Regular";
        baseStyles.color = color || theme.colors.text.primary;
        break;
    }

    // Legacy type support (deprecated, use variant instead)
    if (type === "defaultSemiBold") {
      baseStyles.fontWeight = "600";
      baseStyles.fontFamily = "Inter-SemiBold";
    }

    return baseStyles;
  }, [variant, type, color, theme]);

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
