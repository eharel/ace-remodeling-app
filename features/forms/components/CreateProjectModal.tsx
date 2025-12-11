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
import { Project, ProjectStatus } from "@/core/types";
import { PROJECT_STATUSES } from "@/core/types/Status";
import { ThemedButton, ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { useCreateProject } from "@/shared/hooks";

/**
 * Props for CreateProjectModal component
 */
export interface CreateProjectModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Callback when project is created */
  onCreated?: (project: Project) => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * CreateProjectModal - Modal for creating a new project
 *
 * Form for creating a new project with required fields (number, name, summary,
 * description, scope, thumbnail) and optional fields (location, status, etc.).
 *
 * @component
 */
export function CreateProjectModal({
  visible,
  onClose,
  onCreated,
  testID = "create-project-modal",
}: CreateProjectModalProps) {
  const { theme } = useTheme();
  const { createProject, isCreating, error, clearError } = useCreateProject();

  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [status, setStatus] = useState<ProjectStatus>(
    PROJECT_STATUSES.PLANNING
  );
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

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
        required: {
          color: theme.colors.status.error,
        },
        input: {
          borderWidth: 1,
          borderRadius: DesignTokens.borderRadius.md,
          paddingHorizontal: DesignTokens.spacing[3],
          paddingVertical: DesignTokens.spacing[2],
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.primary,
          color: theme.colors.text.primary,
          fontSize: DesignTokens.typography.fontSize.base,
        },
        inputMultiline: {
          minHeight: 80,
          textAlignVertical: "top",
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

  const handleSubmit = useCallback(async () => {
    // Validation
    if (!number.trim()) {
      Alert.alert("Validation Error", "Project number is required");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Validation Error", "Project name is required");
      return;
    }
    if (!summary.trim()) {
      Alert.alert("Validation Error", "Project summary is required");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Validation Error", "Project description is required");
      return;
    }
    if (!scope.trim()) {
      Alert.alert("Validation Error", "Project scope is required");
      return;
    }
    if (!thumbnail.trim()) {
      Alert.alert("Validation Error", "Project thumbnail URL is required");
      return;
    }

    try {
      const newProject = await createProject({
        number: number.trim(),
        name: name.trim(),
        summary: summary.trim(),
        description: description.trim(),
        scope: scope.trim(),
        thumbnail: thumbnail.trim(),
        status,
        location: {
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          neighborhood: neighborhood.trim() || undefined,
        },
      });

      // Reset form
      setNumber("");
      setName("");
      setSummary("");
      setDescription("");
      setScope("");
      setThumbnail("");
      setStatus(PROJECT_STATUSES.PLANNING);
      setCity("");
      setState("");
      setNeighborhood("");
      clearError();

      // Close modal
      onClose();

      // Call onCreated callback
      if (onCreated) {
        onCreated(newProject);
      } else {
        // Default: navigate to new project
        router.push(`/project/${newProject.id}` as any);
      }
    } catch (e) {
      // Error is handled by hook state
      console.error("Failed to create project:", e);
    }
  }, [
    number,
    name,
    summary,
    description,
    scope,
    thumbnail,
    status,
    city,
    state,
    neighborhood,
    createProject,
    onClose,
    onCreated,
    clearError,
  ]);

  const handleClose = useCallback(() => {
    if (!isCreating) {
      setNumber("");
      setName("");
      setSummary("");
      setDescription("");
      setScope("");
      setThumbnail("");
      setStatus(PROJECT_STATUSES.PLANNING);
      setCity("");
      setState("");
      setNeighborhood("");
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
      accessibilityLabel="Create new project"
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
            <ThemedText style={styles.headerTitle}>New Project</ThemedText>
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
            {/* Project Number */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Project Number{" "}
                <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.input}
                value={number}
                onChangeText={setNumber}
                placeholder="e.g., 187, 311B"
                placeholderTextColor={theme.colors.text.tertiary}
                accessibilityLabel="Project number"
                autoCapitalize="none"
              />
            </View>

            {/* Project Name */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Project Name <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Modern Kitchen Remodel"
                placeholderTextColor={theme.colors.text.tertiary}
                accessibilityLabel="Project name"
              />
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Summary <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={summary}
                onChangeText={setSummary}
                placeholder="Brief description for cards"
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                accessibilityLabel="Project summary"
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Description <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={description}
                onChangeText={setDescription}
                placeholder="Full description for detail view"
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                accessibilityLabel="Project description"
              />
            </View>

            {/* Scope */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Scope <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={scope}
                onChangeText={setScope}
                placeholder="Work scope and details"
                placeholderTextColor={theme.colors.text.tertiary}
                multiline
                accessibilityLabel="Project scope"
              />
            </View>

            {/* Thumbnail URL */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Thumbnail URL <ThemedText style={styles.required}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.input}
                value={thumbnail}
                onChangeText={setThumbnail}
                placeholder="https://..."
                placeholderTextColor={theme.colors.text.tertiary}
                accessibilityLabel="Project thumbnail URL"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {/* Location (Optional) */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                Location (Optional)
              </ThemedText>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor={theme.colors.text.tertiary}
                accessibilityLabel="Project city"
              />
              <TextInput
                style={styles.input}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor={theme.colors.text.tertiary}
                accessibilityLabel="Project state"
              />
              <TextInput
                style={styles.input}
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="Neighborhood"
                placeholderTextColor={theme.colors.text.tertiary}
                accessibilityLabel="Project neighborhood"
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
                disabled={
                  isCreating ||
                  !number.trim() ||
                  !name.trim() ||
                  !summary.trim() ||
                  !description.trim() ||
                  !scope.trim() ||
                  !thumbnail.trim()
                }
                style={styles.actionButton}
                accessibilityLabel="Create project"
              >
                {isCreating ? "Creating..." : "Create Project"}
              </ThemedButton>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
