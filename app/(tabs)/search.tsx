import { MaterialIcons } from "@expo/vector-icons";
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
          Find the perfect project for your client
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.content}>
        <MaterialIcons
          name="search"
          size={64}
          color="#cbd5e1"
          style={styles.placeholderIcon}
        />
        <ThemedText style={styles.placeholderText}>
          Search functionality will appear here
        </ThemedText>
        <ThemedText style={styles.descriptionText}>
          This is where PMs can search and filter projects by various criteria.
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
  placeholderIcon: {
    marginBottom: 16,
  },
});
