import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function BathroomsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Bathroom Projects</ThemedText>
        <ThemedText type="subtitle">
          Transform your bathroom with our expert remodeling services
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText style={styles.placeholderText}>
          🚿 Bathroom projects will appear here
        </ThemedText>
        <ThemedText style={styles.descriptionText}>
          This is where PMs can showcase bathroom remodeling work, including
          before/after photos, project details, and client testimonials.
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
