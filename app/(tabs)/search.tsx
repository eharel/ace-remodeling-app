import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useDebounce } from "use-debounce";

import { ProjectGallery } from "@/components/ProjectGallery";
import { ErrorState } from "@/components/error-states";
import {
  DesignTokens,
  ThemedInput,
  ThemedText,
  ThemedView,
} from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { mockProjects } from "@/data/mockProjects";
import { Project, ProjectSummary } from "@/types/Project";
import { logError, logWarning } from "@/utils/errorLogger";

// Constants
const SEARCH_DEBOUNCE_MS = 500;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Remove padding from here since ProjectGallery has its own
  },
  header: {
    marginTop: DesignTokens.spacing[16], // Match other category pages
    marginBottom: DesignTokens.spacing[8],
    gap: DesignTokens.spacing[2],
    // Add padding only to the header
    paddingHorizontal: DesignTokens.spacing[5],
  },
  resultsContainer: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: DesignTokens.spacing[20],
    paddingHorizontal: DesignTokens.spacing[5],
    gap: DesignTokens.spacing[4],
  },
  placeholderText: {
    fontSize: DesignTokens.typography.fontSize["2xl"],
    textAlign: "center",
    opacity: 0.8,
  },
  descriptionText: {
    fontSize: DesignTokens.typography.fontSize.base,
    textAlign: "center",
    opacity: 0.6,
    maxWidth: 300,
  },
  placeholderIcon: {
    marginBottom: DesignTokens.spacing[4],
  },
  resultsHeader: {
    marginBottom: DesignTokens.spacing[6],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  resultsSubtitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    opacity: 0.8,
  },
});

export default function SearchScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProjectSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [debouncedSearchQuery] = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  // Memoized function to create searchable text from a project
  const createSearchableText = useCallback((project: Project) => {
    return [
      project.name,
      project.briefDescription,
      project.longDescription || "",
      project.location || "",
      ...(project.tags || []),
      project.clientInfo?.name || "",
      project.clientInfo?.address || "",
    ]
      .join(" ")
      .toLowerCase();
  }, []);

  // Memoized search function with error handling
  const searchProjects = useCallback(
    (query: string) => {
      try {
        if (query.trim() === "") return [];

        const searchTerms = query
          .toLowerCase()
          .trim()
          .split(/\s+/)
          .filter((term) => term.length > 0);

        if (!Array.isArray(mockProjects)) {
          throw new Error("Project data is not available");
        }

        return mockProjects
          .filter((project) => {
            try {
              const searchableText = createSearchableText(project);
              return searchTerms.every((term) => searchableText.includes(term));
            } catch (error) {
              logWarning(`Error processing project ${project.id}`, {
                projectId: project.id,
                error: error,
              });
              return false;
            }
          })
          .map((project) => ({
            id: project.id,
            name: project.name,
            category: project.category,
            briefDescription: project.briefDescription,
            thumbnail: project.thumbnail,
            status: project.status,
          }));
      } catch (error) {
        logError("Search operation failed", { query, error: error });
        throw error;
      }
    },
    [createSearchableText]
  );

  useEffect(() => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const results = searchProjects(debouncedSearchQuery);
      setSearchResults(results);
    } catch (error) {
      logError("Search operation failed in useEffect", {
        query: debouncedSearchQuery,
        error: error,
      });
      setSearchError(error instanceof Error ? error.message : "Search failed");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedSearchQuery, searchProjects]);

  // Announce search results to screen readers
  useEffect(() => {
    if (debouncedSearchQuery.trim() !== "" && !isSearching) {
      const resultCount = searchResults.length;
      // This would typically use AccessibilityInfo.announceForAccessibility
      // but for now we'll rely on the existing accessibility labels
      console.log(
        `Search results: ${resultCount} project${
          resultCount === 1 ? "" : "s"
        } found`
      );
    }
  }, [searchResults, debouncedSearchQuery, isSearching]);

  const handleProjectPress = (project: ProjectSummary) => {
    try {
      if (!project?.id) {
        throw new Error("Invalid project data");
      }
      router.push(`/project/${project.id}`);
    } catch (error) {
      console.error("Navigation error:", error);
      // In a real app, you might show a toast or alert here
      // For now, we'll just log the error
    }
  };

  return (
    <ThemedView
      style={styles.container}
      accessibilityLabel="Search Projects Screen"
    >
      <ThemedView style={styles.header} accessibilityLabel="Search header">
        <ThemedText variant="title" accessibilityRole="header">
          Search Projects
        </ThemedText>
        <ThemedInput
          placeholder={isSearching ? "Searching..." : "Search projects"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          disabled={isSearching}
          accessibilityLabel="Search projects input"
          accessibilityHint="Type to search for projects by name, description, location, client, or tags"
        />
      </ThemedView>
      {isSearching ? (
        <ThemedView
          style={styles.placeholderContainer}
          accessibilityLabel="Searching for projects"
        >
          <MaterialIcons
            name="search"
            size={64}
            color={theme.colors.text.tertiary}
            style={styles.placeholderIcon}
            accessibilityLabel="Searching icon"
          />
          <ThemedText
            style={styles.placeholderText}
            accessibilityLabel="Searching for projects"
          >
            Searching...
          </ThemedText>
          <ThemedText
            style={styles.descriptionText}
            accessibilityLabel="Please wait while we search for your projects"
          >
            Please wait while we search for your projects
          </ThemedText>
        </ThemedView>
      ) : searchError ? (
        <ErrorState
          title="Search Error"
          message={searchError}
          icon="search-off"
          onRetry={() => {
            setSearchError(null);
            // Retry the search
            try {
              const results = searchProjects(debouncedSearchQuery);
              setSearchResults(results);
            } catch (error) {
              console.error("Retry search failed:", error);
              setSearchError(
                error instanceof Error ? error.message : "Search failed"
              );
            }
          }}
          retryText="Try again"
          testID="search-error-state"
        />
      ) : searchResults.length > 0 ? (
        <ThemedView
          style={styles.resultsContainer}
          accessibilityLabel="Search results"
        >
          <ThemedView
            style={styles.resultsHeader}
            accessibilityLabel={`${searchResults.length} projects found`}
          >
            <ThemedText
              variant="body"
              style={styles.resultsSubtitle}
              accessibilityLabel={`${searchResults.length} projects found`}
            >
              {searchResults.length} projects found
            </ThemedText>
          </ThemedView>
          <ProjectGallery
            projects={searchResults}
            onProjectPress={handleProjectPress}
          />
        </ThemedView>
      ) : (
        <ThemedView
          style={styles.placeholderContainer}
          accessibilityLabel={
            debouncedSearchQuery.trim() === ""
              ? "Search instructions"
              : "No search results"
          }
        >
          <MaterialIcons
            name="search"
            size={64}
            color={theme.colors.text.tertiary}
            style={styles.placeholderIcon}
            accessibilityLabel="Search icon"
          />
          <ThemedText
            style={styles.placeholderText}
            accessibilityLabel={
              debouncedSearchQuery.trim() === ""
                ? "Start typing to search projects"
                : "No projects found"
            }
          >
            {debouncedSearchQuery.trim() === ""
              ? "Start typing to search projects"
              : "No projects found"}
          </ThemedText>
          <ThemedText
            style={styles.descriptionText}
            accessibilityLabel={
              debouncedSearchQuery.trim() === ""
                ? "Search by project name, description, location, client, or tags to find what you're looking for."
                : `No projects match "${debouncedSearchQuery}". Try a different search term.`
            }
          >
            {debouncedSearchQuery.trim() === ""
              ? "Search by project name, description, location, client, or tags to find what you're looking for."
              : `No projects match "${debouncedSearchQuery}". Try a different search term.`}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}
