import React from "react";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";

import { useTheme } from "@/contexts/ThemeContext";
import { styling } from "@/utils/styling";
import { ChecklistBody } from "./ChecklistBody";
import { ChecklistHeader } from "./ChecklistHeader";

interface ChecklistModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Array of checked states for each item */
  checkedStates: boolean[];
  /** Callback when an item is toggled */
  onToggleItem: (index: number) => void;
  /** Callback when reset button is pressed */
  onReset: () => void;
  /** Callback when modal should be closed */
  onClose: () => void;
}

/**
 * Modal component for the meeting checklist
 * Contains the header and body components
 */
export function ChecklistModal({
  visible,
  checkedStates,
  onToggleItem,
  onReset,
  onClose,
}: ChecklistModalProps) {
  const { theme } = useTheme();

  const progress = {
    completed: checkedStates.filter(Boolean).length,
    total: checkedStates.length,
  };

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
            onReset={onReset}
            onClose={onClose}
          />
          <ChecklistBody
            checkedStates={checkedStates}
            onToggleItem={onToggleItem}
          />
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
    padding: styling.spacing(5), // 20px padding
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "70%",
    minHeight: 500,
    borderRadius: styling.borderRadius("md"), // 12px
    borderWidth: 1,
    overflow: "hidden",
  },
});
