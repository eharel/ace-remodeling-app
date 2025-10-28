import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedText, ThemedView } from "@/shared/components";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <ThemedText variant="title">This screen does not exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText variant="body">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: DesignTokens.spacing[5],
  },
  link: {
    marginTop: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[4],
  },
});
