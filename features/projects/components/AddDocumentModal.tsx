import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

import {
  ThemedButton,
  ThemedIconButton,
  ThemedText,
} from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { DocumentCategory, DOCUMENT_CATEGORIES } from "@/shared/types";
import { DOCUMENT_CATEGORY_OPTIONS } from "@/services/documents/documentService";

interface AddDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (input: {
    fileUri: string;
    filename: string;
    name: string;
    type: DocumentCategory; // Still named 'type' in the callback interface for compatibility
    description?: string;
  }) => Promise<void>;
  isAdding: boolean;
  error: string | null;
}


/**
 * AddDocumentModal - Modal for uploading a new document to a project
 *
 * Features:
 * - File picker for selecting documents (PDFs, images, etc.)
 * - Document type selector with predefined types
 * - Custom type option via "Other" with description
 * - Name field for display name
 * - Optional description field
 */
export function AddDocumentModal({
  visible,
  onClose,
  onAdd,
  isAdding,
  error,
}: AddDocumentModalProps) {
  const { theme } = useTheme();

  // File state
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
  } | null>(null);
  const [isPickingFile, setIsPickingFile] = useState(false);

  // Document metadata state
  const [documentName, setDocumentName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(
    DOCUMENT_CATEGORIES.OTHER
  );
  const [description, setDescription] = useState<string>("");

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedFile(null);
      setDocumentName("");
      setSelectedCategory(DOCUMENT_CATEGORIES.OTHER);
      setDescription("");
    }
  }, [visible]);

  // Auto-fill name from filename when file is selected
  useEffect(() => {
    if (selectedFile && !documentName) {
      // Remove extension and clean up filename for display name
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      const cleanName = nameWithoutExt
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      setDocumentName(cleanName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only auto-fill when file changes, not on every documentName change
  }, [selectedFile]);

  const handlePickFile = async () => {
    try {
      setIsPickingFile(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/*",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
        });
      }
    } catch (err) {
      console.error("Error picking document:", err);
    } finally {
      setIsPickingFile(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedFile || !documentName.trim()) return;

    await onAdd({
      fileUri: selectedFile.uri,
      filename: selectedFile.name,
      name: documentName.trim(),
      type: selectedCategory, // Pass category as 'type' for callback compatibility
      description: description.trim() || undefined,
    });
  };

  const handleCancel = () => {
    onClose();
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    return !!selectedFile && documentName.trim().length > 0;
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: DesignTokens.spacing[5],
    },
    modalContent: {
      width: "100%",
      maxWidth: 500,
      maxHeight: "90%",
      borderRadius: DesignTokens.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.card,
      padding: DesignTokens.spacing[6],
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: DesignTokens.spacing[5],
    },
    title: {
      fontSize: DesignTokens.typography.fontSize["2xl"],
      fontWeight: DesignTokens.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    },
    section: {
      marginBottom: DesignTokens.spacing[4],
    },
    label: {
      fontSize: DesignTokens.typography.fontSize.sm,
      fontWeight: DesignTokens.typography.fontWeight.medium,
      color: theme.colors.text.secondary,
      marginBottom: DesignTokens.spacing[2],
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    filePickerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: DesignTokens.spacing[2],
      paddingVertical: DesignTokens.spacing[4],
      paddingHorizontal: DesignTokens.spacing[4],
      borderRadius: DesignTokens.borderRadius.md,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.primary,
    },
    filePickerButtonActive: {
      borderColor: theme.colors.interactive.primary,
      backgroundColor: theme.colors.interactive.primary + "10",
    },
    filePickerText: {
      fontSize: DesignTokens.typography.fontSize.base,
      color: theme.colors.text.secondary,
    },
    selectedFileContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: DesignTokens.spacing[3],
      padding: DesignTokens.spacing[3],
      borderRadius: DesignTokens.borderRadius.md,
      backgroundColor: theme.colors.background.secondary,
    },
    selectedFileName: {
      flex: 1,
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.text.primary,
    },
    changeFileButton: {
      paddingVertical: DesignTokens.spacing[1],
      paddingHorizontal: DesignTokens.spacing[2],
    },
    changeFileText: {
      fontSize: DesignTokens.typography.fontSize.xs,
      color: theme.colors.interactive.primary,
      fontWeight: DesignTokens.typography.fontWeight.medium,
    },
    optionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: DesignTokens.spacing[2],
    },
    optionButton: {
      paddingVertical: DesignTokens.spacing[2],
      paddingHorizontal: DesignTokens.spacing[3],
      borderRadius: DesignTokens.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.primary,
    },
    optionButtonSelected: {
      borderColor: theme.colors.interactive.primary,
      backgroundColor: theme.colors.interactive.primary + "15",
    },
    optionText: {
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.text.primary,
    },
    optionTextSelected: {
      color: theme.colors.interactive.primary,
      fontWeight: DesignTokens.typography.fontWeight.semibold,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: DesignTokens.borderRadius.md,
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.primary,
      padding: DesignTokens.spacing[3],
      fontSize: DesignTokens.typography.fontSize.base,
      color: theme.colors.text.primary,
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    hint: {
      fontSize: DesignTokens.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
      marginTop: DesignTokens.spacing[1],
    },
    errorText: {
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.status.error,
      marginBottom: DesignTokens.spacing[3],
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: DesignTokens.spacing[3],
      marginTop: DesignTokens.spacing[2],
    },
    button: {
      minWidth: 100,
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
      accessibilityViewIsModal={true}
      accessibilityLabel="Add document modal"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleCancel}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Add Document</ThemedText>
            <ThemedIconButton
              icon="close"
              onPress={handleCancel}
              variant="ghost"
              size="small"
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* File Picker */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>File *</ThemedText>
              {!selectedFile ? (
                <Pressable
                  style={[
                    styles.filePickerButton,
                    isPickingFile && styles.filePickerButtonActive,
                  ]}
                  onPress={handlePickFile}
                  disabled={isPickingFile || isAdding}
                >
                  {isPickingFile ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.interactive.primary}
                    />
                  ) : (
                    <>
                      <ThemedText style={styles.filePickerText}>
                        Tap to select a file
                      </ThemedText>
                    </>
                  )}
                </Pressable>
              ) : (
                <View style={styles.selectedFileContainer}>
                  <ThemedText style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFile.name}
                  </ThemedText>
                  <Pressable
                    style={styles.changeFileButton}
                    onPress={handlePickFile}
                    disabled={isAdding}
                  >
                    <ThemedText style={styles.changeFileText}>Change</ThemedText>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Document Category Selection */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Category *</ThemedText>
              <View style={styles.optionsGrid}>
                {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      selectedCategory === option.value &&
                        styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedCategory(option.value)}
                    disabled={isAdding}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        selectedCategory === option.value &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Document Name */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Name *</ThemedText>
              <TextInput
                style={styles.textInput}
                value={documentName}
                onChangeText={setDocumentName}
                placeholder="e.g., Master Bathroom Floor Plan"
                placeholderTextColor={theme.colors.text.tertiary}
                editable={!isAdding}
              />
              <ThemedText style={styles.hint}>
                A descriptive name for this document
              </ThemedText>
            </View>

            {/* Description (optional) */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Description (optional)</ThemedText>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Add notes about this document..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={3}
                editable={!isAdding}
              />
            </View>
          </ScrollView>

          {/* Error Message */}
          {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <ThemedButton
              onPress={handleCancel}
              variant="secondary"
              disabled={isAdding}
              style={styles.button}
            >
              Cancel
            </ThemedButton>
            <ThemedButton
              onPress={handleAdd}
              variant="primary"
              disabled={isAdding || !isFormValid()}
              loading={isAdding}
              style={styles.button}
            >
              Upload
            </ThemedButton>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
