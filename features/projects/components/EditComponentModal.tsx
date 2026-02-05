import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
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
  getCategoryLabel,
  getSubcategoryLabel,
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

// Common subcategories by category
const SUBCATEGORY_OPTIONS: Record<string, { value: string; label: string }[]> = {
  "adu-addition": [
    { value: "adu", label: "ADU" },
    { value: "addition", label: "Addition" },
  ],
  "outdoor-living": [
    { value: "pool", label: "Pool" },
    { value: "deck", label: "Deck" },
    { value: "patio", label: "Patio" },
    { value: "pergola", label: "Pergola" },
    { value: "outdoor-kitchen", label: "Outdoor Kitchen" },
  ],
  bathroom: [
    { value: "primary-bath", label: "Primary Bath" },
    { value: "guest-bath", label: "Guest Bath" },
    { value: "powder-room", label: "Powder Room" },
  ],
};

/**
 * EditComponentModal - Modal for editing a component's name and subcategory
 *
 * Also allows deleting the component (if not the last one).
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
  const [subcategory, setSubcategory] = useState<string | undefined>(undefined);

  // Reset form when modal opens or component changes
  useEffect(() => {
    if (visible && component) {
      setName(component.name || "");
      setSubcategory(component.subcategory);
    }
  }, [visible, component]);

  const handleSave = async () => {
    await onSave({
      name: name.trim() || undefined,
      subcategory: subcategory || undefined,
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

  const availableSubcategories = SUBCATEGORY_OPTIONS[component.category] || [];
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

          {/* Name Input */}
          <View style={styles.section}>
            <ThemedText style={styles.label}>Name</ThemedText>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Master Bathroom, Pool House"
              placeholderTextColor={theme.colors.text.tertiary}
              editable={!isSaving}
            />
            <ThemedText style={styles.hint}>
              A custom name helps distinguish similar components
            </ThemedText>
          </View>

          {/* Subcategory Selection (if available) */}
          {availableSubcategories.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.label}>Subcategory</ThemedText>
              <View style={styles.optionsGrid}>
                {availableSubcategories.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      subcategory === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() =>
                      setSubcategory(
                        subcategory === option.value ? undefined : option.value
                      )
                    }
                    disabled={isSaving}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        subcategory === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

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
