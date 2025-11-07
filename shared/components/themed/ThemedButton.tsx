import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import { useTheme } from "@/shared/contexts";
import { ThemedText } from "./ThemedText";

/**
 * ThemedButton Component
 *
 * A consistent, theme-aware button component for text-based actions.
 * Used for primary actions, secondary actions, form submissions, etc.
 *
 * Features:
 * - Multiple variants (primary, secondary, ghost)
 * - Configurable size (small, medium, large)
 * - Optional icons (left or right)
 * - Loading state with spinner
 * - Full width option
 * - Theme-aware styling
 * - Consistent accessibility support
 *
 * Variants:
 * - primary: Primary action button with solid background
 * - secondary: Secondary action button with border
 * - ghost: Tertiary action, no background or border
 *
 * Sizes:
 * - small: Compact button (padding 2x3)
 * - medium: Standard button (padding 3x4) - DEFAULT
 * - large: Large button (padding 4x6)
 */

export interface ThemedButtonProps extends Omit<PressableProps, "style"> {
  /** Button text content */
  children: string;
  /** Button variant */
  variant?: "primary" | "secondary" | "ghost";
  /** Button size */
  size?: "small" | "medium" | "large";
  /** Optional icon to display (left side) */
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** Optional icon to display (right side) */
  iconRight?: keyof typeof MaterialIcons.glyphMap;
  /** Show loading spinner */
  loading?: boolean;
  /** Make button full width */
  fullWidth?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

const SIZE_CONFIG = {
  small: {
    paddingVertical: DesignTokens.spacing[2], // 8px
    paddingHorizontal: DesignTokens.spacing[3], // 12px
    fontSize: DesignTokens.typography.fontSize.sm,
    iconSize: 16,
  },
  medium: {
    paddingVertical: DesignTokens.spacing[3], // 12px
    paddingHorizontal: DesignTokens.spacing[4], // 16px
    fontSize: DesignTokens.typography.fontSize.base,
    iconSize: 18,
  },
  large: {
    paddingVertical: DesignTokens.spacing[4], // 16px
    paddingHorizontal: DesignTokens.spacing[6], // 24px
    fontSize: DesignTokens.typography.fontSize.lg,
    iconSize: 20,
  },
} as const;

export function ThemedButton({
  children,
  variant = "primary",
  size = "medium",
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  style,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  testID,
  ...pressableProps
}: ThemedButtonProps) {
  const { theme } = useTheme();

  const sizeConfig = SIZE_CONFIG[size];

  // Determine colors and styles based on variant
  const {
    backgroundColor,
    textColor,
    borderColor,
    borderWidth,
    pressedOpacity,
  } = useMemo(() => {
    if (disabled || loading) {
      return {
        backgroundColor:
          variant === "ghost"
            ? "transparent"
            : theme.colors.background.secondary,
        textColor: theme.colors.text.tertiary,
        borderColor:
          variant === "secondary" ? theme.colors.border.primary : undefined,
        borderWidth: variant === "secondary" ? 1 : 0,
        pressedOpacity: 1, // No press effect when disabled
      };
    }

    switch (variant) {
      case "primary":
        return {
          backgroundColor: theme.colors.interactive.primary,
          textColor: theme.colors.text.inverse,
          borderColor: undefined,
          borderWidth: 0,
          pressedOpacity: DesignTokens.interactions.activeOpacity,
        };
      case "secondary":
        return {
          backgroundColor: theme.colors.background.elevated,
          textColor: theme.colors.text.primary,
          borderColor: theme.colors.border.primary,
          borderWidth: 1,
          pressedOpacity: DesignTokens.interactions.activeOpacity,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          textColor: theme.colors.text.primary,
          borderColor: undefined,
          borderWidth: 0,
          pressedOpacity: DesignTokens.interactions.activeOpacity,
        };
      default:
        return {
          backgroundColor: theme.colors.interactive.primary,
          textColor: theme.colors.text.inverse,
          borderColor: undefined,
          borderWidth: 0,
          pressedOpacity: DesignTokens.interactions.activeOpacity,
        };
    }
  }, [variant, theme, disabled, loading]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        button: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: DesignTokens.spacing[2],
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: DesignTokens.borderRadius.md,
          backgroundColor,
          borderColor,
          borderWidth,
          minHeight: 44, // iOS minimum touch target
          ...(fullWidth && { width: "100%" }),
        },
        text: {
          fontSize: sizeConfig.fontSize,
          lineHeight:
            sizeConfig.fontSize * DesignTokens.typography.lineHeight.tight,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          color: textColor,
        },
      }),
    [
      sizeConfig,
      backgroundColor,
      textColor,
      borderColor,
      borderWidth,
      fullWidth,
    ]
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && { opacity: pressedOpacity },
        style,
      ]}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      testID={testID}
      {...pressableProps}
    >
      {/* Loading Spinner */}
      {loading && (
        <ActivityIndicator
          size="small"
          color={textColor}
          accessibilityLabel="Loading"
        />
      )}

      {/* Left Icon */}
      {!loading && icon && (
        <MaterialIcons
          name={icon}
          size={sizeConfig.iconSize}
          color={textColor}
          accessibilityElementsHidden={true}
        />
      )}

      {/* Button Text */}
      <ThemedText style={styles.text}>{children}</ThemedText>

      {/* Right Icon */}
      {!loading && iconRight && (
        <MaterialIcons
          name={iconRight}
          size={sizeConfig.iconSize}
          color={textColor}
          accessibilityElementsHidden={true}
        />
      )}
    </Pressable>
  );
}

