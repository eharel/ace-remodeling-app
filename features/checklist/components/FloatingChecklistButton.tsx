import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/core/themes";
import { ChecklistModal } from "./ChecklistModal";
import { useChecklist } from "../hooks/useChecklist";

/**
 * Floating Action Button component for the meeting checklist
 * Provides a floating button that opens a modal with interactive checklist items
 */
export function FloatingChecklistButton() {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Use the custom hook for checklist state management
  const { checkedStates, toggleItem, resetItems } = useChecklist();

  // Modal control functions with useCallback for performance
  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.interactive.primary,
            shadowColor: theme.colors.text.primary,
          },
        ]}
        onPress={openModal}
        activeOpacity={DesignTokens.interactions.activeOpacity}
        accessibilityRole="button"
        accessibilityLabel="Open meeting checklist"
        accessibilityHint="Opens a modal with meeting checklist items"
        accessibilityState={{ expanded: modalVisible }}
      >
        <MaterialIcons
          name="checklist"
          size={24}
          color={theme.colors.text.inverse}
          accessibilityElementsHidden={true}
        />
      </TouchableOpacity>

      {/* Checklist Modal */}
      <ChecklistModal
        visible={modalVisible}
        checkedStates={checkedStates}
        onToggleItem={toggleItem}
        onReset={resetItems}
        onClose={closeModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 100, // Position above tab bar
    right: DesignTokens.spacing[5], // 20px from left
    width: DesignTokens.components.fab.size,
    height: DesignTokens.components.fab.size,
    borderRadius: DesignTokens.components.fab.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
});
