import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import { PageHeader } from "@/components";
import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts";
import { DesignTokens } from "@/themes";

export default function HomeScreen() {
  const { theme } = useTheme();

  const handleBrowsePortfolio = () => {
    router.push("/(tabs)/portfolio");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <PageHeader
          title="ACE Remodeling"
          subtitle="Transforming Austin Homes"
        />

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
