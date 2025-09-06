import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "@/contexts/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: getThemeColor("background.card"),
                borderColor: getThemeColor("border.primary"),
              },
            ]}
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
              <Text
                style={[
                  styles.placeholder,
                  { color: getThemeColor("text.secondary") },
                ]}
              >
                Checklist coming soon...
              </Text>
            </View>
          </View>
        </View>
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
    maxHeight: "80%",
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
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
});
