import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ChecklistModal, useChecklist } from "@/components/checklist";
import { CHECKLIST_CONFIG } from "@/constants/ChecklistConfig";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Floating Action Button component for the meeting checklist
 * Provides a floating button that opens a modal with interactive checklist items
 */
export function FloatingChecklistButton() {
  const { getThemeColor } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Use the custom hook for checklist state management
  const { checkedStates, toggleItem, resetItemsWithConfirmation } =
    useChecklist();

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
            backgroundColor: getThemeColor("interactive.primary"),
            shadowColor: getThemeColor("text.primary"),
          },
        ]}
        onPress={openModal}
        activeOpacity={CHECKLIST_CONFIG.TOUCH.FAB_ACTIVE_OPACITY}
        accessibilityRole="button"
        accessibilityLabel="Open meeting checklist"
        accessibilityHint="Opens a modal with meeting checklist items"
        accessibilityState={{ expanded: modalVisible }}
      >
        <MaterialIcons
          name="checklist"
          size={CHECKLIST_CONFIG.FAB.ICON_SIZE}
          color={getThemeColor("text.inverse")}
          accessibilityElementsHidden={true}
        />
      </TouchableOpacity>

      {/* Checklist Modal */}
      <ChecklistModal
        visible={modalVisible}
        checkedStates={checkedStates}
        onToggleItem={toggleItem}
        onReset={resetItemsWithConfirmation}
        onClose={closeModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: CHECKLIST_CONFIG.FAB.BOTTOM_OFFSET,
    right: CHECKLIST_CONFIG.FAB.RIGHT_OFFSET,
    width: CHECKLIST_CONFIG.FAB.SIZE,
    height: CHECKLIST_CONFIG.FAB.SIZE,
    borderRadius: CHECKLIST_CONFIG.FAB.BORDER_RADIUS,
    justifyContent: "center",
    alignItems: "center",
    elevation: CHECKLIST_CONFIG.FAB.ELEVATION,
    shadowOffset: CHECKLIST_CONFIG.FAB.SHADOW_OFFSET,
    shadowOpacity: CHECKLIST_CONFIG.FAB.SHADOW_OPACITY,
    shadowRadius: CHECKLIST_CONFIG.FAB.SHADOW_RADIUS,
    zIndex: CHECKLIST_CONFIG.FAB.Z_INDEX,
  },
});
