import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import {
  PROJECT_STATUSES,
  ProjectStatus,
  getStatusDisplayText,
} from "@/shared/types/Status";

interface StatusPickerProps {
  currentStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
  disabled?: boolean;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: PROJECT_STATUSES.COMPLETED, label: "Completed" },
  { value: PROJECT_STATUSES.IN_PROGRESS, label: "In Progress" },
  { value: PROJECT_STATUSES.PLANNING, label: "Planning" },
  { value: PROJECT_STATUSES.ON_HOLD, label: "On Hold" },
];

/**
 * StatusPicker - Dropdown picker for project status
 *
 * Only shown in edit mode. Allows changing project status.
 */
export const StatusPicker: React.FC<StatusPickerProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: "row",
          alignItems: "center",
        },
        pickerButton: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: DesignTokens.spacing[3],
          paddingVertical: DesignTokens.spacing[2],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.accent,
          backgroundColor: theme.colors.background.card,
          gap: DesignTokens.spacing[2],
        },
        pickerButtonDisabled: {
          opacity: 0.5,
        },
        statusText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          color: theme.colors.text.primary,
        },
        // Modal styles
        modalOverlay: {
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
        },
        modalContent: {
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.lg,
          padding: DesignTokens.spacing[4],
          minWidth: 250,
          maxWidth: "80%",
          ...DesignTokens.shadows.lg,
        },
        modalTitle: {
          fontSize: DesignTokens.typography.fontSize.lg,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.text.primary,
          marginBottom: DesignTokens.spacing[4],
          textAlign: "center",
        },
        optionButton: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
          borderRadius: DesignTokens.borderRadius.md,
          marginBottom: DesignTokens.spacing[2],
        },
        optionButtonSelected: {
          backgroundColor: theme.colors.interactive.primary + "20",
        },
        optionText: {
          fontSize: DesignTokens.typography.fontSize.base,
          color: theme.colors.text.primary,
        },
        optionTextSelected: {
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.interactive.primary,
        },
        cancelButton: {
          marginTop: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[3],
          alignItems: "center",
        },
        cancelText: {
          fontSize: DesignTokens.typography.fontSize.base,
          color: theme.colors.text.secondary,
        },
      }),
    [theme]
  );

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case PROJECT_STATUSES.COMPLETED:
        return theme.colors.status.success;
      case PROJECT_STATUSES.IN_PROGRESS:
        return theme.colors.status.info;
      case PROJECT_STATUSES.PLANNING:
        return theme.colors.status.warning;
      case PROJECT_STATUSES.ON_HOLD:
        return theme.colors.status.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const handleSelectStatus = (status: ProjectStatus) => {
    onStatusChange(status);
    setShowPicker(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Pressable
          style={[
            styles.pickerButton,
            disabled && styles.pickerButtonDisabled,
          ]}
          onPress={() => !disabled && setShowPicker(true)}
          disabled={disabled}
          accessibilityLabel={`Change status, current: ${getStatusDisplayText(currentStatus)}`}
          accessibilityRole="button"
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: getStatusColor(currentStatus),
            }}
          />
          <ThemedText style={styles.statusText}>
            {getStatusDisplayText(currentStatus)}
          </ThemedText>
          <MaterialIcons
            name="arrow-drop-down"
            size={20}
            color={theme.colors.text.secondary}
          />
        </Pressable>
      </View>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPicker(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedText style={styles.modalTitle}>Select Status</ThemedText>

            {STATUS_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  currentStatus === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleSelectStatus(option.value)}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: DesignTokens.spacing[3] }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: getStatusColor(option.value),
                    }}
                  />
                  <ThemedText
                    style={[
                      styles.optionText,
                      currentStatus === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                </View>
                {currentStatus === option.value && (
                  <MaterialIcons
                    name="check"
                    size={20}
                    color={theme.colors.interactive.primary}
                  />
                )}
              </Pressable>
            ))}

            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowPicker(false)}
            >
              <ThemedText style={styles.cancelText}>Cancel</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
