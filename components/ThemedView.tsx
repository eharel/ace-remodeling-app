import React, { useMemo } from "react";
import { View, type ViewProps } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { ThemeVariant } from "@/themes";

export type ThemedViewProps = ViewProps & {
  variant?: ThemeVariant;
  elevated?: boolean;
  outlined?: boolean;
};

export function ThemedView({
  style,
  variant = "primary",
  elevated = false,
  outlined = false,
  ...otherProps
}: ThemedViewProps) {
  const { getThemeColor } = useTheme();

  // Generate theme-aware styles based on variant and props
  const themedStyles = useMemo(() => {
    const baseStyles: any = {};

    // Apply variant-based styling
    switch (variant) {
      case "primary":
        baseStyles.backgroundColor = getThemeColor("background.primary");
        break;
      case "secondary":
        baseStyles.backgroundColor = getThemeColor("background.secondary");
        break;
      case "card":
        baseStyles.backgroundColor = getThemeColor("background.card");
        baseStyles.borderColor = getThemeColor("border.primary");
        baseStyles.borderWidth = 1;
        break;
      case "elevated":
        baseStyles.backgroundColor = getThemeColor("background.elevated");
        baseStyles.shadowColor = getThemeColor("components.card.shadow");
        baseStyles.shadowOffset = { width: 0, height: 2 };
        baseStyles.shadowOpacity = 0.1;
        baseStyles.shadowRadius = 4;
        baseStyles.elevation = 2;
        break;
      case "outlined":
        baseStyles.backgroundColor = "transparent";
        baseStyles.borderColor = getThemeColor("border.primary");
        baseStyles.borderWidth = 1;
        break;
      case "ghost":
        baseStyles.backgroundColor = "transparent";
        break;
      default:
        baseStyles.backgroundColor = getThemeColor("background.primary");
    }

    // Apply additional props
    if (elevated) {
      baseStyles.shadowColor = getThemeColor("components.card.shadow");
      baseStyles.shadowOffset = { width: 0, height: 2 };
      baseStyles.shadowOpacity = 0.1;
      baseStyles.shadowRadius = 4;
      baseStyles.elevation = 2;
    }

    if (outlined) {
      baseStyles.borderColor = getThemeColor("border.primary");
      baseStyles.borderWidth = 1;
    }

    return baseStyles;
  }, [variant, elevated, outlined, getThemeColor]);

  return <View style={[themedStyles, style]} {...otherProps} />;
}

// Predefined style variants for common use cases
export const ThemedViewVariants = {
  // Container variants
  container: {
    variant: "primary" as const,
  },
  section: {
    variant: "secondary" as const,
  },

  // Card variants
  card: {
    variant: "card" as const,
  },
  elevatedCard: {
    variant: "elevated" as const,
  },
  outlinedCard: {
    variant: "outlined" as const,
  },

  // Interactive variants
  button: {
    variant: "primary" as const,
  },
  ghostButton: {
    variant: "ghost" as const,
  },
} as const;
