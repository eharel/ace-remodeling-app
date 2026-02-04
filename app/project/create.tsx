import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PageHeader, ThemedButton, ThemedText, ThemedView } from "@/shared/components";
import { useProjects, useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import {
  ComponentCategory,
  CORE_CATEGORIES,
  CORE_CATEGORY_LABELS,
  getCategoryLabel,
} from "@/shared/types/ComponentCategory";

// Core categories for the picker (excluding MISCELLANEOUS since "Use custom category" serves that purpose)
const CATEGORY_OPTIONS: { value: ComponentCategory; label: string }[] = [
  { value: CORE_CATEGORIES.BATHROOM, label: CORE_CATEGORY_LABELS[CORE_CATEGORIES.BATHROOM] },
  { value: CORE_CATEGORIES.KITCHEN, label: CORE_CATEGORY_LABELS[CORE_CATEGORIES.KITCHEN] },
  { value: CORE_CATEGORIES.FULL_HOME, label: CORE_CATEGORY_LABELS[CORE_CATEGORIES.FULL_HOME] },
  { value: CORE_CATEGORIES.ADU_ADDITION, label: CORE_CATEGORY_LABELS[CORE_CATEGORIES.ADU_ADDITION] },
  { value: CORE_CATEGORIES.OUTDOOR_LIVING, label: CORE_CATEGORY_LABELS[CORE_CATEGORIES.OUTDOOR_LIVING] },
  { value: CORE_CATEGORIES.NEW_CONSTRUCTION, label: CORE_CATEGORY_LABELS[CORE_CATEGORIES.NEW_CONSTRUCTION] },
  { value: CORE_CATEGORIES.COMMERCIAL, label: CORE_CATEGORY_LABELS[CORE_CATEGORIES.COMMERCIAL] },
];

export default function CreateProjectScreen() {
  const { theme } = useTheme();
  const { createProject } = useProjects();

  // Form state
  const [projectNumber, setProjectNumber] = useState("");
  const [projectName, setProjectName] = useState("");
  const [category, setCategory] = useState<ComponentCategory | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  // Validation
  const isValid = useMemo(() => {
    const hasNumber = projectNumber.trim().length > 0;
    const hasName = projectName.trim().length > 0;
    const hasCategory = showCustomCategory
      ? customCategory.trim().length > 0
      : category !== null;
    return hasNumber && hasName && hasCategory;
  }, [projectNumber, projectName, category, customCategory, showCustomCategory]);

  // Get the final category value
  const getFinalCategory = useCallback((): ComponentCategory => {
    if (showCustomCategory && customCategory.trim()) {
      // Convert to kebab-case for storage
      return customCategory.trim().toLowerCase().replace(/\s+/g, "-");
    }
    return category!;
  }, [showCustomCategory, customCategory, category]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const newProject = await createProject({
        number: projectNumber.trim(),
        name: projectName.trim(),
        category: getFinalCategory(),
        subcategory: subcategory.trim() || undefined,
        description: description.trim() || undefined,
        neighborhood: neighborhood.trim() || undefined,
      });

      // Navigate to the new project
      router.replace({
        pathname: "/project/[id]",
        params: {
          id: newProject.id,
          componentId: newProject.components[0]?.id,
        },
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to create project"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background.primary,
        },
        scrollContent: {
          padding: DesignTokens.spacing[4],
          paddingBottom: DesignTokens.spacing[20],
        },
        section: {
          marginBottom: DesignTokens.spacing[4],
        },
        sectionTitle: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          color: theme.colors.text.secondary,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: DesignTokens.spacing[3],
        },
        sectionCard: {
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.lg,
          padding: DesignTokens.spacing[4],
          ...DesignTokens.shadows.sm,
        },
        label: {
          fontSize: DesignTokens.typography.fontSize.base,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          color: theme.colors.text.primary,
          marginBottom: DesignTokens.spacing[2],
        },
        required: {
          color: theme.colors.status.error,
        },
        input: {
          backgroundColor: theme.colors.background.primary,
          borderWidth: DesignTokens.borderWidth.thin,
          borderColor: theme.colors.border.primary,
          borderRadius: DesignTokens.borderRadius.md,
          paddingHorizontal: DesignTokens.spacing[4],
          paddingVertical: DesignTokens.spacing[3],
          fontSize: DesignTokens.typography.fontSize.base,
          fontFamily: DesignTokens.typography.fontFamily.regular,
          color: theme.colors.text.primary,
          marginBottom: DesignTokens.spacing[4],
        },
        inputLast: {
          marginBottom: 0,
        },
        textArea: {
          minHeight: 100,
          textAlignVertical: "top",
        },
        fieldDivider: {
          height: 1,
          backgroundColor: theme.colors.border.primary,
          marginVertical: DesignTokens.spacing[4],
        },
        helperText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.text.secondary,
          marginTop: DesignTokens.spacing[2],
        },
        categoryGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: DesignTokens.spacing[2],
          marginBottom: DesignTokens.spacing[3],
        },
        categoryChip: {
          paddingHorizontal: DesignTokens.spacing[3],
          paddingVertical: DesignTokens.spacing[2],
          borderRadius: DesignTokens.borderRadius.full,
          borderWidth: DesignTokens.borderWidth.thin,
          borderColor: theme.colors.border.primary,
          backgroundColor: theme.colors.background.elevated,
        },
        categoryChipSelected: {
          backgroundColor: theme.colors.interactive.primary,
          borderColor: theme.colors.interactive.primary,
        },
        categoryChipText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          color: theme.colors.text.primary,
        },
        categoryChipTextSelected: {
          color: theme.colors.text.inverse,
        },
        customCategoryToggle: {
          flexDirection: "row",
          alignItems: "center",
          gap: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[2],
        },
        customCategoryToggleText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.interactive.primary,
        },
        footer: {
          padding: DesignTokens.spacing[4],
          backgroundColor: theme.colors.background.elevated,
          borderTopWidth: DesignTokens.borderWidth.thin,
          borderTopColor: theme.colors.border.primary,
        },
      }),
    [theme]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <PageHeader
        title="New Project"
        showBack={true}
        backLabel="Cancel"
        variant="compact"
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Info Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
            <View style={styles.sectionCard}>
              <ThemedText style={styles.label}>
                Project Number <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.input}
                value={projectNumber}
                onChangeText={setProjectNumber}
                placeholder="e.g., 188"
                placeholderTextColor={theme.colors.text.tertiary}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <ThemedText style={styles.label}>
                Project Name <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={[styles.input, styles.inputLast]}
                value={projectName}
                onChangeText={setProjectName}
                placeholder="e.g., Smith Residence Kitchen Remodel"
                placeholderTextColor={theme.colors.text.tertiary}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Category Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Category</ThemedText>
            <View style={styles.sectionCard}>
              <ThemedText style={styles.label}>
                Primary Category <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>

              {!showCustomCategory && (
                <View style={styles.categoryGrid}>
                  {CATEGORY_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.categoryChip,
                        category === option.value && styles.categoryChipSelected,
                      ]}
                      onPress={() => setCategory(option.value)}
                    >
                      <ThemedText
                        style={[
                          styles.categoryChipText,
                          category === option.value && styles.categoryChipTextSelected,
                        ]}
                      >
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}

              {showCustomCategory && (
                <TextInput
                  style={styles.input}
                  value={customCategory}
                  onChangeText={setCustomCategory}
                  placeholder="e.g., Home Theater"
                  placeholderTextColor={theme.colors.text.tertiary}
                  autoCapitalize="words"
                />
              )}

              <Pressable
                style={styles.customCategoryToggle}
                onPress={() => {
                  setShowCustomCategory(!showCustomCategory);
                  if (!showCustomCategory) {
                    setCategory(null);
                  } else {
                    setCustomCategory("");
                  }
                }}
              >
                <MaterialIcons
                  name={showCustomCategory ? "list" : "add"}
                  size={18}
                  color={theme.colors.interactive.primary}
                />
                <ThemedText style={styles.customCategoryToggleText}>
                  {showCustomCategory ? "Choose from list" : "Use custom category"}
                </ThemedText>
              </Pressable>

              <View style={styles.fieldDivider} />

              <ThemedText style={styles.label}>Subcategory</ThemedText>
              <TextInput
                style={[styles.input, styles.inputLast]}
                value={subcategory}
                onChangeText={setSubcategory}
                placeholder="e.g., ADU, Pool, Deck, Primary Bath"
                placeholderTextColor={theme.colors.text.tertiary}
                autoCapitalize="words"
              />
              <ThemedText style={styles.helperText}>
                Optional. Use for more specific classification.
              </ThemedText>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Details (Optional)</ThemedText>
            <View style={styles.sectionCard}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description of the project..."
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                numberOfLines={4}
              />

              <ThemedText style={styles.label}>Neighborhood</ThemedText>
              <TextInput
                style={[styles.input, styles.inputLast]}
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="e.g., Pacific Palisades"
                placeholderTextColor={theme.colors.text.tertiary}
                autoCapitalize="words"
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer with Submit Button */}
        <View style={styles.footer}>
          <ThemedButton
            onPress={handleSubmit}
            disabled={!isValid}
            loading={isSubmitting}
            fullWidth
          >
            Create Project
          </ThemedButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
