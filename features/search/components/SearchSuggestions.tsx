import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens } from "@/shared/themes";
import { ProjectCardView } from "@/shared/types";
import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { calculateCardViewScore } from "../utils/searchScoring";

/**
 * Constants for SearchSuggestions component UI behavior
 *
 * These values control the UI appearance and behavior.
 * Scoring constants are now imported from utils/searchScoring.ts
 */
const SEARCH_SUGGESTIONS_CONSTANTS = {
  /** Query requirements */
  MIN_QUERY_LENGTH: 2, // Minimum characters required to show suggestions

  /** UI sizing */
  DROPDOWN_MAX_HEIGHT: 400, // Maximum dropdown height in pixels
  SUGGESTIONS_LIST_MAX_HEIGHT: 350, // Maximum suggestions list height
  ICON_SIZE: 16, // Material icon size for search icon
} as const;

const MAX_SUGGESTIONS = 10;

interface SearchSuggestionsProps {
  cardViews: ProjectCardView[];
  query: string;
  onSelectCard: (cardView: ProjectCardView) => void;
  maxSuggestions?: number;
}

/**
 * SearchSuggestions Component
 * Shows live project suggestions as user types
 */
export function SearchSuggestions({
  cardViews,
  query,
  onSelectCard,
  maxSuggestions = MAX_SUGGESTIONS,
}: SearchSuggestionsProps) {
  const { theme } = useTheme();

  // Filter and sort card views based on query
  /**
   * Generates project suggestions based on search query using a scoring algorithm
   *
   * Scoring system (higher = better match):
   * - Exact name match: 100 points
   * - Name starts with query: 50 points
   * - Name contains query: 30 points
   * - Description contains query: 20 points
   * - Location contains query: 10 points
   *
   * Results are sorted by score (highest first) and limited to MAX_SUGGESTIONS.
   * Only shows suggestions for queries ≥2 characters.
   *
   * @returns Array of ProjectCardView objects matching the query, sorted by relevance
   */
  const suggestions = useMemo(() => {
    if (
      !query.trim() ||
      query.trim().length < SEARCH_SUGGESTIONS_CONSTANTS.MIN_QUERY_LENGTH
    ) {
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();

    // Create scored matches using pure utility function
    const matches = cardViews
      .map((cardView) => ({
        cardView,
        score: calculateCardViewScore(lowerQuery, cardView),
      }))
      .filter((match) => match.score > 0) // Only include matches
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, maxSuggestions) // Limit results
      .map((match) => match.cardView);

    return matches;
  }, [cardViews, query, maxSuggestions]);

  // Don't render if no suggestions
  if (suggestions.length === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    dropdown: {
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
      maxHeight: SEARCH_SUGGESTIONS_CONSTANTS.DROPDOWN_MAX_HEIGHT,
    },
    header: {
      paddingHorizontal: DesignTokens.spacing[4],
      paddingVertical: DesignTokens.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.secondary,
    },
    suggestionsList: {
      maxHeight: SEARCH_SUGGESTIONS_CONSTANTS.SUGGESTIONS_LIST_MAX_HEIGHT,
    },
    suggestionItem: {
      paddingHorizontal: DesignTokens.spacing[4],
      paddingVertical: DesignTokens.spacing[3],
      flexDirection: "row",
      alignItems: "center",
    },
    searchIcon: {
      marginRight: DesignTokens.spacing[2],
    },
    suggestionText: {
      flex: 1,
    },
    categoryBadge: {
      paddingHorizontal: DesignTokens.spacing[2],
      paddingVertical: DesignTokens.spacing[1],
      borderRadius: DesignTokens.borderRadius.sm,
      backgroundColor: theme.colors.background.secondary,
      marginLeft: DesignTokens.spacing[2],
    },
  });

  return (
    <ThemedView variant="elevated" style={styles.dropdown}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText variant="caption" style={{ fontWeight: "600" }}>
          Suggestions
        </ThemedText>
      </View>

      {/* Suggestions List */}
      <View style={styles.suggestionsList}>
        {suggestions.map((cardView) => (
          <Pressable
            key={cardView.componentId}
            onPress={() => onSelectCard(cardView)}
            style={({ pressed }) => [
              styles.suggestionItem,
              {
                backgroundColor: pressed
                  ? theme.colors.background.secondary
                  : "transparent",
              },
            ]}
          >
            <MaterialIcons
              name="search"
              size={SEARCH_SUGGESTIONS_CONSTANTS.ICON_SIZE}
              color={theme.colors.text.tertiary}
              style={styles.searchIcon}
            />
            <ThemedText
              variant="body"
              numberOfLines={1}
              style={styles.suggestionText}
            >
              {cardView.displayName}
            </ThemedText>
            <View style={styles.categoryBadge}>
              <ThemedText
                variant="caption"
                style={{ fontSize: DesignTokens.typography.fontSize.xs }}
              >
                {cardView.category || "Miscellaneous"}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </View>
    </ThemedView>
  );
}
