import { useTheme } from "@/contexts";
import { DesignTokens } from "@/themes";
import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

// Constants for clear button calculations
const CLEAR_BUTTON_SIZE = DesignTokens.componentSizes.iconButton;
const CLEAR_BUTTON_PADDING = DesignTokens.spacing[2];
const CLEAR_BUTTON_TOTAL_SIZE = CLEAR_BUTTON_SIZE + CLEAR_BUTTON_PADDING * 2;

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
    paddingRight: CLEAR_BUTTON_TOTAL_SIZE + DesignTokens.spacing[3],
  },
  clearButton: {
    position: "absolute",
    right: DesignTokens.spacing[3],
    top: "50%",
    transform: [{ translateY: -CLEAR_BUTTON_TOTAL_SIZE / 2 }],
    padding: CLEAR_BUTTON_PADDING,
    borderRadius: DesignTokens.borderRadius.sm,
  },
});

interface ThemedInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
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
            size={CLEAR_BUTTON_SIZE}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
