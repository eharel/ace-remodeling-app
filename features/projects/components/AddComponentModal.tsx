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
import {
  CORE_CATEGORIES,
  CoreCategory,
} from "@/shared/types/ComponentCategory";

interface AddComponentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (input: {
    category: CoreCategory;
    subcategory?: string;
    name?: string;
  }) => Promise<void>;
  isAdding: boolean;
  error: string | null;
}

const CATEGORY_OPTIONS: { value: CoreCategory; label: string }[] = [
  { value: CORE_CATEGORIES.BATHROOM, label: "Bathroom" },
  { value: CORE_CATEGORIES.KITCHEN, label: "Kitchen" },
  { value: CORE_CATEGORIES.FULL_HOME, label: "Full Home" },
  { value: CORE_CATEGORIES.ADU_ADDITION, label: "ADU/Addition" },
  { value: CORE_CATEGORIES.OUTDOOR_LIVING, label: "Outdoor Living" },
  { value: CORE_CATEGORIES.NEW_CONSTRUCTION, label: "New Construction" },
  { value: CORE_CATEGORIES.COMMERCIAL, label: "Commercial" },
  { value: CORE_CATEGORIES.MISCELLANEOUS, label: "Other" },
];

// Common subcategories by category
const SUBCATEGORY_OPTIONS: Record<string, { value: string; label: string }[]> = {
  [CORE_CATEGORIES.ADU_ADDITION]: [
    { value: "adu", label: "ADU" },
    { value: "addition", label: "Addition" },
  ],
  [CORE_CATEGORIES.OUTDOOR_LIVING]: [
    { value: "pool", label: "Pool" },
    { value: "deck", label: "Deck" },
    { value: "patio", label: "Patio" },
    { value: "pergola", label: "Pergola" },
    { value: "outdoor-kitchen", label: "Outdoor Kitchen" },
  ],
  [CORE_CATEGORIES.BATHROOM]: [
    { value: "primary-bath", label: "Primary Bath" },
    { value: "guest-bath", label: "Guest Bath" },
    { value: "powder-room", label: "Powder Room" },
  ],
};

/**
 * AddComponentModal - Modal for adding a new component to a project
 *
 * Allows selecting a category, optional subcategory, and optional name.
 */
export function AddComponentModal({
  visible,
  onClose,
  onAdd,
  isAdding,
  error,
}: AddComponentModalProps) {
  const { theme } = useTheme();
  const [category, setCategory] = useState<CoreCategory>(CORE_CATEGORIES.BATHROOM);
  const [subcategory, setSubcategory] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string>("");

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setCategory(CORE_CATEGORIES.BATHROOM);
      setSubcategory(undefined);
      setName("");
    }
  }, [visible]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSubcategory(undefined);
  }, [category]);

  const handleAdd = async () => {
    await onAdd({
      category,
      subcategory: subcategory || undefined,
      name: name.trim() || undefined,
    });
  };

  const handleCancel = () => {
    onClose();
  };

  const availableSubcategories = SUBCATEGORY_OPTIONS[category] || [];

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
      accessibilityLabel="Add component modal"
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
            <ThemedText style={styles.title}>Add Component</ThemedText>
            <ThemedIconButton
              icon="close"
              onPress={handleCancel}
              variant="ghost"
              size="small"
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Selection */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Category *</ThemedText>
              <View style={styles.optionsGrid}>
                {CATEGORY_OPTIONS.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.optionButton,
                      category === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setCategory(option.value)}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        category === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
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

            {/* Name Input */}
            <View style={styles.section}>
              <ThemedText style={styles.label}>Name (optional)</ThemedText>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Master Bathroom, Pool House"
                placeholderTextColor={theme.colors.text.tertiary}
                editable={!isAdding}
              />
              <ThemedText style={styles.hint}>
                A custom name helps distinguish similar components
              </ThemedText>
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
              disabled={isAdding}
              loading={isAdding}
              style={styles.button}
            >
              Add
            </ThemedButton>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
