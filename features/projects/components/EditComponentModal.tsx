import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { ProjectComponent } from "@/shared/types";
import {
  COMMON_SUBCATEGORIES,
  getCategoryLabel,
  getSubcategoryLabel,
  isCoreCategory,
} from "@/shared/types/ComponentCategory";

interface EditComponentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (updates: { name?: string; subcategory?: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
  component: ProjectComponent | null;
  isSaving: boolean;
  canDelete: boolean; // false if this is the only component
  error: string | null;
}

// Special value for custom subcategory selection
const CUSTOM_SUBCATEGORY = "__custom__";

/**
 * EditComponentModal - Modal for editing a component's name and subcategory
 *
 * Features:
 * - Edit component name (display name)
 * - Common subcategories shown as quick-select buttons
 * - "Custom" option for entering any subcategory
 * - Delete option (if not the only component)
 */
export function EditComponentModal({
  visible,
  onClose,
  onSave,
  onDelete,
  component,
  isSaving,
  canDelete,
  error,
}: EditComponentModalProps) {
  const { theme } = useTheme();
  const [name, setName] = useState<string>("");

  // Subcategory state - either a predefined value, CUSTOM_SUBCATEGORY marker, or undefined
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [customSubcategory, setCustomSubcategory] = useState<string>("");

  // Reset form when modal opens or component changes
  useEffect(() => {
    if (visible && component) {
      setName(component.name || "");

      // Determine if current subcategory is a predefined option or custom
      const availableSubs = getAvailableSubcategories(component.category);
      const isPredefined = availableSubs.some(sub => sub.value === component.subcategory);

      if (component.subcategory && !isPredefined) {
        // Current subcategory is custom
        setSelectedSubcategory(CUSTOM_SUBCATEGORY);
        setCustomSubcategory(component.subcategory);
      } else {
        setSelectedSubcategory(component.subcategory);
        setCustomSubcategory("");
      }
    }
  }, [visible, component]);

  // Get available subcategories for a category
  const getAvailableSubcategories = (category: string) => {
    if (isCoreCategory(category)) {
      return COMMON_SUBCATEGORIES[category] || [];
    }
    return [];
  };

  // Get the actual subcategory value to submit
  const getEffectiveSubcategory = (): string | undefined => {
    if (!selectedSubcategory) return undefined;
    if (selectedSubcategory === CUSTOM_SUBCATEGORY) {
      const trimmed = customSubcategory.trim();
      if (!trimmed) return undefined;
      // Convert to kebab-case for consistency
      return trimmed.toLowerCase().replace(/\s+/g, "-");
    }
    return selectedSubcategory;
  };

  const handleSave = async () => {
    await onSave({
      name: name.trim() || undefined,
      subcategory: getEffectiveSubcategory(),
    });
  };

  const handleCancel = () => {
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Component",
      `Are you sure you want to delete this ${getCategoryLabel(component?.category || "")} component? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete?.(),
        },
      ]
    );
  };

  if (!component) return null;

  const availableSubcategories = getAvailableSubcategories(component.category);
  const componentLabel = component.subcategory
    ? getSubcategoryLabel(component.subcategory)
    : getCategoryLabel(component.category);

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
    subtitle: {
      fontSize: DesignTokens.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginTop: DesignTokens.spacing[1],
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
    customInputContainer: {
      marginTop: DesignTokens.spacing[2],
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
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: DesignTokens.spacing[2],
    },
    rightButtons: {
      flexDirection: "row",
      gap: DesignTokens.spacing[3],
    },
    button: {
      minWidth: 100,
    },
    deleteButton: {
      minWidth: 80,
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
      accessibilityViewIsModal={true}
      accessibilityLabel="Edit component modal"
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
            <View>
              <ThemedText style={styles.title}>Edit Component</ThemedText>
              <ThemedText style={styles.subtitle}>
                {componentLabel}
              </ThemedText>
            </View>
            <ThemedIconButton
              icon="close"
              onPress={handleCancel}
              variant="ghost"
              size="small"
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Name</ThemedText>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Master Suite, Pool House"
                placeholderTextColor={theme.colors.text.tertiary}
                editable={!isSaving}
              />
              <ThemedText style={styles.hint}>
                Distinguishes multiple components of the same type (e.g., "Master" vs "Guest" for two bathrooms)
              </ThemedText>
            </View>

            {/* Subcategory Selection (show common options + custom) */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Subcategory (optional)</ThemedText>
              <View style={styles.optionsGrid}>
                {availableSubcategories.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      selectedSubcategory === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() =>
                      setSelectedSubcategory(
                        selectedSubcategory === option.value ? undefined : option.value
                      )
                    }
                    disabled={isSaving}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        selectedSubcategory === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
                {/* Custom subcategory option */}
                <Pressable
                  style={[
                    styles.optionButton,
                    selectedSubcategory === CUSTOM_SUBCATEGORY && styles.optionButtonSelected,
                  ]}
                  onPress={() =>
                    setSelectedSubcategory(
                      selectedSubcategory === CUSTOM_SUBCATEGORY ? undefined : CUSTOM_SUBCATEGORY
                    )
                  }
                  disabled={isSaving}
                >
                  <ThemedText
                    style={[
                      styles.optionText,
                      selectedSubcategory === CUSTOM_SUBCATEGORY && styles.optionTextSelected,
                    ]}
                  >
                    Custom...
                  </ThemedText>
                </Pressable>
              </View>
              {/* Custom subcategory input */}
              {selectedSubcategory === CUSTOM_SUBCATEGORY && (
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={customSubcategory}
                    onChangeText={setCustomSubcategory}
                    placeholder="e.g., primary-bath, guest-suite"
                    placeholderTextColor={theme.colors.text.tertiary}
                    editable={!isSaving}
                    autoFocus
                  />
                </View>
              )}
            </View>
          </ScrollView>

          {/* Error Message */}
          {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {/* Delete button on the left */}
            {canDelete && onDelete ? (
              <ThemedButton
                onPress={handleDelete}
                variant="danger"
                disabled={isSaving}
                style={styles.deleteButton}
              >
                Delete
              </ThemedButton>
            ) : (
              <View />
            )}

            {/* Cancel and Save on the right */}
            <View style={styles.rightButtons}>
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
                variant="primary"
                disabled={isSaving}
                loading={isSaving}
                style={styles.button}
              >
                Save
              </ThemedButton>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
