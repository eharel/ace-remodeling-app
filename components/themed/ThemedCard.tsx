import React, { useMemo } from "react";
import { View, type ViewProps, ViewStyle } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

export type ThemedCardProps = ViewProps & {
  variant?: "default" | "elevated" | "outlined" | "filled";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ThemedCard({
  variant = "default",
  padding = "md",
  children,
  style,
  ...viewProps
}: ThemedCardProps) {
  const { theme, getThemeColor } = useTheme();

  // Generate theme-aware styles based on variant and padding
  const cardStyles = useMemo(() => {
    const baseStyles: any = {
      borderRadius: 12,
      backgroundColor: getThemeColor("background.card"),
    };

    // Variant-based styling
    switch (variant) {
      case "elevated":
        baseStyles.shadowColor = getThemeColor("components.card.shadow");
        baseStyles.shadowOffset = { width: 0, height: 4 };
        baseStyles.shadowOpacity = 0.15;
        baseStyles.shadowRadius = 8;
        baseStyles.elevation = 4;
        baseStyles.backgroundColor = getThemeColor("background.elevated");
        break;
      case "outlined":
        baseStyles.borderWidth = 1;
        baseStyles.borderColor = getThemeColor("border.primary");
        baseStyles.backgroundColor = "transparent";
        break;
      case "filled":
        baseStyles.backgroundColor = getThemeColor("background.secondary");
        break;
      case "default":
      default:
        baseStyles.borderWidth = 1;
        baseStyles.borderColor = getThemeColor("border.primary");
        baseStyles.shadowColor = getThemeColor("components.card.shadow");
        baseStyles.shadowOffset = { width: 0, height: 2 };
        baseStyles.shadowOpacity = 0.1;
        baseStyles.shadowRadius = 4;
        baseStyles.elevation = 2;
        break;
    }

    // Padding-based styling
    switch (padding) {
      case "none":
        baseStyles.padding = 0;
        break;
      case "sm":
        baseStyles.padding = 12;
        break;
      case "md":
        baseStyles.padding = 16;
        break;
      case "lg":
        baseStyles.padding = 24;
        break;
    }

    return baseStyles;
  }, [variant, padding, getThemeColor]);

  return (
    <View style={[cardStyles, style]} {...viewProps}>
      {children}
    </View>
  );
}

// Predefined card variants for common use cases
export const ThemedCardVariants = {
  // Basic cards
  basic: {
    variant: "default" as const,
    padding: "md" as const,
  },

  // Elevated cards
  elevated: {
    variant: "elevated" as const,
    padding: "md" as const,
  },

  // Outlined cards
  outlined: {
    variant: "outlined" as const,
    padding: "md" as const,
  },

  // Filled cards
  filled: {
    variant: "filled" as const,
    padding: "md" as const,
  },

  // Compact cards
  compact: {
    variant: "default" as const,
    padding: "sm" as const,
  },

  // Spacious cards
  spacious: {
    variant: "default" as const,
    padding: "lg" as const,
  },
} as const;

