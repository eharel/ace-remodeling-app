import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

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
 * Opens as an anchored dropdown below the trigger button.
 */
export const StatusPicker: React.FC<StatusPickerProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<View>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const measureAndShowDropdown = useCallback(() => {
    if (disabled) return;

    buttonRef.current?.measureInWindow((x, y, width, height) => {
      // Position dropdown below the button
      const dropdownTop = y + height + 4;
      const dropdownLeft = x;

      // Ensure dropdown doesn't go off screen
      const maxLeft = windowWidth - 200; // approximate dropdown width
      const adjustedLeft = Math.min(dropdownLeft, maxLeft);

      setDropdownPosition({
        top: dropdownTop,
        left: Math.max(8, adjustedLeft), // at least 8px from edge
      });
      setShowPicker(true);
    });
  }, [disabled, windowWidth]);

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
        // Dropdown styles (anchored)
        modalOverlay: {
          flex: 1,
          backgroundColor: "transparent",
        },
        dropdownContainer: {
          position: "absolute",
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.lg,
          paddingVertical: DesignTokens.spacing[2],
          minWidth: 180,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          ...DesignTokens.shadows.lg,
        },
        optionButton: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[4],
        },
        optionButtonSelected: {
          backgroundColor: theme.colors.interactive.primary + "15",
        },
        optionText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.text.primary,
        },
        optionTextSelected: {
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          color: theme.colors.interactive.primary,
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
      <View ref={buttonRef} style={styles.container} collapsable={false}>
        <Pressable
          style={[
            styles.pickerButton,
            disabled && styles.pickerButtonDisabled,
          ]}
          onPress={measureAndShowDropdown}
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
          <View
            style={[
              styles.dropdownContainer,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              },
            ]}
          >
            {STATUS_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.optionButton,
                  currentStatus === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => handleSelectStatus(option.value)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: DesignTokens.spacing[3],
                  }}
                >
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
                    size={18}
                    color={theme.colors.interactive.primary}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
