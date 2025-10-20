import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useDebounce } from "use-debounce";

import { ProjectGallery } from "@/components/ProjectGallery";
import { ErrorState } from "@/components/error-states";
import {
  SearchFiltersBar,
  SearchInputWithHistory,
  useSearchFilters,
} from "@/components/search";
import { DesignTokens, ThemedText, ThemedView } from "@/components/themed";
import { useProjects } from "@/contexts/ProjectsContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Project, ProjectSummary } from "@/types/Project";
import { logError, logWarning } from "@/utils/errorLogger";
import { useSearchHistory } from "@/utils/useSearchHistory";

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
  const { projects, loading: projectsLoading } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProjectSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [debouncedSearchQuery] = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  // Phase 8: Connect search to history (single state instance)
  const { history, addToHistory, removeFromHistory, clearHistory } =
    useSearchHistory();

  // Initialize filters hook
  const {
    updateFilter,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
    applyFilters,
    availableProjectManagers,
    availableTags,
    getCategoryFilters,
    getStatusFilters,
    getProjectManagerFilters,
    getTagFilters,
  } = useSearchFilters(projects);

  // Memoized function to create searchable text from a project
  const createSearchableText = useCallback((project: Project) => {
    const pmNames = project.pms?.map((pm) => pm.name) || [];
    return [
      project.name,
      project.briefDescription,
      project.longDescription || "",
      project.location?.zipCode || "",
      project.location?.neighborhood || "",
      ...(project.tags || []),
      project.scope || "",
      project.projectNumber || "",
      ...pmNames,
    ]
      .join(" ")
      .toLowerCase();
  }, []);

  // Memoized search function with error handling
  const searchProjects = useCallback(
    (query: string) => {
      try {
        if (!Array.isArray(projects)) {
          throw new Error("Project data is not available");
        }

        // Step 1: Apply filters first
        let filteredProjects = applyFilters(projects);

        // Step 2: If there's a text query, apply text search to filtered results
        if (query.trim() !== "") {
          const searchTerms = query
            .toLowerCase()
            .trim()
            .split(/\s+/)
            .filter((term) => term.length > 0);

          filteredProjects = filteredProjects.filter((project) => {
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
          });
        }

        // Step 3: Map to ProjectSummary format
        return filteredProjects.map((project) => ({
          id: project.id,
          projectNumber: project.projectNumber,
          name: project.name,
          category: project.category,
          briefDescription: project.briefDescription,
          thumbnail: project.thumbnail,
          status: project.status,
          completedAt: project.completionDate,
          pmNames: project.pms?.map((pm) => pm.name) || [],
        }));
      } catch (error) {
        logError("Search operation failed", { query, error: error });
        throw error;
      }
    },
    [createSearchableText, projects, applyFilters]
  );

  useEffect(() => {
    console.log("🔍 SEARCH TRIGGERED:", {
      query: debouncedSearchQuery,
      queryLength: debouncedSearchQuery.length,
      isEmpty: debouncedSearchQuery.trim() === "",
    });

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

  // Phase 8A: History is now saved only on Enter key press (handled in SearchInputWithHistory)

  // Announce search results to screen readers
  useEffect(() => {
    if (
      debouncedSearchQuery.trim() !== "" &&
      !isSearching &&
      !projectsLoading
    ) {
      // This would typically use AccessibilityInfo.announceForAccessibility
      // but for now we'll rely on the existing accessibility labels
    }
  }, [searchResults, debouncedSearchQuery, isSearching, projectsLoading]);

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

  const isLoading = isSearching || projectsLoading;

  // Determine if we should show results (either has text query or active filters)
  const shouldShowResults =
    debouncedSearchQuery.trim() !== "" || hasActiveFilters;

  return (
    <ThemedView
      style={styles.container}
      accessibilityLabel="Search Projects Screen"
    >
      <ThemedView style={styles.header} accessibilityLabel="Search header">
        <ThemedText variant="title" accessibilityRole="header">
          Search Projects
        </ThemedText>
        <SearchInputWithHistory
          placeholder={isLoading ? "Searching..." : "Search projects"}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSelectHistory={setSearchQuery}
          disabled={isLoading}
          history={history}
          onRemoveHistory={removeFromHistory}
          onClearHistory={clearHistory}
          onAddToHistory={addToHistory}
          projects={searchResults}
          onSelectProject={(id) => router.push(`/project/${id}`)}
        />
      </ThemedView>

      <SearchFiltersBar
        categoryValues={getCategoryFilters()}
        statusValues={getStatusFilters()}
        projectManagerValues={getProjectManagerFilters()}
        tagValues={getTagFilters()}
        availableProjectManagers={availableProjectManagers}
        availableTags={availableTags}
        onCategoryChange={(values) => updateFilter("categories", values)}
        onStatusChange={(values) => updateFilter("statuses", values)}
        onProjectManagerChange={(values) =>
          updateFilter("projectManagers", values)
        }
        onTagChange={(values) => updateFilter("tags", values)}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
      />

      {isLoading ? (
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
            shouldShowResults ? "No search results" : "Search instructions"
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
              shouldShowResults
                ? "No projects found"
                : "Start typing to search projects"
            }
          >
            {shouldShowResults
              ? "No projects found"
              : "Start typing to search projects"}
          </ThemedText>
          <ThemedText
            style={styles.descriptionText}
            accessibilityLabel={
              shouldShowResults
                ? "No projects match your search criteria. Try adjusting your search term or filters."
                : "Search by project name, description, location, or tags. Use filters to narrow results."
            }
          >
            {shouldShowResults
              ? "No projects match your search criteria. Try adjusting your search term or filters."
              : "Search by project name, description, location, or tags. Use filters to narrow results."}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}
