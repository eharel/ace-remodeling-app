import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ChecklistItem } from "@/components/ChecklistItem";
import { useTheme } from "@/contexts/ThemeContext";

export function FloatingChecklistButton() {
  const { getThemeColor } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

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
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="checklist"
          size={24}
          color={getThemeColor("text.inverse")}
        />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
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
          >
            {/* Modal Header */}
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: getThemeColor("border.primary") },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: getThemeColor("text.primary") },
                ]}
              >
                Meeting Checklist
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={getThemeColor("text.secondary")}
                />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              <View style={styles.checklistContainer}>
                <ChecklistItem text="Introduce company overview" />
                <ChecklistItem text="Show similar past projects" />
                <ChecklistItem text="Discuss timeline & budget" />
                <ChecklistItem text="Review material options" />
                <ChecklistItem text="Address client concerns" />
                <ChecklistItem text="Explain next steps" />
                <ChecklistItem text="Schedule follow-up" />
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 100, // Position above the tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    height: "80%",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  modalBody: {
    padding: 20,
    flex: 1,
  },
  checklistContainer: {
    flex: 1,
  },
});
