import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DesignTokens } from "@/core/themes";
import { PdfDisplay } from "@/features/pdf";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

export default function PdfViewer() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    url: string;
    name?: string;
    id?: string;
  }>();

  const { url, name, id } = params;

  const handleBackPress = () => {
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: insets.top + DesignTokens.spacing[3],
      paddingBottom: DesignTokens.spacing[3],
      paddingHorizontal: DesignTokens.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.secondary,
    },
    backButton: {
      marginRight: DesignTokens.spacing[3],
      padding: DesignTokens.spacing[2],
    },
    headerContent: {
      flex: 1,
    },
    documentName: {
      fontSize: DesignTokens.typography.fontSize.lg,
      fontWeight: DesignTokens.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    },
    documentId: {
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginTop: DesignTokens.spacing[1],
    },
    pdfContainer: {
      flex: 1,
    },
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: DesignTokens.spacing[8],
    },
    errorIcon: {
      marginBottom: DesignTokens.spacing[4],
    },
    errorTitle: {
      fontSize: DesignTokens.typography.fontSize.xl,
      fontWeight: DesignTokens.typography.fontWeight.bold,
      textAlign: "center",
      marginBottom: DesignTokens.spacing[2],
    },
    errorMessage: {
      fontSize: DesignTokens.typography.fontSize.base,
      textAlign: "center",
      opacity: 0.7,
      lineHeight:
        DesignTokens.typography.fontSize.base *
        DesignTokens.typography.lineHeight.normal,
      marginBottom: DesignTokens.spacing[6],
    },
    backButtonError: {
      backgroundColor: theme.colors.interactive.primary,
      paddingHorizontal: DesignTokens.spacing[6],
      paddingVertical: DesignTokens.spacing[3],
      borderRadius: DesignTokens.borderRadius.md,
    },
    backButtonText: {
      color: theme.colors.text.inverse,
      fontSize: DesignTokens.typography.fontSize.base,
      fontWeight: DesignTokens.typography.fontWeight.medium,
    },
  });

  // Handle missing URL
  if (!url) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons
            name="description"
            size={64}
            color={theme.colors.status.error}
            style={styles.errorIcon}
          />
          <ThemedText style={styles.errorTitle}>No PDF URL Provided</ThemedText>
          <ThemedText style={styles.errorMessage}>
            This document cannot be displayed because no URL was provided.
          </ThemedText>
          <Pressable style={styles.backButtonError} onPress={handleBackPress}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />

      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={handleBackPress}
          android_ripple={{
            color: theme.colors.interactive.primaryHover,
          }}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </Pressable>

        <View style={styles.headerContent}>
          <ThemedText style={styles.documentName}>
            {name || "PDF Document"}
          </ThemedText>
          {id && <ThemedText style={styles.documentId}>ID: {id}</ThemedText>}
        </View>
      </View>

      {/* PDF Display */}
      <View style={styles.pdfContainer}>
        <PdfDisplay uri={url} />
      </View>
    </View>
  );
}
