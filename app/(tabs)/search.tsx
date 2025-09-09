import { MaterialIcons } from "@expo/vector-icons";
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
import { Project } from "@/types/Project";
import { styling } from "@/utils/styling";
import { useEffect, useState } from "react";

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // Remove padding from here since ProjectGallery has its own
    },
    header: {
      marginTop: DesignTokens.spacing[16], // Match other category pages
      marginBottom: DesignTokens.spacing[8],
      gap: styling.spacing(2),
      // Add padding only to the header
      paddingHorizontal: styling.spacing(5),
    },
    resultsContainer: {
      flex: 1,
    },
    placeholderContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: styling.spacing(5),
      gap: styling.spacing(4),
    },
    placeholderText: {
      fontSize: styling.fontSize("2xl"),
      textAlign: "center",
      opacity: 0.8,
    },
    descriptionText: {
      fontSize: styling.fontSize("base"),
      textAlign: "center",
      opacity: 0.6,
      maxWidth: 300,
    },
    placeholderIcon: {
      marginBottom: styling.spacing(4),
    },
    resultsHeader: {
      marginBottom: styling.spacing(6),
      paddingHorizontal: styling.spacing(5),
    },
    resultsSubtitle: {
      fontSize: styling.fontSize("lg"),
      opacity: 0.8,
    },
  });

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
          <ProjectGallery projects={searchResults} />
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
