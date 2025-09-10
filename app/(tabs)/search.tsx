import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useDebounce } from "use-debounce";

import { ProjectGallery } from "@/components/ProjectGallery";
import {
  DesignTokens,
  ThemedInput,
  ThemedText,
  ThemedView,
} from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { mockProjects } from "@/data/mockProjects";
import { ProjectSummary } from "@/types/Project";

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
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  console.log("🔍 Search page loaded");

  useEffect(() => {
    console.log("🔍 Search query:", debouncedSearchQuery);

    if (debouncedSearchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filteredProjects = mockProjects.filter((project) => {
      const query = debouncedSearchQuery.toLowerCase().trim();
      const searchTerms = query.split(/\s+/).filter((term) => term.length > 0);

      // If no search terms, return no results
      if (searchTerms.length === 0) {
        return false;
      }

      // Combine all searchable text from the project
      const searchableText = [
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

      // Check if ALL search terms are found in the combined text
      return searchTerms.every((term) => searchableText.includes(term));
    });

    setSearchResults(filteredProjects);
  }, [debouncedSearchQuery]);

  const handleProjectPress = (project: ProjectSummary) => {
    router.push(`/project/${project.id}`);
    console.log("🔍 Project pressed:", project.name);
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
          placeholder="Search projects"
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search projects input"
          accessibilityHint="Type to search for projects by name, description, location, client, or tags"
        />
      </ThemedView>
      {searchResults.length > 0 ? (
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
