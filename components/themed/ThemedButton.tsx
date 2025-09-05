import React, { useMemo } from "react";
import { Pressable, Text, ViewStyle, type PressableProps } from "react-native";

import { ThemeVariant } from "@/constants/DesignTokens";
import { useTheme } from "@/contexts/ThemeContext";

export type ThemedButtonProps = PressableProps & {
  variant?: ThemeVariant;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ThemedButton({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  style,
  ...pressableProps
}: ThemedButtonProps) {
  const { theme, getThemeColor, getComponentColor } = useTheme();

  // Generate theme-aware styles based on variant and size
  const buttonStyles = useMemo(() => {
    const baseStyles: any = {
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    };

    // Size-based styling
    switch (size) {
      case "sm":
        baseStyles.paddingVertical = 8;
        baseStyles.paddingHorizontal = 16;
        baseStyles.minHeight = 36;
        break;
      case "md":
        baseStyles.paddingVertical = 12;
        baseStyles.paddingHorizontal = 24;
        baseStyles.minHeight = 44;
        break;
      case "lg":
        baseStyles.paddingVertical = 16;
        baseStyles.paddingHorizontal = 32;
        baseStyles.minHeight = 52;
        break;
    }

    // Width styling
    if (fullWidth) {
      baseStyles.width = "100%";
    }

    // Variant-based styling
    switch (variant) {
      case "primary":
        baseStyles.backgroundColor = getComponentColor("button", "primary");
        baseStyles.borderWidth = 0;
        break;
      case "secondary":
        baseStyles.backgroundColor = getComponentColor("button", "secondary");
        baseStyles.borderWidth = 0;
        break;
      case "outline":
        baseStyles.backgroundColor = getComponentColor("button", "outline");
        baseStyles.borderWidth = 1;
        baseStyles.borderColor = getComponentColor("button", "outlineBorder");
        break;
      case "ghost":
        baseStyles.backgroundColor = "transparent";
        baseStyles.borderWidth = 0;
        break;
      case "elevated":
        baseStyles.backgroundColor = getComponentColor("button", "primary");
        baseStyles.borderWidth = 0;
        baseStyles.shadowColor = getThemeColor("components.card.shadow");
        baseStyles.shadowOffset = { width: 0, height: 2 };
        baseStyles.shadowOpacity = 0.15;
        baseStyles.shadowRadius = 4;
        baseStyles.elevation = 3;
        break;
      default:
        baseStyles.backgroundColor = getComponentColor("button", "primary");
        baseStyles.borderWidth = 0;
    }

    // Disabled state
    if (disabled) {
      baseStyles.backgroundColor = getThemeColor("interactive.disabled");
      baseStyles.opacity = 0.6;
    }

    return baseStyles;
  }, [variant, size, disabled, fullWidth, getThemeColor, getComponentColor]);

  // Generate text styles
  const textStyles = useMemo(() => {
    const baseStyles: any = {
      fontWeight: "600",
      textAlign: "center",
    };

    // Size-based text styling
    switch (size) {
      case "sm":
        baseStyles.fontSize = 14;
        break;
      case "md":
        baseStyles.fontSize = 16;
        break;
      case "lg":
        baseStyles.fontSize = 18;
        break;
    }

    // Variant-based text color
    switch (variant) {
      case "primary":
      case "elevated":
        baseStyles.color = getThemeColor("text.inverse");
        break;
      case "secondary":
        baseStyles.color = getThemeColor("text.inverse");
        break;
      case "outline":
        baseStyles.color = getThemeColor("text.primary");
        break;
      case "ghost":
        baseStyles.color = getThemeColor("text.primary");
        break;
      default:
        baseStyles.color = getThemeColor("text.inverse");
    }

    // Disabled state
    if (disabled) {
      baseStyles.color = getThemeColor("interactive.disabledText");
    }

    return baseStyles;
  }, [variant, size, disabled, getThemeColor]);

  // Press state styles
  const pressableStyles = useMemo(() => {
    return ({ pressed }: { pressed: boolean }) => [
      buttonStyles,
      pressed && {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
      },
      style,
    ];
  }, [buttonStyles, style]);

  return (
    <Pressable
      style={pressableStyles}
      disabled={disabled || loading}
      android_ripple={{
        color: getThemeColor("interactive.primaryHover"),
        borderless: false,
      }}
      {...pressableProps}
    >
      {loading ? (
        <Text style={textStyles}>Loading...</Text>
      ) : (
        <Text style={textStyles}>{children}</Text>
      )}
    </Pressable>
  );
}

// Predefined button variants for common use cases
export const ThemedButtonVariants = {
  // Primary actions
  primary: {
    variant: "primary" as const,
    size: "md" as const,
  },
  primaryLarge: {
    variant: "primary" as const,
    size: "lg" as const,
  },

  // Secondary actions
  secondary: {
    variant: "secondary" as const,
    size: "md" as const,
  },

  // Outline actions
  outline: {
    variant: "outline" as const,
    size: "md" as const,
  },

  // Ghost actions
  ghost: {
    variant: "ghost" as const,
    size: "md" as const,
  },

  // Elevated actions
  elevated: {
    variant: "elevated" as const,
    size: "md" as const,
  },
} as const;

