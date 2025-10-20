import { MaterialIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { DesignTokens, ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { useSearchHistory } from "@/utils/useSearchHistory";

interface SearchInputWithHistoryProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectHistory: (query: string) => void;
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
  onSelectHistory,
  placeholder,
  disabled,
}: SearchInputWithHistoryProps) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Phase 3: Add history hook
  const { history } = useSearchHistory();

  // Calculate when to show dropdown
  const shouldShowHistory =
    isFocused && value.trim() === "" && history.length > 0;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    // Critical: 200ms delay to allow Pressable events to register
    setTimeout(() => setIsFocused(false), 200);
  };

  const handleClear = () => {
    onChangeText("");
    inputRef.current?.focus();
  };

  const handleSelectHistory = (query: string) => {
    // Update parent-controlled value and ensure local change path too
    onSelectHistory(query);
    onChangeText(query);
    inputRef.current?.focus();
  };

  const styles = StyleSheet.create({
    container: {
      position: "relative",
      zIndex: 1000,
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
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
    historyDropdown: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      marginTop: DesignTokens.spacing[2],
      borderRadius: DesignTokens.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.secondary,
      zIndex: 1002,
      overflow: "hidden",
    },
    historyHeader: {
      paddingHorizontal: DesignTokens.spacing[4],
      paddingVertical: DesignTokens.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: "rgba(0, 0, 0, 0.1)",
    },
    historyList: {
      maxHeight: 200,
    },
    historyItem: {
      paddingHorizontal: DesignTokens.spacing[4],
      paddingVertical: DesignTokens.spacing[3],
      flexDirection: "row",
      alignItems: "center",
    },
    historyIcon: {
      marginRight: DesignTokens.spacing[2],
    },
    historyText: {
      flex: 1,
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

      {shouldShowHistory && (
        <ThemedView variant="elevated" style={styles.historyDropdown}>
          {/* Header Section */}
          <View style={styles.historyHeader}>
            <ThemedText variant="caption" style={{ fontWeight: "600" }}>
              Recent Searches
            </ThemedText>
          </View>

          {/* History List - FIXED: Replace FlatList with simple View */}
          <View style={styles.historyList}>
            {history.map((item) => (
              <Pressable
                key={item.query}
                style={({ pressed }) => [
                  styles.historyItem,
                  {
                    backgroundColor: pressed
                      ? theme.colors.background.secondary
                      : "transparent",
                  },
                ]}
                onPress={() => handleSelectHistory(item.query)}
              >
                <MaterialIcons
                  name="history"
                  size={16}
                  color={theme.colors.text.tertiary}
                  style={styles.historyIcon}
                />
                <ThemedText
                  variant="body"
                  numberOfLines={1}
                  style={styles.historyText}
                >
                  {item.query}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>
      )}
    </View>
  );
}
