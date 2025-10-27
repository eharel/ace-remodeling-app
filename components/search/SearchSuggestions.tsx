import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens, ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts";
import { ProjectSummary } from "@/types/Project";

// Constants for SearchSuggestions component
const SEARCH_SUGGESTIONS_CONSTANTS = {
  // Query requirements
  MIN_QUERY_LENGTH: 2, // Minimum characters to show suggestions

  // Scoring system
  EXACT_MATCH_SCORE: 100, // Exact name match
  STARTS_WITH_SCORE: 50, // Name starts with query
  NAME_CONTAINS_SCORE: 30, // Name contains query
  DESCRIPTION_SCORE: 20, // Description contains query
  LOCATION_SCORE: 10, // Location contains query

  // UI sizing
  DROPDOWN_MAX_HEIGHT: 400, // Maximum dropdown height
  SUGGESTIONS_LIST_MAX_HEIGHT: 350, // Maximum suggestions list height
  ICON_SIZE: 16, // Material icon size
} as const;

const MAX_SUGGESTIONS = 10;

interface SearchSuggestionsProps {
  projects: ProjectSummary[];
  query: string;
  onSelectProject: (projectId: string) => void;
  maxSuggestions?: number;
}

/**
 * SearchSuggestions Component
 * Shows live project suggestions as user types
 */
export function SearchSuggestions({
  projects,
  query,
  onSelectProject,
  maxSuggestions = MAX_SUGGESTIONS,
}: SearchSuggestionsProps) {
  const { theme } = useTheme();

  // Filter and sort projects based on query
  const suggestions = useMemo(() => {
    if (
      !query.trim() ||
      query.trim().length < SEARCH_SUGGESTIONS_CONSTANTS.MIN_QUERY_LENGTH
    ) {
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();

    // Create scored matches
    const matches = projects
      .map((project) => {
        const nameMatch = project.name.toLowerCase().includes(lowerQuery);
        const descMatch = project.briefDescription
          ?.toLowerCase()
          .includes(lowerQuery);
        const locationMatch =
          project.location?.neighborhood?.toLowerCase().includes(lowerQuery) ||
          project.location?.zipCode?.includes(lowerQuery);

        // Calculate relevance score
        let score = 0;
        if (project.name.toLowerCase() === lowerQuery)
          score = SEARCH_SUGGESTIONS_CONSTANTS.EXACT_MATCH_SCORE; // Exact match
        else if (project.name.toLowerCase().startsWith(lowerQuery))
          score = SEARCH_SUGGESTIONS_CONSTANTS.STARTS_WITH_SCORE; // Starts with
        else if (nameMatch)
          score =
            SEARCH_SUGGESTIONS_CONSTANTS.NAME_CONTAINS_SCORE; // Contains in name
        else if (descMatch)
          score =
            SEARCH_SUGGESTIONS_CONSTANTS.DESCRIPTION_SCORE; // Contains in description
        else if (locationMatch)
          score = SEARCH_SUGGESTIONS_CONSTANTS.LOCATION_SCORE; // Contains in location

        return { project, score };
      })
      .filter((match) => match.score > 0) // Only include matches
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, maxSuggestions) // Limit results
      .map((match) => match.project);

    return matches;
  }, [projects, query, maxSuggestions]);

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
        {suggestions.map((project) => (
          <Pressable
            key={project.id}
            onPress={() => onSelectProject(project.id)}
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
              {project.name}
            </ThemedText>
            <View style={styles.categoryBadge}>
              <ThemedText
                variant="caption"
                style={{ fontSize: DesignTokens.typography.fontSize.xs }}
              >
                {project.category}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </View>
    </ThemedView>
  );
}
