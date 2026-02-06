import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ThemedButton,
  ThemedIconButton,
  ThemedText,
} from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import { Document, DocumentCategory, DOCUMENT_CATEGORIES } from "@/shared/types";
import { DOCUMENT_CATEGORY_OPTIONS } from "@/services/documents/documentService";

interface EditDocumentModalProps {
  visible: boolean;
  document: Document | null;
  onClose: () => void;
  onSave: (updates: {
    name: string;
    category: DocumentCategory;
    description?: string;
  }) => Promise<void>;
  isSaving: boolean;
  error: string | null;
}

/**
 * EditDocumentModal - Modal for editing a document's metadata
 *
 * Features:
 * - Edit document name
 * - Change document category
 * - Edit optional description
 * - Shows original filename for reference
 */
export function EditDocumentModal({
  visible,
  document,
  onClose,
  onSave,
  isSaving,
  error,
}: EditDocumentModalProps) {
  const { theme } = useTheme();

  // Document metadata state
  const [documentName, setDocumentName] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(
    DOCUMENT_CATEGORIES.OTHER
  );
  const [description, setDescription] = useState<string>("");

  // Initialize form when document changes or modal opens
  useEffect(() => {
    if (visible && document) {
      setDocumentName(document.name || "");
      setSelectedCategory(document.category || DOCUMENT_CATEGORIES.OTHER);
      setDescription(document.description || "");
    }
  }, [visible, document]);

  const handleSave = async () => {
    if (!documentName.trim()) return;

    await onSave({
      name: documentName.trim(),
      category: selectedCategory,
      description: description.trim() || undefined,
    });
  };

  const handleCancel = () => {
    onClose();
  };

  // Check if form is valid and has changes
  const isFormValid = (): boolean => {
    return documentName.trim().length > 0;
  };

  const hasChanges = (): boolean => {
    if (!document) return false;
    return (
      documentName.trim() !== (document.name || "") ||
      selectedCategory !== (document.category || DOCUMENT_CATEGORIES.OTHER) ||
      description.trim() !== (document.description || "")
    );
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
    filenameContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: DesignTokens.spacing[2],
      padding: DesignTokens.spacing[3],
      borderRadius: DesignTokens.borderRadius.md,
      backgroundColor: theme.colors.background.secondary,
    },
    filenameText: {
      flex: 1,
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.text.secondary,
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

  if (!document) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
      accessibilityViewIsModal={true}
      accessibilityLabel="Edit document modal"
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
            <ThemedText style={styles.title}>Edit Document</ThemedText>
            <ThemedIconButton
              icon="close"
              onPress={handleCancel}
              variant="ghost"
              size="small"
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Original Filename (read-only) */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Original File</ThemedText>
              <View style={styles.filenameContainer}>
                <ThemedText style={styles.filenameText} numberOfLines={1}>
                  {document.filename}
                </ThemedText>
              </View>
            </View>

            {/* Document Name */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Display Name *</ThemedText>
              <TextInput
                style={styles.textInput}
                value={documentName}
                onChangeText={setDocumentName}
                placeholder="e.g., Master Bathroom Floor Plan"
                placeholderTextColor={theme.colors.text.tertiary}
                editable={!isSaving}
                autoFocus
              />
              <ThemedText style={styles.hint}>
                A descriptive name for this document
              </ThemedText>
            </View>

            {/* Document Category Selection */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Category</ThemedText>
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
                    disabled={isSaving}
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
                editable={!isSaving}
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
              disabled={isSaving}
              style={styles.button}
            >
              Cancel
            </ThemedButton>
            <ThemedButton
              onPress={handleSave}
              variant="success"
              disabled={isSaving || !isFormValid() || !hasChanges()}
              loading={isSaving}
              style={styles.button}
            >
              Save
            </ThemedButton>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
