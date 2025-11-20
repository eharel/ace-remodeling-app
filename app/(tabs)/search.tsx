import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useDebounce } from "use-debounce";

import { DesignTokens } from "@/core/themes";
import {
  ComponentCategory,
  Project,
  ProjectComponent,
  ProjectStatus,
  getProjectCompletionDate,
  getProjectPMNames,
  getProjectThumbnail,
} from "@/core/types";
import { ProjectGallery } from "@/features/projects";
import {
  SearchFilters,
  SearchFiltersBar,
  SearchInputWithHistory,
  useSearchFilters,
} from "@/features/search";
import {
  ErrorState,
  PageHeader,
  ThemedText,
  ThemedView,
} from "@/shared/components";
import { useProjects, useTheme } from "@/shared/contexts";
import { commonStyles, logError, useSearchHistory } from "@/shared/utils";

// Constants
const SEARCH_DEBOUNCE_MS = 500;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Remove padding from here since ProjectGallery has its own
  },
  header: {
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
    ...commonStyles.text.sectionTitle,
    textAlign: "center",
    opacity: 0.8,
  },
  descriptionText: {
    ...commonStyles.text.body,
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
    ...commonStyles.text.description,
    opacity: 0.8,
  },
});

export default function SearchScreen() {
  const { theme } = useTheme();
  const { projects, loading: projectsLoading } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");

  // SearchResult represents a matched component from a project
  type SearchResult = {
    // Project info
    projectId: string;
    projectNumber: string;
    projectName: string;

    // Component info (the matched component)
    componentId: string;
    componentCategory: string;
    componentName?: string;
    componentSummary?: string;

    // Display info
    thumbnail: string;
    status: string;
    completedAt?: string;

    // Search metadata
    matchType: "project" | "component";
    matchedField?: string;
  };

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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
    filters,
    availableProjectManagers,
    availableTags,
    getCategoryFilters,
    getStatusFilters,
    getProjectManagerFilters,
    getTagFilters,
  } = useSearchFilters(projects);

  // Create searchable text for PROJECT-LEVEL fields only
  const createProjectSearchableText = useCallback((project: Project) => {
    const pmNames = getProjectPMNames(project);
    return [
      project.number, // ✅ Correct field name
      project.name,
      project.location?.zipCode || "",
      project.location?.neighborhood || "",
      project.status,
      ...(project.tags || []),
      ...pmNames,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }, []);

  // Create searchable text for COMPONENT-LEVEL fields
  const createComponentSearchableText = useCallback(
    (component: ProjectComponent) => {
      return [
        component.category,
        component.subcategory || "",
        component.name || "",
        component.summary || "",
        component.description || "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    },
    []
  );

  // Helper to check if a component passes filter criteria
  const applyComponentFilters = useCallback(
    (
      project: Project,
      component: ProjectComponent,
      filters: SearchFilters
    ): boolean => {
      // Category filter (component-level)
      if (filters.categories.length > 0) {
        if (
          !filters.categories.includes(component.category as ComponentCategory)
        ) {
          return false;
        }
      }

      // Status filter (project-level)
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(project.status as ProjectStatus)) {
          return false;
        }
      }

      // Project Manager filter (project-level)
      if (filters.projectManagers.length > 0) {
        const projectPMs = project.projectManagers?.map((pm) => pm.name) || [];
        const hasMatchingPM = filters.projectManagers.some((filterPM) =>
          projectPMs.includes(filterPM)
        );
        if (!hasMatchingPM) {
          return false;
        }
      }

      // Tags filter (project-level)
      if (filters.tags.length > 0) {
        const projectTags = project.tags || [];
        const hasMatchingTag = filters.tags.some((filterTag) =>
          projectTags.includes(filterTag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    },
    []
  );

  // Memoized search function with error handling
  const searchProjects = useCallback(
    (query: string) => {
      try {
        if (!Array.isArray(projects)) {
          throw new Error("Project data is not available");
        }

        const searchTerms = query
          .toLowerCase()
          .trim()
          .split(/\s+/)
          .filter((term) => term.length > 0);

        const hasTextQuery = searchTerms.length > 0;

        // Results array: one result per matched component
        const results: SearchResult[] = [];

        projects.forEach((project) => {
          // Check project-level match
          let projectMatches = false;
          if (hasTextQuery) {
            const projectText = createProjectSearchableText(project);
            projectMatches = searchTerms.every((term) =>
              projectText.includes(term)
            );
          }

          // Check each component
          project.components.forEach((component) => {
            let shouldInclude = false;
            let matchType: "project" | "component" = "project";

            // If text query exists, check for matches
            if (hasTextQuery) {
              if (projectMatches) {
                // Project-level match means all components match
                shouldInclude = true;
                matchType = "project";
              } else {
                // Check component-level match
                const componentText = createComponentSearchableText(component);
                const componentMatches = searchTerms.every((term) =>
                  componentText.includes(term)
                );
                if (componentMatches) {
                  shouldInclude = true;
                  matchType = "component";
                }
              }
            } else {
              // No text query - include all (will be filtered by filters)
              shouldInclude = true;
            }

            // Apply filters (always, even with no text query)
            if (shouldInclude && hasActiveFilters) {
              // Check filters against this specific component
              shouldInclude = applyComponentFilters(
                project,
                component,
                filters
              );
            }

            if (shouldInclude) {
              // Get component thumbnail or fallback to project thumbnail
              const componentThumbnail =
                component.thumbnail ||
                component.media?.[0]?.url ||
                getProjectThumbnail(project);

              results.push({
                projectId: project.id,
                projectNumber: project.number,
                projectName: project.name,
                componentId: component.id,
                componentCategory: component.category,
                componentName: component.name,
                componentSummary: component.summary,
                thumbnail: componentThumbnail,
                status: project.status,
                completedAt: getProjectCompletionDate(project),
                matchType,
              });
            }
          });
        });

        return results;
      } catch (error) {
        logError("Search operation failed", { query, error });
        throw error;
      }
    },
    [
      projects,
      createProjectSearchableText,
      createComponentSearchableText,
      filters,
      hasActiveFilters,
      applyComponentFilters,
    ]
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

  const handleProjectPress = (result: SearchResult) => {
    try {
      if (!result?.projectId || !result?.componentId) {
        throw new Error("Invalid search result data");
      }

      // Navigate to project with component context
      router.push({
        pathname: `/project/${result.projectId}` as any,
        params: { componentId: result.componentId },
      });
    } catch {
      // Navigation error - silently fail
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
      <PageHeader title="Search Projects">
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
          projects={searchResults.map((result) => ({
            id: result.projectId,
            projectNumber: result.projectNumber,
            name: `${result.projectName}${
              result.componentName ? ` - ${result.componentName}` : ""
            }`,
            category: result.componentCategory,
            briefDescription: result.componentSummary || "",
            thumbnail: result.thumbnail,
            status: result.status,
            completedAt: result.completedAt,
          }))}
          onSelectProject={(id) => {
            // Find the result and navigate with componentId
            const result = searchResults.find((r) => r.projectId === id);
            if (result) {
              router.push({
                pathname: `/project/${result.projectId}` as any,
                params: { componentId: result.componentId },
              });
            } else {
              router.push(`/project/${id}` as any);
            }
          }}
        />
      </PageHeader>

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
            projects={searchResults.map((result) => ({
              id: `${result.projectId}::${result.componentId}`, // Unique key: project + component (using :: separator to avoid UUID dash conflicts)
              projectNumber: result.projectNumber,
              name: `${result.projectName}${
                result.componentName ? ` - ${result.componentName}` : ""
              }`,
              category: result.componentCategory,
              briefDescription: result.componentSummary || "",
              thumbnail: result.thumbnail,
              status: result.status,
              completedAt: result.completedAt,
            }))}
            onProjectPress={(summary) => {
              // Find the original result by extracting projectId and componentId from the composite key
              // Format: "projectId::componentId" (using :: to avoid conflicts with UUID dashes)
              const [projectId, componentId] = summary.id.split("::", 2);
              const result = searchResults.find(
                (r) =>
                  r.projectId === projectId && r.componentId === componentId
              );
              if (result) {
                handleProjectPress(result);
              } else {
                console.error("Could not find search result for:", {
                  compositeId: summary.id,
                  projectId,
                  componentId,
                });
              }
            }}
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
