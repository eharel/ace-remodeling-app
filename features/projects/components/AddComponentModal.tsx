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
  COMMON_SUBCATEGORIES,
  CORE_CATEGORIES,
  CORE_CATEGORY_LABELS,
  CoreCategory,
  isCoreCategory,
} from "@/shared/types/ComponentCategory";

interface AddComponentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (input: {
    category: string; // Can be CoreCategory or custom string
    subcategory?: string;
    name?: string;
  }) => Promise<void>;
  isAdding: boolean;
  error: string | null;
}

// Core categories to show as buttons (excluding MISCELLANEOUS)
const CATEGORY_OPTIONS: { value: CoreCategory; label: string }[] = [
  { value: CORE_CATEGORIES.BATHROOM, label: "Bathroom" },
  { value: CORE_CATEGORIES.KITCHEN, label: "Kitchen" },
  { value: CORE_CATEGORIES.FULL_HOME, label: "Full Home" },
  { value: CORE_CATEGORIES.ADU_ADDITION, label: "ADU/Addition" },
  { value: CORE_CATEGORIES.OUTDOOR_LIVING, label: "Outdoor Living" },
  { value: CORE_CATEGORIES.NEW_CONSTRUCTION, label: "New Construction" },
  { value: CORE_CATEGORIES.COMMERCIAL, label: "Commercial" },
];

// Special value for custom category selection
const CUSTOM_CATEGORY = "__custom__";

/**
 * AddComponentModal - Modal for adding a new component to a project
 *
 * Features:
 * - Core categories as quick-select buttons
 * - "Custom" option for entering any category
 * - Common subcategories shown for applicable categories
 * - "Custom" option for entering any subcategory
 * - Optional name field for additional distinction
 */
export function AddComponentModal({
  visible,
  onClose,
  onAdd,
  isAdding,
  error,
}: AddComponentModalProps) {
  const { theme } = useTheme();

  // Category state - either a CoreCategory or CUSTOM_CATEGORY marker
  const [selectedCategory, setSelectedCategory] = useState<string>(CORE_CATEGORIES.BATHROOM);
  const [customCategory, setCustomCategory] = useState<string>("");

  // Subcategory state - either a predefined value, CUSTOM_CATEGORY marker, or undefined
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [customSubcategory, setCustomSubcategory] = useState<string>("");

  // Optional name
  const [name, setName] = useState<string>("");

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedCategory(CORE_CATEGORIES.BATHROOM);
      setCustomCategory("");
      setSelectedSubcategory(undefined);
      setCustomSubcategory("");
      setName("");
    }
  }, [visible]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory(undefined);
    setCustomSubcategory("");
  }, [selectedCategory]);

  // Get the actual category value to submit
  const getEffectiveCategory = (): string => {
    if (selectedCategory === CUSTOM_CATEGORY) {
      // Convert to kebab-case for consistency
      return customCategory.trim().toLowerCase().replace(/\s+/g, "-");
    }
    return selectedCategory;
  };

  // Get the actual subcategory value to submit
  const getEffectiveSubcategory = (): string | undefined => {
    if (!selectedSubcategory) return undefined;
    if (selectedSubcategory === CUSTOM_CATEGORY) {
      const trimmed = customSubcategory.trim();
      if (!trimmed) return undefined;
      // Convert to kebab-case for consistency
      return trimmed.toLowerCase().replace(/\s+/g, "-");
    }
    return selectedSubcategory;
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    if (selectedCategory === CUSTOM_CATEGORY) {
      return customCategory.trim().length > 0;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!isFormValid()) return;

    await onAdd({
      category: getEffectiveCategory(),
      subcategory: getEffectiveSubcategory(),
      name: name.trim() || undefined,
    });
  };

  const handleCancel = () => {
    onClose();
  };

  // Get available subcategories for current category
  const availableSubcategories = isCoreCategory(selectedCategory)
    ? COMMON_SUBCATEGORIES[selectedCategory] || []
    : [];

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
                      selectedCategory === option.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedCategory(option.value)}
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        selectedCategory === option.value && styles.optionTextSelected,
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
                {/* Custom category option */}
                <Pressable
                  style={[
                    styles.optionButton,
                    selectedCategory === CUSTOM_CATEGORY && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedCategory(CUSTOM_CATEGORY)}
                >
                  <ThemedText
                    style={[
                      styles.optionText,
                      selectedCategory === CUSTOM_CATEGORY && styles.optionTextSelected,
                    ]}
                  >
                    Custom...
                  </ThemedText>
                </Pressable>
              </View>
              {/* Custom category input */}
              {selectedCategory === CUSTOM_CATEGORY && (
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={customCategory}
                    onChangeText={setCustomCategory}
                    placeholder="e.g., Home Theater, Wine Cellar"
                    placeholderTextColor={theme.colors.text.tertiary}
                    editable={!isAdding}
                    autoFocus
                  />
                  <ThemedText style={styles.hint}>
                    Enter a custom category name
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Subcategory Selection */}
            {(availableSubcategories.length > 0 || selectedCategory !== CUSTOM_CATEGORY) && (
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
                      selectedSubcategory === CUSTOM_CATEGORY && styles.optionButtonSelected,
                    ]}
                    onPress={() =>
                      setSelectedSubcategory(
                        selectedSubcategory === CUSTOM_CATEGORY ? undefined : CUSTOM_CATEGORY
                      )
                    }
                  >
                    <ThemedText
                      style={[
                        styles.optionText,
                        selectedSubcategory === CUSTOM_CATEGORY && styles.optionTextSelected,
                      ]}
                    >
                      Custom...
                    </ThemedText>
                  </Pressable>
                </View>
                {/* Custom subcategory input */}
                {selectedSubcategory === CUSTOM_CATEGORY && (
                  <View style={styles.customInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={customSubcategory}
                      onChangeText={setCustomSubcategory}
                      placeholder="e.g., primary-bath, guest-suite"
                      placeholderTextColor={theme.colors.text.tertiary}
                      editable={!isAdding}
                      autoFocus
                    />
                  </View>
                )}
              </View>
            )}

            {/* Name Input - only show for core categories (custom categories are already unique) */}
            {selectedCategory !== CUSTOM_CATEGORY && (
              <View style={styles.section}>
                <ThemedText style={styles.label}>Name (optional)</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Master Bath, Guest Bath"
                  placeholderTextColor={theme.colors.text.tertiary}
                  editable={!isAdding}
                />
                <ThemedText style={styles.hint}>
                  Distinguishes multiple components of the same type (e.g., "Master" vs "Guest" for two bathrooms)
                </ThemedText>
              </View>
            )}
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
              Add
            </ThemedButton>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
