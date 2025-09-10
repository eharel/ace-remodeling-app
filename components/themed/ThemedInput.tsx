import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";
import { useMemo } from "react";
import { StyleSheet, TextInput } from "react-native";

interface ThemedInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;

  // Optional icons

  // Optional states
  error?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function ThemedInput({
  placeholder,
  value,
  onChangeText,
  error,
  disabled,
  loading,
}: ThemedInputProps) {
  const { theme } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        input: {
          // Use theme colors
          backgroundColor: theme.colors.components.input.background,
          borderColor: error
            ? theme.colors.status.error
            : theme.colors.components.input.border,
          borderWidth: 1,
          borderRadius: DesignTokens.borderRadius.md,
          paddingHorizontal: DesignTokens.spacing[4],
          paddingVertical: DesignTokens.spacing[3],

          // Typography from design tokens
          fontSize: DesignTokens.typography.fontSize.base,
          fontFamily: DesignTokens.typography.fontFamily.regular,
          color: theme.colors.text.primary,

          // States
          opacity: disabled ? DesignTokens.interactions.disabledOpacity : 1,
        },
      }),
    [theme, error, disabled]
  );

  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      placeholderTextColor={theme.colors.components.input.placeholder}
      editable={!disabled}
    />
  );
}
