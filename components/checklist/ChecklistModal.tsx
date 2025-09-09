import React from "react";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";

import { CHECKLIST_CONFIG } from "@/constants/ChecklistConfig";
import { useTheme } from "@/contexts/ThemeContext";
import { ChecklistBody } from "./ChecklistBody";
import { ChecklistHeader } from "./ChecklistHeader";

interface ChecklistModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Array of checked states for each item */
  checkedItems: boolean[];
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
  checkedItems,
  onToggleItem,
  onReset,
  onClose,
}: ChecklistModalProps) {
  const { getThemeColor } = useTheme();

  const progress = {
    completed: checkedItems.filter(Boolean).length,
    total: checkedItems.length,
  };

  return (
    <Modal
      animationType={CHECKLIST_CONFIG.MODAL.ANIMATION_TYPE}
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
              backgroundColor: getThemeColor("background.card"),
              borderColor: getThemeColor("border.primary"),
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
            checkedItems={checkedItems}
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
    backgroundColor: `rgba(0, 0, 0, ${CHECKLIST_CONFIG.MODAL.OVERLAY_OPACITY})`,
    justifyContent: "center",
    alignItems: "center",
    padding: CHECKLIST_CONFIG.HEADER.PADDING,
  },
  modalContent: {
    width: "100%",
    maxWidth: CHECKLIST_CONFIG.MODAL.MAX_WIDTH,
    maxHeight: `${CHECKLIST_CONFIG.MODAL.MAX_HEIGHT_PERCENT}%`,
    minHeight: CHECKLIST_CONFIG.MODAL.MIN_HEIGHT,
    borderRadius: CHECKLIST_CONFIG.MODAL.BORDER_RADIUS,
    borderWidth: CHECKLIST_CONFIG.MODAL.BORDER_WIDTH,
    overflow: "hidden",
  },
});
