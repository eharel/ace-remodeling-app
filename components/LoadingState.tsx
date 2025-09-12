import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet, ViewStyle } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
  style?: ViewStyle;
  testID?: string;
}

export function LoadingState({
  message = "Loading...",
  size = "large",
  style,
  testID = "loading-state",
}: LoadingStateProps) {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: DesignTokens.spacing[8],
          gap: DesignTokens.spacing[4],
        },
        message: {
          fontSize: DesignTokens.typography.fontSize.base,
          textAlign: "center",
          opacity: 0.7,
          marginTop: DesignTokens.spacing[2],
        },
      }),
    []
  );

  return (
    <ThemedView
      style={[styles.container, style]}
      testID={testID}
      accessibilityLabel={message}
    >
      <ActivityIndicator
        size={size}
        color={theme.colors.interactive.primary}
        accessibilityLabel="Loading indicator"
      />

      <ThemedText style={styles.message}>{message}</ThemedText>
    </ThemedView>
  );
}
