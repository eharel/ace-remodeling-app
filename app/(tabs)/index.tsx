import { Image } from "expo-image";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* Header Section */}
      <ThemedView style={styles.header}>
        <Image
          source={require("@/assets/images/ace-logo-full-black.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText type="title" style={styles.companyName}>
          ACE Remodeling
        </ThemedText>
        <ThemedText type="subtitle" style={styles.tagline}>
          Transforming Austin Homes
        </ThemedText>
      </ThemedView>

      {/* Welcome Message */}
      <ThemedView style={styles.welcomeSection}>
        <ThemedText type="defaultSemiBold" style={styles.welcomeText}>
          Ready to showcase our work!
        </ThemedText>
        <ThemedText style={styles.instructionText}>
          Select a category below to view our featured projects
        </ThemedText>
      </ThemedView>

      {/* Category Navigation */}
      <ThemedView style={styles.categoriesSection}>
        <ThemedText type="subtitle" style={styles.categoriesTitle}>
          Our Services
        </ThemedText>

        <ThemedView style={styles.categoryButtons}>
          <ThemedView style={styles.categoryButton}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.categoryButtonText}
            >
              🏠 Kitchen
            </ThemedText>
            <ThemedText style={styles.categoryDescription}>
              Kitchen remodeling and renovations
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.categoryButton}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.categoryButtonText}
            >
              🚿 Bathroom
            </ThemedText>
            <ThemedText style={styles.categoryDescription}>
              Bathroom transformations
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Footer */}
      <ThemedView style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Professional remodeling services in Austin, TX
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
    alignItems: "center",
    marginTop: 60,
    marginBottom: 40,
    gap: 12,
  },
  logo: {
    width: 250,
    height: 100,
    marginBottom: 16,
  },
  companyName: {
    fontSize: 32,
    textAlign: "center",
    fontWeight: "bold",
  },
  tagline: {
    fontSize: 20,
    textAlign: "center",
    opacity: 0.8,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 40,
    gap: 8,
  },
  welcomeText: {
    fontSize: 22,
    textAlign: "center",
  },
  instructionText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  categoriesSection: {
    flex: 1,
    gap: 20,
  },
  categoriesTitle: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  categoryButtons: {
    gap: 16,
  },
  categoryButton: {
    backgroundColor: "#f0f0f0",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryButtonText: {
    fontSize: 20,
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
  },
});
