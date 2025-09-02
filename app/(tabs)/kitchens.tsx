import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function KitchensScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Kitchen Projects</ThemedText>
        <ThemedText type="subtitle">
          Create your dream kitchen with our remodeling expertise
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText style={styles.placeholderText}>
          🏠 Kitchen projects will appear here
        </ThemedText>
        <ThemedText style={styles.descriptionText}>
          This is where PMs can showcase kitchen remodeling work, including
          design concepts, material selections, and completed projects.
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
