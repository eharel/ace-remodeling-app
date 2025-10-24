import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";

export default function HomeScreen() {
  const { theme } = useTheme();

  const handleBrowsePortfolio = () => {
    router.push("/(tabs)/portfolio");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>ACE Remodeling</ThemedText>
        <ThemedText style={styles.subtitle}>
          Transforming Austin Homes
        </ThemedText>

        <Pressable
          style={[
            styles.button,
            { backgroundColor: theme.colors.interactive.primary },
          ]}
          onPress={handleBrowsePortfolio}
        >
          <ThemedText style={styles.buttonText}>Browse Portfolio</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: DesignTokens.spacing[8],
    paddingTop: DesignTokens.spacing[12],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize["3xl"],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: DesignTokens.typography.fontFamily.bold,
    textAlign: "center",
    marginBottom: DesignTokens.spacing[4],
    lineHeight: 40,
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontFamily: DesignTokens.typography.fontFamily.medium,
    textAlign: "center",
    marginBottom: DesignTokens.spacing[8],
    opacity: 0.7,
  },
  button: {
    paddingHorizontal: DesignTokens.spacing[8],
    paddingVertical: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    fontFamily: DesignTokens.typography.fontFamily.semibold,
  },
});
