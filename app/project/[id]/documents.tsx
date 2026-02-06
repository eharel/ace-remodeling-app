import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState, useMemo, useCallback } from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { DesignTokens } from "@/shared/themes";
import { Document, DocumentCategory } from "@/shared/types";
import {
  EditButton,
  LoadingState,
  PageHeader,
  SelectionActionBar,
  ThemedText,
} from "@/shared/components";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { useProjects, useTheme } from "@/shared/contexts";
import { commonStyles } from "@/shared/utils";
import { getCategoryDisplayName } from "@/shared/utils/categoryUtils";
import { uploadDocument } from "@/services/documents/documentService";
import { AddDocumentModal } from "@/features/projects/components/AddDocumentModal";

const { width: screenWidth } = Dimensions.get("window");

/**
 * Asset category tab values (kebab-case for internal use)
 */
type AssetCategoryValue =
  | "floor-plan"
  | "materials"
  | "rendering-3d"
  | "contract"
  | "permit"
  | "invoice"
  | "other";

/**
 * Map display category to tab value
 */
const categoryToTabValue = (category: DocumentCategory): AssetCategoryValue => {
  const mapping: Record<DocumentCategory, AssetCategoryValue> = {
    "Floor Plan": "floor-plan",
    Materials: "materials",
    "3D Rendering": "rendering-3d",
    Contract: "contract",
    Permit: "permit",
    Invoice: "invoice",
    Other: "other",
  };
  return mapping[category] || "other";
};

/**
 * Get display label for tab value
 */
const getTabLabel = (tabValue: AssetCategoryValue): string => {
  const labels: Record<AssetCategoryValue, string> = {
    "floor-plan": "Plans",
    materials: "Materials",
    "rendering-3d": "Renderings",
    contract: "Contracts",
    permit: "Permits",
    invoice: "Invoices",
    other: "Other",
  };
  return labels[tabValue] || tabValue;
};

interface DocumentWithContext extends Document {
  componentId: string;
  componentName: string;
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
 * - Batch selection and delete (iOS-style)
 * - Bottom action bar in edit mode
 */
export default function DocumentsPage() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { projects, isLoading, addDocument, deleteDocument } = useProjects();

  // Edit mode and selection state
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Add document modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Loading state for delete operation
  const [isDeleting, setIsDeleting] = useState(false);

  // Find the project by ID using Firebase data
  const project = projects.find((p) => p.id === id);

  // Category filter state
  const [selectedCategory, setSelectedCategory] =
    useState<AssetCategoryValue | null>(null);

  // Collect all documents from all components with their component context
  const documentsWithContext: DocumentWithContext[] = useMemo(() => {
    if (!project) return [];

    const docs: DocumentWithContext[] = [];
    project.components.forEach((component) => {
      if (component.documents) {
        component.documents.forEach((doc) => {
          docs.push({
            ...doc,
            componentId: component.id,
            componentName:
              component.name || getCategoryDisplayName(component.category),
          });
        });
      }
    });
    return docs;
  }, [project]);

  // Calculate category counts and available categories
  const { categoryCounts, availableCategories } = useMemo(() => {
    const counts: Record<AssetCategoryValue, number> = {
      "floor-plan": 0,
      materials: 0,
      "rendering-3d": 0,
      contract: 0,
      permit: 0,
      invoice: 0,
      other: 0,
    };

    documentsWithContext.forEach((doc) => {
      const tabValue = categoryToTabValue(doc.category);
      counts[tabValue]++;
    });

    // Only include categories that have documents
    const available = (
      Object.keys(counts) as AssetCategoryValue[]
    ).filter((cat) => counts[cat] > 0);

    return { categoryCounts: counts, availableCategories: available };
  }, [documentsWithContext]);

  // Filter documents by selected category
  const filteredDocuments = useMemo(() => {
    if (!selectedCategory) return documentsWithContext;
    return documentsWithContext.filter(
      (doc) => categoryToTabValue(doc.category) === selectedCategory
    );
  }, [documentsWithContext, selectedCategory]);

  // Auto-select first category when documents load
  useMemo(() => {
    if (availableCategories.length > 0 && selectedCategory === null) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [availableCategories, selectedCategory]);

  // Get first component ID for uploads (default target)
  const defaultComponentId = project?.components[0]?.id;

  // Calculate grid layout
  const numColumns = 2;
  const itemWidth =
    (screenWidth - DesignTokens.spacing[6] * 2 - DesignTokens.spacing[4]) /
    numColumns;

  // Selection handlers
  const handleToggleSelection = useCallback((docId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  }, []);

  const handleExitEditMode = useCallback(() => {
    setIsEditMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleEnterEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

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

  const handleDocumentPress = (document: DocumentWithContext) => {
    if (isEditMode) {
      // In edit mode, toggle selection
      handleToggleSelection(document.id);
      return;
    }

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
    type: DocumentCategory;
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
        category: input.type, // category is now the primary field
        description: input.description,
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

  const handleDeleteSelected = useCallback(() => {
    if (!project || selectedIds.size === 0) return;

    const count = selectedIds.size;
    const message = count === 1
      ? "Are you sure you want to delete this document?"
      : `Are you sure you want to delete ${count} documents?`;

    Alert.alert(
      "Delete Documents",
      `${message} This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              // Delete each selected document
              const docsToDelete = documentsWithContext.filter((doc) =>
                selectedIds.has(doc.id)
              );

              for (const doc of docsToDelete) {
                await deleteDocument(project.id, doc.componentId, doc.id);
              }

              // Clear selection after successful delete
              setSelectedIds(new Set());
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to delete documents"
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [project, selectedIds, documentsWithContext, deleteDocument]);

  const handleAddPress = useCallback(() => {
    setShowAddModal(true);
  }, []);

  // Action bar configuration
  const actions = useMemo(() => [
    {
      id: "add",
      icon: "note-add" as const,
      label: "Add",
      onPress: handleAddPress,
      disabled: !defaultComponentId,
    },
    {
      id: "delete",
      icon: "delete-outline" as const,
      label: "Delete",
      onPress: handleDeleteSelected,
      disabled: selectedIds.size === 0,
      variant: "danger" as const,
      isLoading: isDeleting,
    },
  ], [handleAddPress, handleDeleteSelected, selectedIds.size, isDeleting, defaultComponentId]);

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
    selectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: DesignTokens.spacing[2],
    },
    selectionCount: {
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.interactive.primary,
      fontWeight: DesignTokens.typography.fontWeight.medium,
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
    documentCardSelected: {
      borderColor: theme.colors.interactive.primary,
      borderWidth: 2,
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
    selectionIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    selectionIndicatorSelected: {
      backgroundColor: theme.colors.interactive.primary,
      borderColor: theme.colors.interactive.primary,
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
      marginBottom: DesignTokens.spacing[1],
    },
    componentName: {
      fontSize: DesignTokens.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
      marginBottom: DesignTokens.spacing[2],
    },
    tabsContainer: {
      marginBottom: DesignTokens.spacing[4],
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
          <PageHeader title="All Project Assets" showBack variant="compact" />
          <LoadingState message="Loading assets..." />
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
          <PageHeader title="All Project Assets" showBack variant="compact" />
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
          title="All Project Assets"
          showBack
          backLabel={project?.name}
          variant="compact"
          rightAction={
            <View style={styles.selectionHeader}>
              {isEditMode && selectedIds.size > 0 && (
                <ThemedText style={styles.selectionCount}>
                  {selectedIds.size} selected
                </ThemedText>
              )}
              <EditButton
                onPress={isEditMode ? handleExitEditMode : handleEnterEditMode}
                isEditing={isEditMode}
              />
            </View>
          }
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category Tabs */}
          {availableCategories.length > 0 && (
            <View style={styles.tabsContainer}>
              <SegmentedControl<AssetCategoryValue>
                variant="tabs"
                options={availableCategories}
                selected={selectedCategory || availableCategories[0]}
                onSelect={setSelectedCategory}
                showCounts={true}
                getCounts={(category) => categoryCounts[category]}
                getLabel={getTabLabel}
                ariaLabel="Filter assets by category"
              />
            </View>
          )}

          {filteredDocuments.length > 0 ? (
            <View style={styles.documentsGrid}>
              {filteredDocuments.map((document) => {
                const isSelected = selectedIds.has(document.id);
                return (
                  <Pressable
                    key={document.id}
                    style={({ pressed }) => [
                      styles.documentCard,
                      pressed && !isEditMode && styles.documentCardPressed,
                      isEditMode && styles.documentCardEditMode,
                      isSelected && styles.documentCardSelected,
                    ]}
                    onPress={() => handleDocumentPress(document)}
                    accessible={true}
                    accessibilityLabel={`${isEditMode ? (isSelected ? "Deselect" : "Select") : "Open"} ${document.name}, ${document.category} document`}
                    accessibilityRole="button"
                  >
                    <View style={styles.documentHeader}>
                      <View style={styles.documentIcon}>
                        <MaterialIcons
                          name={getDocumentIcon(document.category) as any}
                          size={24}
                          color={getDocumentTypeColor(document.category)}
                        />
                      </View>
                      {isEditMode && (
                        <View
                          style={[
                            styles.selectionIndicator,
                            isSelected && styles.selectionIndicatorSelected,
                          ]}
                        >
                          {isSelected && (
                            <MaterialIcons
                              name="check"
                              size={16}
                              color={theme.colors.text.inverse}
                            />
                          )}
                        </View>
                      )}
                    </View>
                    <ThemedText style={styles.documentName} numberOfLines={2}>
                      {document.name}
                    </ThemedText>
                    <ThemedText style={styles.documentType}>
                      {document.category}
                    </ThemedText>
                    <ThemedText style={styles.componentName}>
                      {document.componentName}
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
                );
              })}
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
                No assets yet
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                Add floor plans, contracts, permits, and other project assets
              </ThemedText>
            </View>
          )}
        </ScrollView>

        {/* Bottom Action Bar - Only visible in edit mode */}
        {isEditMode && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
            <SelectionActionBar
              actions={actions}
              selectedCount={selectedIds.size}
              showSelectionCount={false}
            />
          </Animated.View>
        )}
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
