import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import { ProjectSummary } from "@/core/types/Project";
import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { SearchHistoryItem } from "@/shared/utils";

import { SearchSuggestions } from "./SearchSuggestions";

/**
 * Props for the SearchInputWithHistory component
 *
 * Enhanced search input that provides:
 * - Search suggestions as user types (≥2 characters)
 * - Search history when input is empty and focused
 * - Clear button and proper keyboard handling
 * - Integration with project search functionality
 */
interface SearchInputWithHistoryProps {
  /** Current input value (controlled by parent) */
  value: string;
  /** Callback when input text changes */
  onChangeText: (text: string) => void;
  /** Callback when user selects a history item */
  onSelectHistory: (query: string) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Search history items (managed by parent) */
  history: SearchHistoryItem[];
  /** Callback to remove a specific history item */
  onRemoveHistory: (query: string) => void;
  /** Callback to clear all search history */
  onClearHistory: () => void;
  /** Callback to add current query to history */
  onAddToHistory: (query: string) => void;
  /** Projects to search through for suggestions */
  projects: ProjectSummary[];
  /** Callback when user selects a project from suggestions */
  onSelectProject: (projectId: string) => void;
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
  history,
  onRemoveHistory,
  onClearHistory,
  onAddToHistory,
  projects,
  onSelectProject,
}: SearchInputWithHistoryProps) {
  const { theme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  // History is now passed as props from parent (single state instance)

  // Calculate when to show dropdowns (Phase 9: Add suggestions)
  const shouldShowHistory =
    isFocused && value.trim() === "" && history.length > 0;
  const shouldShowSuggestions = isFocused && value.trim().length >= 2;

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

  const handleRemoveHistory = (query: string) => {
    onRemoveHistory(query);
    inputRef.current?.focus();
  };

  const handleClearAll = useCallback(() => {
    onClearHistory();
    inputRef.current?.focus();
  }, [onClearHistory]);

  const handleSubmit = () => {
    // Only save to history if query is ≥2 characters
    if (value.trim().length >= 2) {
      onAddToHistory(value.trim());
    }
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: DesignTokens.spacing[4],
      paddingVertical: DesignTokens.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.secondary,
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
    removeButton: {
      padding: DesignTokens.spacing[1],
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
          onSubmitEditing={handleSubmit}
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

      {/* Phase 9: Show suggestions when typing, history when empty */}
      {shouldShowSuggestions && (
        <SearchSuggestions
          projects={projects}
          query={value}
          onSelectProject={onSelectProject}
        />
      )}

      {shouldShowHistory && !shouldShowSuggestions && (
        <ThemedView variant="elevated" style={styles.historyDropdown}>
          {/* Header Section */}
          <View style={styles.historyHeader}>
            <ThemedText variant="caption" style={{ fontWeight: "600" }}>
              Recent Searches
            </ThemedText>

            {/* Clear All Button */}
            <Pressable hitSlop={8} onPress={handleClearAll}>
              <ThemedText
                variant="caption"
                style={{ color: theme.colors.components.button.primary }}
              >
                Clear All
              </ThemedText>
            </Pressable>
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

                {/* Remove button */}
                <Pressable
                  style={styles.removeButton}
                  hitSlop={8}
                  onPress={(e) => {
                    e.stopPropagation(); // Prevent parent Pressable from firing
                    handleRemoveHistory(item.query);
                  }}
                >
                  <MaterialIcons
                    name="close"
                    size={18}
                    color={theme.colors.text.primary}
                  />
                </Pressable>
              </Pressable>
            ))}
          </View>
        </ThemedView>
      )}
    </View>
  );
}
