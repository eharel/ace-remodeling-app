import React from "react";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";

import { DesignTokens } from "@/core/themes";
import { useTheme } from "@/shared/contexts";
import { useChecklistContext } from "@/features/checklist/contexts/ChecklistContext";
import { ChecklistBody } from "./ChecklistBody";
import { ChecklistHeader } from "./ChecklistHeader";

interface ChecklistModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
}

/**
 * Modal component for the meeting checklist
 * Contains the header and body components
 * Uses context for shared state management
 */
export function ChecklistModal({ visible, onClose }: ChecklistModalProps) {
  const { theme } = useTheme();
  const { getTotalProgress, resetItems } = useChecklistContext();

  const progress = getTotalProgress();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
      accessibilityLabel="Meeting checklist modal"
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
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
          <ChecklistHeader
            progress={progress}
            onReset={resetItems}
            onClose={onClose}
          />
          <ChecklistBody />
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
    padding: DesignTokens.spacing[5], // 20px padding
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "70%",
    minHeight: 500,
    borderRadius: DesignTokens.borderRadius.md, // 12px
    borderWidth: 1,
    overflow: "hidden",
  },
});
