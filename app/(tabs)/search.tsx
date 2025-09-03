import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function SearchScreen() {
  console.log("🔍 Search page loaded");

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Search Projects</ThemedText>
        <ThemedText type="subtitle">
          Find specific projects and services
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText style={styles.placeholderText}>
          🔍 Search functionality coming soon!
        </ThemedText>
        <ThemedText style={styles.descriptionText}>
          This feature will allow PMs to quickly find specific projects, filter
          by location, style, or project type.
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 30,
    gap: 8,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  placeholderText: {
    fontSize: 24,
    textAlign: "center",
    opacity: 0.8,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
    maxWidth: 300,
  },
});
