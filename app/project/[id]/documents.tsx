import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { mockProjects } from "@/data/mockProjects";
import { DesignTokens } from "@/themes";
import { Document } from "@/types/Document";

const { width: screenWidth } = Dimensions.get("window");

interface DocumentsPageProps {}

/**
 * DocumentsPage - Professional document browser for project files
 *
 * This page provides a file-like system interface for viewing and managing
 * project documents. It displays documents in a grid layout with proper
 * file type icons and metadata.
 */
export default function DocumentsPage({}: DocumentsPageProps) {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Find the project by ID
  const project = mockProjects.find((p) => p.id === id);
  const documents = project?.documents || [];

  // Calculate grid layout
  const numColumns = 2;
  const itemWidth =
    (screenWidth - DesignTokens.spacing[6] * 2 - DesignTokens.spacing[4]) /
    numColumns;

  const getDocumentIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case "contract":
        return "description";
      case "invoice":
        return "receipt";
      case "permit":
        return "verified-user";
      case "specification":
        return "engineering";
      case "warranty":
        return "security";
      case "manual":
        return "book";
      case "photo":
        return "photo";
      case "plan":
        return "architecture";
      default:
        return "insert-drive-file";
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
      case "contract":
        return theme.colors.interactive.primary;
      case "invoice":
        return "#10B981"; // Green
      case "permit":
        return "#F59E0B"; // Amber
      case "specification":
        return "#8B5CF6"; // Purple
      case "warranty":
        return "#06B6D4"; // Cyan
      case "manual":
        return "#EF4444"; // Red
      default:
        return theme.colors.text.secondary;
    }
  };

  const handleDocumentPress = (document: Document) => {
    console.log("Open document:", document.name);
    // TODO: Implement document opening functionality
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      padding: DesignTokens.spacing[6],
    },
    documentsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    documentCard: {
      width: itemWidth,
      backgroundColor: theme.colors.background.card,
      borderRadius: DesignTokens.borderRadius.lg,
      padding: DesignTokens.spacing[4],
      marginBottom: DesignTokens.spacing[4],
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      ...DesignTokens.shadows.sm,
    },
    documentCardPressed: {
      transform: [{ scale: 0.95 }],
      ...DesignTokens.shadows.md,
    },
    documentIcon: {
      width: 48,
      height: 48,
      borderRadius: DesignTokens.borderRadius.md,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: DesignTokens.spacing[3],
    },
    documentName: {
      fontSize: DesignTokens.typography.fontSize.base,
      fontWeight: "600",
      color: theme.colors.text.primary,
      marginBottom: DesignTokens.spacing[2],
      lineHeight: 20,
    },
    documentType: {
      fontSize: DesignTokens.typography.fontSize.xs,
      fontWeight: "500",
      color: theme.colors.text.secondary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: DesignTokens.spacing[2],
    },
    documentDescription: {
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      lineHeight: 18,
      marginBottom: DesignTokens.spacing[3],
    },
    documentMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    documentDate: {
      fontSize: DesignTokens.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
    },
    documentSize: {
      fontSize: DesignTokens.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
      fontWeight: "500",
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: DesignTokens.spacing[12],
    },
    emptyStateIcon: {
      marginBottom: DesignTokens.spacing[4],
    },
    emptyStateText: {
      fontSize: DesignTokens.typography.fontSize.lg,
      color: theme.colors.text.secondary,
      textAlign: "center",
      marginBottom: DesignTokens.spacing[2],
    },
    emptyStateSubtext: {
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.text.tertiary,
      textAlign: "center",
    },
  });

  if (!project) {
    return (
      <View style={styles.container}>
        <ThemedText>Project not found</ThemedText>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Documents",
          headerBackTitle: project?.name || "Back",
          presentation: "card",
        }}
      />
      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {documents.length > 0 ? (
            <View style={styles.documentsGrid}>
              {documents.map((document) => (
                <Pressable
                  key={document.id}
                  style={({ pressed }) => [
                    styles.documentCard,
                    pressed && styles.documentCardPressed,
                  ]}
                  onPress={() => handleDocumentPress(document)}
                  accessible={true}
                  accessibilityLabel={`Open ${document.name}, ${document.type} document`}
                  accessibilityHint={`Double tap to open ${document.name}`}
                  accessibilityRole="button"
                >
                  <View style={styles.documentIcon}>
                    <MaterialIcons
                      name={getDocumentIcon(document.type) as any}
                      size={24}
                      color={getDocumentTypeColor(document.type)}
                    />
                  </View>
                  <ThemedText style={styles.documentName} numberOfLines={2}>
                    {document.name}
                  </ThemedText>
                  <ThemedText style={styles.documentType}>
                    {document.type}
                  </ThemedText>
                  {document.description && (
                    <ThemedText
                      style={styles.documentDescription}
                      numberOfLines={3}
                    >
                      {document.description}
                    </ThemedText>
                  )}
                  <View style={styles.documentMeta}>
                    <ThemedText style={styles.documentDate}>
                      {document.uploadedAt.toLocaleDateString()}
                    </ThemedText>
                    <ThemedText style={styles.documentSize}>
                      {document.fileType}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="folder-open"
                size={64}
                color={theme.colors.text.tertiary}
                style={styles.emptyStateIcon}
              />
              <ThemedText style={styles.emptyStateText}>
                No documents available
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                Documents will appear here when they are uploaded
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
