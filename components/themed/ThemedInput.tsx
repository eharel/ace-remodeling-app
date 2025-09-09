import { useTheme } from "@/contexts/ThemeContext";
import { styling } from "@/utils/styling";
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
  const { getThemeColor } = useTheme();
  const styles = StyleSheet.create({
    input: {
      // Use theme colors
      backgroundColor: getThemeColor("components.input.background"),
      borderColor: error
        ? getThemeColor("status.error")
        : getThemeColor("components.input.border"),
      borderWidth: 1,
      borderRadius: styling.borderRadius("md"),
      paddingHorizontal: styling.spacing(4),
      paddingVertical: styling.spacing(3),

      // Typography from design tokens
      fontSize: styling.fontSize("base"),
      fontFamily: styling.fontFamily("regular"),
      color: getThemeColor("text.primary"),

      // States
      opacity: disabled ? styling.interaction("disabledOpacity") : 1,
    },
  });

  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      placeholderTextColor={getThemeColor("components.input.placeholder")}
      editable={!disabled}
    />
  );
}
