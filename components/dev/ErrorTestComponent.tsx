import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts";
import { DesignTokens } from "@/themes";

interface Props {
  shouldThrow?: boolean;
}

export function ErrorTestComponent({ shouldThrow = false }: Props) {
  const [throwError, setThrowError] = useState(shouldThrow);
  const [showErrorUI, setShowErrorUI] = useState(false);
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          padding: DesignTokens.spacing[6],
          alignItems: "center",
        },
        title: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.bold,
          marginBottom: DesignTokens.spacing[4],
        },
        description: {
          fontSize: DesignTokens.typography.fontSize.base,
          textAlign: "center",
          marginBottom: DesignTokens.spacing[6],
          opacity: 0.7,
        },
        button: {
          backgroundColor: theme.colors.status.error,
          paddingHorizontal: DesignTokens.spacing[4],
          paddingVertical: DesignTokens.spacing[3],
          borderRadius: DesignTokens.borderRadius.md,
        },
        buttonText: {
          color: theme.colors.text.inverse,
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: DesignTokens.typography.fontWeight.medium,
        },
      }),
    [theme]
  );

  if (throwError) {
    // This will trigger the ErrorBoundary
    throw new Error("Test error: This component intentionally crashed!");
  }

  // Test the ErrorBoundary fallback UI directly
  if (showErrorUI) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>🎯 ErrorBoundary Test</ThemedText>
        <ThemedText style={styles.description}>
          This simulates what the ErrorBoundary fallback UI looks like.
        </ThemedText>
        <Pressable style={styles.button} onPress={() => setShowErrorUI(false)}>
          <ThemedText style={styles.buttonText}>Hide Test UI</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Error Test Component</ThemedText>
      <ThemedText style={styles.description}>
        This component is used to test the ErrorBoundary. Press the button below
        to trigger an error.
      </ThemedText>
      <Pressable style={styles.button} onPress={() => setThrowError(true)}>
        <ThemedText style={styles.buttonText}>Trigger Real Error</ThemedText>
      </Pressable>
      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.status.info,
            marginTop: DesignTokens.spacing[3],
          },
        ]}
        onPress={() => setShowErrorUI(true)}
      >
        <ThemedText style={styles.buttonText}>Test Error UI</ThemedText>
      </Pressable>
    </ThemedView>
  );
}
