import React, { forwardRef, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

export type ThemedInputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "outlined" | "filled";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
};

export const ThemedInput = forwardRef<TextInput, ThemedInputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = "default",
      size = "md",
      fullWidth = false,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      style,
      onFocus,
      onBlur,
      ...textInputProps
    },
    ref
  ) => {
    const { theme, getThemeColor } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Generate theme-aware styles based on variant, size, and state
    const inputStyles = useMemo(() => {
      const baseStyles: any = {
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
      };

      // Size-based styling
      switch (size) {
        case "sm":
          baseStyles.paddingVertical = 8;
          baseStyles.paddingHorizontal = 12;
          baseStyles.minHeight = 36;
          break;
        case "md":
          baseStyles.paddingVertical = 12;
          baseStyles.paddingHorizontal = 16;
          baseStyles.minHeight = 44;
          break;
        case "lg":
          baseStyles.paddingVertical = 16;
          baseStyles.paddingHorizontal = 20;
          baseStyles.minHeight = 52;
          break;
      }

      // Width styling
      if (fullWidth) {
        baseStyles.width = "100%";
      }

      // Variant-based styling
      switch (variant) {
        case "outlined":
          baseStyles.backgroundColor = "transparent";
          baseStyles.borderColor = isFocused
            ? getThemeColor("components.input.borderFocus")
            : getThemeColor("components.input.border");
          break;
        case "filled":
          baseStyles.backgroundColor = getThemeColor("background.secondary");
          baseStyles.borderColor = isFocused
            ? getThemeColor("components.input.borderFocus")
            : getThemeColor("components.input.border");
          break;
        case "default":
        default:
          baseStyles.backgroundColor = getThemeColor(
            "components.input.background"
          );
          baseStyles.borderColor = isFocused
            ? getThemeColor("components.input.borderFocus")
            : getThemeColor("components.input.border");
          break;
      }

      // Focus state
      if (isFocused) {
        baseStyles.borderWidth = 2;
      }

      // Error state
      if (error) {
        baseStyles.borderColor = getThemeColor("border.error");
      }

      return baseStyles;
    }, [variant, size, fullWidth, isFocused, error, getThemeColor]);

    // Text input styles
    const textInputStyles = useMemo(() => {
      const baseStyles: any = {
        flex: 1,
        color: getThemeColor("text.primary"),
        fontSize: size === "sm" ? 14 : size === "lg" ? 18 : 16,
        fontFamily: "Inter-Regular",
      };

      // Placeholder color
      if (textInputProps.placeholderTextColor === undefined) {
        baseStyles.placeholderTextColor = getThemeColor("text.placeholder");
      }

      return baseStyles;
    }, [size, getThemeColor, textInputProps.placeholderTextColor]);

    // Label styles
    const labelStyles = useMemo(() => {
      return {
        color: error
          ? getThemeColor("text.error")
          : getThemeColor("text.primary"),
        fontSize: size === "sm" ? 14 : 16,
        fontWeight: "500" as const,
        marginBottom: 6,
        fontFamily: "Inter-Medium",
      };
    }, [size, error, getThemeColor]);

    // Helper text styles
    const helperTextStyles = useMemo(() => {
      return {
        color: error
          ? getThemeColor("text.error")
          : getThemeColor("text.tertiary"),
        fontSize: 12,
        marginTop: 4,
        fontFamily: "Inter-Regular",
      };
    }, [error, getThemeColor]);

    // Handle focus events
    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        {label && <Text style={labelStyles}>{label}</Text>}

        {/* Input Container */}
        <View style={[inputStyles, inputStyle]}>
          {/* Left Icon */}
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={[textInputStyles, style]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...textInputProps}
          />

          {/* Right Icon */}
          {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        </View>

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <Text style={helperTextStyles}>{error || helperText}</Text>
        )}
      </View>
    );
  }
);

ThemedInput.displayName = "ThemedInput";

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  iconContainer: {
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

// Predefined input variants for common use cases
export const ThemedInputVariants = {
  // Basic inputs
  basic: {
    variant: "default" as const,
    size: "md" as const,
  },

  // Outlined inputs
  outlined: {
    variant: "outlined" as const,
    size: "md" as const,
  },

  // Filled inputs
  filled: {
    variant: "filled" as const,
    size: "md" as const,
  },

  // Compact inputs
  compact: {
    variant: "default" as const,
    size: "sm" as const,
  },

  // Large inputs
  large: {
    variant: "default" as const,
    size: "lg" as const,
  },
} as const;

