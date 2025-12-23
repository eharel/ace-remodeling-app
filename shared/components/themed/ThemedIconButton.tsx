import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, PressableProps, StyleSheet, ViewStyle } from "react-native";

import { DesignTokens } from "@/shared/themes";
import { useTheme } from "@/shared/contexts";

/**
 * ThemedIconButton Component
 *
 * A consistent, theme-aware button component for icon-only interactions.
 * Used for close buttons, back buttons, action icons, etc.
 *
 * Features:
 * - Multiple variants (overlay, primary, secondary, ghost)
 * - Configurable size (small, medium, large)
 * - Theme-aware styling
 * - Consistent accessibility support
 * - Haptic feedback via activeOpacity simulation
 *
 * Variants:
 * - overlay: Semi-transparent background (good for modals, galleries)
 * - primary: Primary interactive color background
 * - secondary: Secondary interactive color background
 * - ghost: No background, just the icon
 *
 * Sizes:
 * - small: 32x32 (icon size 18)
 * - medium: 44x44 (icon size 24) - DEFAULT
 * - large: 56x56 (icon size 28)
 */

export interface ThemedIconButtonProps extends Omit<PressableProps, "style"> {
  /** Material icon name */
  icon: keyof typeof MaterialIcons.glyphMap;
  /** Button variant */
  variant?: "overlay" | "primary" | "secondary" | "ghost";
  /** Button size */
  size?: "small" | "medium" | "large";
  /** Custom icon size (overrides size preset) */
  iconSize?: number;
  /** Custom icon color (overrides theme color) */
  iconColor?: string;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

const SIZE_CONFIG = {
  small: {
    containerSize: DesignTokens.componentSizes.iconButtonSmall,
    iconSize: DesignTokens.componentSizes.iconSizeSmall,
  },
  medium: {
    containerSize: DesignTokens.componentSizes.iconButton,
    iconSize: DesignTokens.componentSizes.iconSize,
  },
  large: {
    containerSize: DesignTokens.componentSizes.iconButtonLarge,
    iconSize: DesignTokens.componentSizes.iconSizeLarge,
  },
} as const;

export function ThemedIconButton({
  icon,
  variant = "primary",
  size = "medium",
  iconSize: customIconSize,
  iconColor: customIconColor,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
  ...pressableProps
}: ThemedIconButtonProps) {
  const { theme } = useTheme();

  const sizeConfig = SIZE_CONFIG[size];
  const iconSize = customIconSize ?? sizeConfig.iconSize;

  // Determine colors based on variant
  const { backgroundColor, iconColor, borderColor, borderWidth } =
    useMemo(() => {
      switch (variant) {
        case "overlay":
          return {
            backgroundColor: theme.colors.background.overlay,
            iconColor: theme.colors.text.inverse,
            borderColor: undefined,
            borderWidth: DesignTokens.borderWidth.none,
          };
        case "primary":
          return {
            backgroundColor: theme.colors.interactive.primary,
            iconColor: theme.colors.text.inverse,
            borderColor: undefined,
            borderWidth: DesignTokens.borderWidth.none,
          };
        case "secondary":
          return {
            backgroundColor: theme.colors.interactive.secondary,
            iconColor: theme.colors.text.inverse,
            borderColor: undefined,
            borderWidth: DesignTokens.borderWidth.none,
          };
        case "ghost":
          return {
            backgroundColor: "transparent",
            iconColor: theme.colors.text.primary,
            borderColor: undefined,
            borderWidth: DesignTokens.borderWidth.none,
          };
        default:
          return {
            backgroundColor: theme.colors.interactive.primary,
            iconColor: theme.colors.text.inverse,
            borderColor: undefined,
            borderWidth: DesignTokens.borderWidth.none,
          };
      }
    }, [variant, theme]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          width: sizeConfig.containerSize,
          height: sizeConfig.containerSize,
          borderRadius: DesignTokens.borderRadius.full,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor,
          borderColor,
          borderWidth,
        },
      }),
    [sizeConfig, backgroundColor, borderColor, borderWidth]
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && { opacity: DesignTokens.interactions.activeOpacity },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
      {...pressableProps}
    >
      <MaterialIcons
        name={icon}
        size={iconSize}
        color={customIconColor ?? iconColor}
        accessibilityElementsHidden={true}
      />
    </Pressable>
  );
}
