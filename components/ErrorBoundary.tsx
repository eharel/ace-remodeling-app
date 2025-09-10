import React, { ErrorInfo, useMemo } from "react";
import {
  FallbackProps,
  ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";
import { StyleSheet } from "react-native";

import { ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { DesignTokens } from "@/themes";

// Error fallback component with theming integration
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { theme } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: DesignTokens.spacing[6],
        },
        title: {
          fontSize: DesignTokens.typography.fontSize.xl,
          fontWeight: DesignTokens.typography.fontWeight.bold,
          marginBottom: DesignTokens.spacing[4],
          textAlign: "center",
        },
        message: {
          fontSize: DesignTokens.typography.fontSize.base,
          textAlign: "center",
          marginBottom: DesignTokens.spacing[6],
          opacity: 0.7,
        },
        retryText: {
          fontSize: DesignTokens.typography.fontSize.base,
          color: theme.colors.interactive.primary,
          textDecorationLine: "underline",
        },
      }),
    [theme]
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Something went wrong</ThemedText>
      <ThemedText style={styles.message}>
        The app encountered an unexpected error. Please try again.
      </ThemedText>
      <ThemedText style={styles.retryText} onPress={resetErrorBoundary}>
        Tap to retry
      </ThemedText>
    </ThemedView>
  );
}

// Wrapper component that provides error logging
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error("🚨 ErrorBoundary caught an error:", error);
    console.error("🚨 Error Info:", errorInfo);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Optional: Add any cleanup logic here
        console.log("🔄 Error boundary reset");
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
