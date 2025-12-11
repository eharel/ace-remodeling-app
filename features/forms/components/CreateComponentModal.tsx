import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import {
  ComponentCategory,
  ComponentSubcategory,
  Project,
  ProjectComponent,
} from "@/core/types";
import { ThemedButton, ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { useCreateComponent } from "@/shared/hooks";
import { CategoryPicker } from "./CategoryPicker";

/**
 * Props for CreateComponentModal component
 */
export interface CreateComponentModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Project ID */
  projectId: string;
  /** Project data for context */
  project: Project;
  /** Callback when component is created */
  onCreated?: (component: ProjectComponent) => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * CreateComponentModal - Modal for creating a new component
 *
 * Form for adding a component to an existing project with category selection,
 * optional subcategory, and basic component information.
 *
 * @component
 */
export function CreateComponentModal({
  visible,
  onClose,
  projectId,
  project,
  onCreated,
  testID = "create-component-modal",
}: CreateComponentModalProps) {
  const { theme } = useTheme();
  const { createComponent, isCreating, error, clearError } =
    useCreateComponent();

  const [category, setCategory] = useState<ComponentCategory | null>(null);
  const [subcategory, setSubcategory] = useState<
    ComponentSubcategory | undefined
  >(undefined);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");

  // Get already-used categories for exclusion
  const usedCategories = useMemo(() => {
    return project.components.map((c) => c.category);
  }, [project.components]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        },
        container: {
          backgroundColor: theme.colors.background.card,
          borderTopLeftRadius: DesignTokens.borderRadius.lg,
          borderTopRightRadius: DesignTokens.borderRadius.lg,
          maxHeight: "90%",
          ...DesignTokens.shadows.lg,
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: DesignTokens.spacing[4],
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.primary,
        },
        headerTitle: {
          fontSize: DesignTokens.typography.fontSize.xl,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
        },
        closeButton: {
          padding: DesignTokens.spacing[1],
        },
        content: {
          padding: DesignTokens.spacing[4],
          gap: DesignTokens.spacing[4],
        },
        section: {
          gap: DesignTokens.spacing[2],
        },
        sectionTitle: {
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
          marginBottom: DesignTokens.spacing[1],
        },
        sectionSubtitle: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.text.secondary,
          marginBottom: DesignTokens.spacing[2],
        },
        subcategoryInput: {
          borderWidth: 1,
          borderRadius: DesignTokens.borderRadius.md,
          paddingHorizontal: DesignTokens.spacing[3],
          paddingVertical: DesignTokens.spacing[2],
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.primary,
          color: theme.colors.text.primary,
          fontSize: DesignTokens.typography.fontSize.base,
        },
        errorText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.status.error,
          marginTop: DesignTokens.spacing[1],
        },
        actions: {
          flexDirection: "row",
          gap: DesignTokens.spacing[3],
          marginTop: DesignTokens.spacing[4],
        },
        actionButton: {
          flex: 1,
        },
      }),
    [theme]
  );

  // Check if subcategory is applicable for selected category
  const showSubcategory = useMemo(() => {
    return (
      category === "outdoor-living" ||
      category === "adu-addition" ||
      category === "new-construction"
    );
  }, [category]);

  const handleSubmit = useCallback(async () => {
    if (!category) {
      Alert.alert("Validation Error", "Please select a category");
      return;
    }

    try {
      const newComponent = await createComponent(projectId, {
        category,
        subcategory,
        name: name.trim() || undefined,
        summary: summary.trim() || undefined,
        description: description.trim() || undefined,
      });

      // Reset form
      setCategory(null);
      setSubcategory(undefined);
      setName("");
      setSummary("");
      setDescription("");
      clearError();

      // Close modal
      onClose();

      // Call onCreated callback
      if (onCreated) {
        onCreated(newComponent);
      } else {
        // Default: navigate to new component
        router.push({
          pathname: `/project/${projectId}` as any,
          params: { componentId: newComponent.id },
        });
      }
    } catch (e) {
      // Error is handled by hook state
      console.error("Failed to create component:", e);
    }
  }, [
    category,
    subcategory,
    name,
    summary,
    description,
    projectId,
    createComponent,
    onClose,
    onCreated,
    clearError,
  ]);

  const handleClose = useCallback(() => {
    if (!isCreating) {
      setCategory(null);
      setSubcategory(undefined);
      setName("");
      setSummary("");
      setDescription("");
      clearError();
      onClose();
    }
  }, [isCreating, onClose, clearError]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      accessibilityViewIsModal={true}
      accessibilityLabel="Create new component"
    >
      <Pressable
        style={styles.overlay}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
      >
        <Pressable
          style={styles.container}
          onPress={(e) => e.stopPropagation()}
          accessibilityRole="none"
          testID={testID}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Add Component</ThemedText>
            <Pressable
              style={styles.closeButton}
              onPress={handleClose}
              disabled={isCreating}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <MaterialIcons
                name="close"
                size={24}
                color={theme.colors.text.primary}
              />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Project Context */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionSubtitle}>
                Adding to Project {project.number}
              </ThemedText>
            </View>

            {/* Category Selection */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Category{" "}
                <ThemedText style={{ color: theme.colors.status.error }}>
                  *
                </ThemedText>
              </ThemedText>
              <CategoryPicker
                value={category}
                onChange={(cat) => {
                  setCategory(cat);
                  // Clear subcategory when category changes
                  setSubcategory(undefined);
                }}
                excludeCategories={usedCategories}
                allowCustom={true}
              />
            </View>

            {/* Subcategory (if applicable) */}
            {showSubcategory && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  Subcategory (Optional)
                </ThemedText>
                <ThemedText style={styles.sectionSubtitle}>
                  e.g., "pool", "deck", "patio" for Outdoor; "adu" or "addition"
                  for ADU-Addition
                </ThemedText>
                <TextInput
                  style={styles.subcategoryInput}
                  value={subcategory || ""}
                  onChangeText={(text) =>
                    setSubcategory(text.trim() || undefined)
                  }
                  placeholder="Enter subcategory"
                  placeholderTextColor={theme.colors.text.tertiary}
                  accessibilityLabel="Component subcategory"
                />
              </View>
            )}

            {/* Component Name */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Name (Optional)
              </ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Leave empty to use category name
              </ThemedText>
              <TextInput
                style={styles.subcategoryInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Master Bathroom, Kitchen Island"
                placeholderTextColor={theme.colors.text.tertiary}
                accessibilityLabel="Component name"
              />
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Summary (Optional)
              </ThemedText>
              <TextInput
                style={[styles.subcategoryInput, { minHeight: 60 }]}
                value={summary}
                onChangeText={setSummary}
                placeholder="Brief description for cards"
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                accessibilityLabel="Component summary"
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Description (Optional)
              </ThemedText>
              <TextInput
                style={[styles.subcategoryInput, { minHeight: 100 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Full description for detail view"
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                accessibilityLabel="Component description"
              />
            </View>

            {/* Error Message */}
            {error && (
              <ThemedText style={styles.errorText}>{error.message}</ThemedText>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <ThemedButton
                variant="secondary"
                onPress={handleClose}
                disabled={isCreating}
                style={styles.actionButton}
                accessibilityLabel="Cancel"
              >
                Cancel
              </ThemedButton>
              <ThemedButton
                variant="primary"
                onPress={handleSubmit}
                loading={isCreating}
                disabled={isCreating || !category}
                style={styles.actionButton}
                accessibilityLabel="Create component"
              >
                {isCreating ? "Creating..." : "Create Component"}
              </ThemedButton>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
