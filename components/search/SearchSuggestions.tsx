import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { DesignTokens, ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { ProjectSummary } from "@/types/Project";

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
    if (!query.trim() || query.trim().length < 2) {
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
          score = 100; // Exact match
        else if (project.name.toLowerCase().startsWith(lowerQuery))
          score = 50; // Starts with
        else if (nameMatch) score = 30; // Contains in name
        else if (descMatch) score = 20; // Contains in description
        else if (locationMatch) score = 10; // Contains in location

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
      maxHeight: 400,
    },
    header: {
      paddingHorizontal: DesignTokens.spacing[4],
      paddingVertical: DesignTokens.spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: "rgba(0, 0, 0, 0.1)",
    },
    suggestionsList: {
      maxHeight: 350,
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
              size={16}
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
              <ThemedText variant="caption" style={{ fontSize: 11 }}>
                {project.category}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </View>
    </ThemedView>
  );
}
