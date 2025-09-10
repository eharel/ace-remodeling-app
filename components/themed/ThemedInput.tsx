import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

// Static styles that don't depend on theme or props
const staticStyles = StyleSheet.create({
  container: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    paddingRight: DesignTokens.spacing[4],
    fontSize: DesignTokens.typography.fontSize.base,
    fontFamily: DesignTokens.typography.fontFamily.regular,
  },
  inputWithClearButton: {
    paddingRight: 48, // 20px icon + 8px padding + 12px margin + 8px extra
  },
  clearButton: {
    position: "absolute",
    right: DesignTokens.spacing[3], // 12px from edge
    top: "50%",
    transform: [{ translateY: -18 }], // Center the button (20px icon + 16px padding = 36px total, so -18px)
    padding: DesignTokens.spacing[2], // 8px padding for better touch target
    borderRadius: DesignTokens.borderRadius.sm, // Rounded touch area
  },
});

interface ThemedInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;

  // Optional icons

  // Optional states
  error?: string;
  disabled?: boolean;
  loading?: boolean;

  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function ThemedInput({
  placeholder,
  value,
  onChangeText,
  error,
  disabled,
  loading,
  accessibilityLabel,
  accessibilityHint,
}: ThemedInputProps) {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Dynamic styles that depend on theme or props
  const dynamicStyles = useMemo(
    () => ({
      input: {
        backgroundColor: theme.colors.components.input.background,
        borderColor: error
          ? theme.colors.status.error
          : theme.colors.components.input.border,
        color: theme.colors.text.primary,
        opacity: disabled ? DesignTokens.interactions.disabledOpacity : 1,
      },
    }),
    [theme, error, disabled]
  );

  const handleChangeText = (text: string) => {
    setInputValue(text);
    onChangeText(text);
  };
  const handleClearInput = () => {
    setInputValue("");
    onChangeText("");
  };

  return (
    <View style={staticStyles.container}>
      <TextInput
        placeholder={placeholder}
        value={inputValue}
        onChangeText={handleChangeText}
        style={[
          staticStyles.input,
          dynamicStyles.input,
          inputValue.length > 0 && staticStyles.inputWithClearButton,
        ]}
        placeholderTextColor={theme.colors.components.input.placeholder}
        editable={!disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="search"
      />
      {inputValue.length > 0 && (
        <TouchableOpacity
          style={staticStyles.clearButton}
          onPress={handleClearInput}
          accessibilityLabel="Clear input"
          accessibilityRole="button"
          activeOpacity={DesignTokens.interactions.activeOpacity}
        >
          <MaterialIcons
            name="close"
            size={20}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
