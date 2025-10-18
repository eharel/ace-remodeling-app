import { MaterialIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { DesignTokens } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";

interface SearchInputWithHistoryProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * SearchInputWithHistory Component
 * Enhanced search input with icons (Phase 2 - no history dropdown yet)
 */
export function SearchInputWithHistory({
  value,
  onChangeText,
  placeholder,
  disabled,
}: SearchInputWithHistoryProps) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleClear = () => {
    onChangeText("");
    inputRef.current?.focus();
  };

  const styles = StyleSheet.create({
    container: {
      position: "relative",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: DesignTokens.borderRadius.md,
      borderWidth: 1,
      borderColor: isFocused
        ? theme.colors.border.accent
        : theme.colors.border.primary,
      backgroundColor: theme.colors.background.card,
      paddingHorizontal: DesignTokens.spacing[3],
      paddingVertical: DesignTokens.spacing[2],
      gap: DesignTokens.spacing[2],
    },
    searchIcon: {
      opacity: 0.6,
    },
    input: {
      flex: 1,
      fontSize: DesignTokens.typography.fontSize.base,
      color: theme.colors.text.primary,
      paddingVertical: DesignTokens.spacing[1],
    },
    clearButton: {
      padding: DesignTokens.spacing[1],
      opacity: 0.6,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color={theme.colors.text.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.placeholder}
          editable={!disabled}
          returnKeyType="search"
          style={styles.input}
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <MaterialIcons
              name="close"
              size={20}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
