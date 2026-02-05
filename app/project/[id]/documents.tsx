import { MaterialIcons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { DesignTokens } from "@/shared/themes";
import { Document, DocumentType } from "@/shared/types";
import {
  LoadingState,
  PageHeader,
  ThemedButton,
  ThemedText,
} from "@/shared/components";
import { useProjects, useTheme } from "@/shared/contexts";
import { commonStyles } from "@/shared/utils";
import { uploadDocument } from "@/services/documents/documentService";
import { AddDocumentModal } from "@/features/projects/components/AddDocumentModal";

const { width: screenWidth } = Dimensions.get("window");

interface DocumentWithContext extends Document {
  componentId: string;
}

/**
 * DocumentsPage - Professional document browser for project files
 *
 * This page provides a file-like system interface for viewing and managing
 * project documents. It displays documents in a grid layout with proper
 * file type icons and metadata.
 *
 * Features:
 * - View all documents from all components
 * - Upload new documents
 * - Delete documents (with confirmation)
 * - Edit mode toggle
 */
export default function DocumentsPage() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects, isLoading, addDocument, deleteDocument } = useProjects();

  // Local state
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Find the project by ID using Firebase data
  const project = projects.find((p) => p.id === id);

  // Collect all documents from all components with their component context
  const documentsWithContext: DocumentWithContext[] = useMemo(() => {
    if (!project) return [];

    const docs: DocumentWithContext[] = [];
    project.components.forEach((component) => {
      if (component.documents) {
        component.documents.forEach((doc) => {
          docs.push({ ...doc, componentId: component.id });
        });
      }
    });
    return docs;
  }, [project]);

  // Get first component ID for uploads (default target)
  const defaultComponentId = project?.components[0]?.id;

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
      case "floor plan":
        return "architecture";
      case "3d rendering":
        return "view-in-ar";
      case "materials":
        return "palette";
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
        return theme.colors.status.success;
      case "permit":
        return theme.colors.status.warning;
      case "floor plan":
        return theme.colors.status.info;
      case "3d rendering":
        return "#9333ea"; // Purple
      case "materials":
        return "#f59e0b"; // Amber
      default:
        return theme.colors.text.secondary;
    }
  };

  const handleDocumentPress = (document: Document) => {
    if (isEditMode) return; // Don't navigate in edit mode

    // Navigate to PDF viewer with document details
    router.push({
      pathname: "/pdf-viewer",
      params: {
        url: document.url,
        name: document.name,
        id: document.id,
      },
    });
  };

  const handleAddDocument = async (input: {
    fileUri: string;
    filename: string;
    name: string;
    type: DocumentType;
    description?: string;
  }) => {
    if (!project || !defaultComponentId) return;

    setIsAdding(true);
    setAddError(null);

    try {
      // Upload to Firebase Storage
      const result = await uploadDocument(input.fileUri, input.filename, {
        projectId: project.id,
        name: input.name,
        type: input.type,
        description: input.description,
        // Map document type to category for filtering
        category: input.type.toLowerCase().replace(/\s+/g, "-"),
      });

      if (!result.success || !result.document) {
        throw new Error(result.error || "Upload failed");
      }

      // Add to component in Firestore
      await addDocument(project.id, defaultComponentId, result.document);

      setShowAddModal(false);
    } catch (error) {
      setAddError(
        error instanceof Error ? error.message : "Failed to upload document"
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteDocument = (doc: DocumentWithContext) => {
    if (!project) return;

    Alert.alert(
      "Delete Document",
      `Are you sure you want to delete "${doc.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDocument(project.id, doc.componentId, doc.id);
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to delete document"
              );
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: DesignTokens.spacing[6],
      paddingBottom: DesignTokens.spacing[6],
    },
    headerActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: DesignTokens.spacing[6],
      paddingVertical: DesignTokens.spacing[3],
      gap: DesignTokens.spacing[3],
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
      borderColor: theme.colors.border.secondary,
      ...DesignTokens.shadows.sm,
    },
    documentCardPressed: {
      transform: [{ scale: 0.95 }],
      ...DesignTokens.shadows.md,
    },
    documentCardEditMode: {
      borderColor: theme.colors.border.primary,
    },
    documentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: DesignTokens.spacing[3],
    },
    documentIcon: {
      width: 48,
      height: 48,
      borderRadius: DesignTokens.borderRadius.md,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: "center",
      alignItems: "center",
    },
    deleteButton: {
      padding: DesignTokens.spacing[1],
    },
    documentName: {
      fontSize: DesignTokens.typography.fontSize.base,
      fontWeight: DesignTokens.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: DesignTokens.spacing[2],
      lineHeight:
        DesignTokens.typography.fontSize.base *
        DesignTokens.typography.lineHeight.normal,
    },
    documentType: {
      ...commonStyles.text.badge,
      fontWeight: DesignTokens.typography.fontWeight.medium,
      color: theme.colors.text.secondary,
      marginBottom: DesignTokens.spacing[2],
    },
    documentDescription: {
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      lineHeight:
        DesignTokens.typography.fontSize.sm *
        DesignTokens.typography.lineHeight.normal,
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
      fontWeight: DesignTokens.typography.fontWeight.medium,
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
      marginBottom: DesignTokens.spacing[4],
    },
  });

  // Show loading state while projects are being fetched
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <View style={styles.container}>
          <PageHeader title="Documents" showBack variant="compact" />
          <LoadingState message="Loading documents..." />
        </View>
      </>
    );
  }

  // Show error state only after loading is complete and project is still not found
  if (!project) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <View style={styles.container}>
          <PageHeader title="Documents" showBack variant="compact" />
          <View style={styles.emptyState}>
            <MaterialIcons
              name="error-outline"
              size={64}
              color={theme.colors.text.tertiary}
              style={styles.emptyStateIcon}
            />
            <ThemedText style={styles.emptyStateText}>
              Project not found
            </ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              The project you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </ThemedText>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      <View style={styles.container}>
        <PageHeader
          title="Documents"
          showBack
          backLabel={project?.name}
          variant="compact"
        />

        {/* Action Bar */}
        <View style={styles.headerActions}>
          <ThemedButton
            variant={isEditMode ? "primary" : "secondary"}
            size="small"
            icon={isEditMode ? "check" : "edit"}
            onPress={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? "Done" : "Edit"}
          </ThemedButton>
          <ThemedButton
            variant="primary"
            size="small"
            icon="add"
            onPress={() => setShowAddModal(true)}
          >
            Add Document
          </ThemedButton>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {documentsWithContext.length > 0 ? (
            <View style={styles.documentsGrid}>
              {documentsWithContext.map((document) => (
                <Pressable
                  key={document.id}
                  style={({ pressed }) => [
                    styles.documentCard,
                    pressed && !isEditMode && styles.documentCardPressed,
                    isEditMode && styles.documentCardEditMode,
                  ]}
                  onPress={() => handleDocumentPress(document)}
                  accessible={true}
                  accessibilityLabel={`${isEditMode ? "Delete" : "Open"} ${document.name}, ${document.type} document`}
                  accessibilityRole="button"
                >
                  <View style={styles.documentHeader}>
                    <View style={styles.documentIcon}>
                      <MaterialIcons
                        name={getDocumentIcon(document.type) as any}
                        size={24}
                        color={getDocumentTypeColor(document.type)}
                      />
                    </View>
                    {isEditMode && (
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => handleDeleteDocument(document)}
                        hitSlop={8}
                        accessibilityLabel={`Delete ${document.name}`}
                        accessibilityRole="button"
                      >
                        <MaterialIcons
                          name="delete"
                          size={24}
                          color={theme.colors.status.error}
                        />
                      </Pressable>
                    )}
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
                      {document.uploadedAt
                        ? new Date(document.uploadedAt).toLocaleDateString()
                        : "Unknown date"}
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
                No documents yet
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                Add floor plans, contracts, permits, and other project documents
              </ThemedText>
              <ThemedButton
                variant="primary"
                icon="add"
                onPress={() => setShowAddModal(true)}
              >
                Add Document
              </ThemedButton>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Add Document Modal */}
      <AddDocumentModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddError(null);
        }}
        onAdd={handleAddDocument}
        isAdding={isAdding}
        error={addError}
      />
    </>
  );
}
