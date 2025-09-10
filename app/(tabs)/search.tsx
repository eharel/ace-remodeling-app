import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

import { ProjectGallery } from "@/components/ProjectGallery";
import {
  DesignTokens,
  ThemedInput,
  ThemedText,
  ThemedView,
} from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { mockProjects } from "@/data/mockProjects";
import { Project, ProjectSummary } from "@/types/Project";

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
    justifyContent: "center",
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
  const [searchResults, setSearchResults] = useState<Project[]>([]);

  console.log("🔍 Search page loaded");

  useEffect(() => {
    console.log("🔍 Search query:", searchQuery);
    setSearchResults(
      mockProjects.filter((project) => project.name.includes(searchQuery))
    );
  }, [searchQuery]);

  const handleProjectPress = (project: ProjectSummary) => {
    router.push(`/project/${project.id}`);
    console.log("🔍 Project pressed:", project.name);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText variant="title">Search Projects</ThemedText>
        <ThemedInput
          placeholder="Search projects"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ThemedView>
      {searchResults.length > 0 ? (
        <ThemedView style={styles.resultsContainer}>
          <ThemedView style={styles.resultsHeader}>
            <ThemedText variant="body" style={styles.resultsSubtitle}>
              {searchResults.length} projects found
            </ThemedText>
          </ThemedView>
          <ProjectGallery
            projects={searchResults}
            onProjectPress={handleProjectPress}
          />
        </ThemedView>
      ) : (
        <ThemedView style={styles.placeholderContainer}>
          <MaterialIcons
            name="search"
            size={64}
            color={theme.colors.text.tertiary}
            style={styles.placeholderIcon}
          />
          <ThemedText style={styles.placeholderText}>
            Search functionality will appear here
          </ThemedText>
          <ThemedText style={styles.descriptionText}>
            This is where PMs can search and filter projects by various
            criteria.
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}
