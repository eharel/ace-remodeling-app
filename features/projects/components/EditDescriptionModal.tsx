import {
  ThemedButton,
  ThemedIconButton,
  ThemedText,
} from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

interface EditDescriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (description: string) => Promise<void>;
  currentDescription: string;
  isSaving: boolean;
  error: string | null;
}

export function EditDescriptionModal({
  visible,
  onClose,
  onSave,
  currentDescription,
  isSaving,
  error,
}: EditDescriptionModalProps) {
  const { theme } = useTheme();
  const [description, setDescription] = useState<string>(currentDescription);

  // Reset the description to the latest prop value when the modal is opened
  // Avoids stale state when switching components, for example
  useEffect(() => {
    if (visible) {
      setDescription(currentDescription); // Reset to latest prop value
    }
  }, [visible, currentDescription]);

  const handleSave = async () => {
    await onSave(description);
  };

  const handleCancel = () => {
    setDescription(currentDescription);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
      accessibilityViewIsModal={true}
      accessibilityLabel="Edit description modal"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleCancel}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
        accessibilityHint="Tap outside the modal to close it"
      >
        <TouchableOpacity
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.background.card,
              borderColor: theme.colors.border.primary,
            },
          ]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          accessibilityRole="none"
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText
              style={[styles.title, { color: theme.colors.text.primary }]}
            >
              Edit Description
            </ThemedText>
            <ThemedIconButton
              icon="close"
              onPress={handleCancel}
              variant="ghost"
              size="small"
            />
          </View>

          {/* TEXTAREA - The input field */}
          <TextInput
            style={[
              styles.textarea,
              {
                backgroundColor: theme.colors.components.input.background,
                borderColor: theme.colors.components.input.border,
                color: theme.colors.text.primary,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={6}
            placeholder="Enter project description..."
            placeholderTextColor={theme.colors.components.input.placeholder}
            textAlignVertical="top"
            accessibilityLabel="Description input"
            accessibilityHint="Enter your description"
            accessibilityRole="text"
            editable={!isSaving}
          />

          {/* ERROR MESSAGE - Show if save fails */}
          {error && (
            <Text
              style={[styles.errorText, { color: theme.colors.status.error }]}
            >
              {error}
            </Text>
          )}

          {/* BUTTONS - Cancel + Save */}
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
              variant="primary"
              disabled={isSaving}
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: DesignTokens.spacing[5], // ← Changed from [4] to [5]
  },
  modalContent: {
    width: "100%",
    maxWidth: 500, // ← Changed from 600 to 500
    borderRadius: DesignTokens.borderRadius.md, // ← Changed from lg to md
    borderWidth: 1, // ← Added border
    padding: DesignTokens.spacing[6],
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: DesignTokens.spacing[4],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize["2xl"],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  textarea: {
    height: 150,
    borderWidth: 1,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    fontSize: DesignTokens.typography.fontSize.base,
    fontFamily: DesignTokens.typography.fontFamily.regular,
    marginBottom: DesignTokens.spacing[4],
  },
  errorText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    marginBottom: DesignTokens.spacing[3],
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: DesignTokens.spacing[3],
  },
  button: {
    minWidth: 100,
  },
});
