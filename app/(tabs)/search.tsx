import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { styling } from "@/utils/styling";

export default function SearchScreen() {
  const { getThemeColor } = useTheme();

  console.log("🔍 Search page loaded");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: styling.spacing(5),
    },
    header: {
      marginTop: styling.spacing(9),
      marginBottom: styling.spacing(8),
      gap: styling.spacing(2),
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
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
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText variant="title">Search Projects</ThemedText>
        <ThemedText variant="subtitle">
          Find the perfect project for your client
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.content}>
        <MaterialIcons
          name="search"
          size={64}
          color={getThemeColor("text.tertiary")}
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
