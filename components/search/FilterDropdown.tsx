import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { DesignTokens, ThemedText, ThemedView } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";

import { FilterDropdownProps } from "./types";

/**
 * FilterDropdown Component
 * A multi-select dropdown menu for selecting filter options
 */
export function FilterDropdown<T extends string>({
  label,
  selectedValues,
  options,
  onChange,
  testID,
}: FilterDropdownProps<T>) {
  const { theme } = useTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelectedValues, setTempSelectedValues] =
    useState<T[]>(selectedValues);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // Update temp values when modal opens
  const handleOpen = () => {
    setTempSelectedValues(selectedValues);
    setIsOpen(true);
  };

  // Generate display value based on selections
  const getDisplayValue = () => {
    if (selectedValues.length === 0) {
      return "All";
    }
    if (selectedValues.length === 1) {
      const option = options.find((opt) => opt.value === selectedValues[0]);
      return option?.label || "All";
    }
    return `${selectedValues.length} selected`;
  };

  const displayValue = getDisplayValue();

  // Toggle selection in temporary state
  const toggleSelection = (optionValue: T) => {
    setTempSelectedValues((prev) => {
      if (prev.includes(optionValue)) {
        return prev.filter((v) => v !== optionValue);
      }
      return [...prev, optionValue];
    });
  };

  // Apply selections and close modal
  const handleApply = () => {
    onChange(tempSelectedValues);
    setIsOpen(false);
  };

  // Cancel and close modal
  const handleCancel = () => {
    setTempSelectedValues(selectedValues);
    setIsOpen(false);
  };

  // Handle scroll events to show/hide scroll indicators
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const contentHeight = contentSize.height;
    const scrollViewHeight = layoutMeasurement.height;

    setCanScrollUp(scrollY > 0);
    setCanScrollDown(scrollY < contentHeight - scrollViewHeight - 10); // 10px buffer
  };

  // Calculate dynamic max height based on screen size
  // Estimate: ~56px per option + 56px header + 60px footer + margin
  const estimatedContentHeight = options.length * 56 + 56 + 60 + 32;
  const maxAvailableHeight = windowHeight * 0.8; // Use up to 80% of screen
  const calculatedMaxHeight = Math.min(
    estimatedContentHeight,
    maxAvailableHeight
  );

  const styles = StyleSheet.create({
    container: {
      position: "relative",
    },
    trigger: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: DesignTokens.spacing[4],
      paddingVertical: DesignTokens.spacing[2],
      borderRadius: DesignTokens.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.card,
      gap: DesignTokens.spacing[2],
      minHeight: 40,
    },
    triggerActive: {
      borderColor: theme.colors.border.accent,
      backgroundColor: theme.colors.background.elevated,
    },
    triggerText: {
      fontSize: DesignTokens.typography.fontSize.sm,
      flex: 1,
    },
    triggerLabel: {
      fontSize: DesignTokens.typography.fontSize.xs,
      opacity: 0.7,
      marginRight: DesignTokens.spacing[1],
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: Math.min(windowWidth * 0.4, 500), // 40% of screen width, max 500px
      maxWidth: 500,
      minHeight: 400,
      maxHeight: windowHeight * 0.7,
      borderRadius: DesignTokens.borderRadius.lg,
      overflow: "hidden",
    },
    modalHeader: {
      paddingHorizontal: DesignTokens.spacing[4],
      paddingVertical: DesignTokens.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    modalHeaderText: {
      fontSize: DesignTokens.typography.fontSize.lg,
      fontWeight: "600",
    },
    optionsScrollContainer: {
      flex: 1,
      minHeight: 200,
    },
    optionsList: {
      paddingVertical: DesignTokens.spacing[2],
    },
    option: {
      paddingHorizontal: DesignTokens.spacing[4],
      paddingVertical: DesignTokens.spacing[3],
      flexDirection: "row",
      alignItems: "center",
      gap: DesignTokens.spacing[3],
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: DesignTokens.borderRadius.sm,
      borderWidth: 2,
      borderColor: theme.colors.border.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxSelected: {
      backgroundColor: theme.colors.interactive.primary,
      borderColor: theme.colors.interactive.primary,
    },
    optionText: {
      fontSize: DesignTokens.typography.fontSize.base,
      flex: 1,
    },
    optionTextSelected: {
      fontWeight: "500",
    },
    modalFooter: {
      paddingHorizontal: DesignTokens.spacing[4],
      paddingVertical: DesignTokens.spacing[3],
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.primary,
      flexDirection: "row",
      gap: DesignTokens.spacing[3],
    },
    footerButton: {
      flex: 1,
      paddingVertical: DesignTokens.spacing[3],
      borderRadius: DesignTokens.borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButton: {
      backgroundColor: theme.colors.background.elevated,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    applyButton: {
      backgroundColor: theme.colors.interactive.primary,
    },
    buttonText: {
      fontSize: DesignTokens.typography.fontSize.base,
      fontWeight: "600",
    },
    cancelButtonText: {
      color: theme.colors.text.primary,
    },
    applyButtonText: {
      color: "#FFFFFF",
    },
    scrollIndicator: {
      position: "absolute",
      left: "50%",
      transform: [{ translateX: -15 }], // Center the 30px wide circle
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
      backgroundColor: theme.colors.interactive.primary,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4, // Android shadow
    },
    scrollIndicatorTop: {
      top: 8,
    },
    scrollIndicatorBottom: {
      bottom: 8,
    },
    scrollIndicatorIcon: {
      color: "#FFFFFF",
    },
  });

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.trigger,
          selectedValues.length > 0 && styles.triggerActive,
        ]}
        onPress={handleOpen}
        accessibilityLabel={`${label} filter: ${displayValue}`}
        accessibilityHint={`Opens ${label.toLowerCase()} filter menu`}
        accessibilityRole="button"
        testID={testID}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <ThemedText style={styles.triggerLabel}>{label}:</ThemedText>
          <ThemedText style={styles.triggerText} numberOfLines={1}>
            {displayValue}
          </ThemedText>
        </View>
        <MaterialIcons
          name="arrow-drop-down"
          size={20}
          color={theme.colors.text.secondary}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
        accessibilityViewIsModal
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancel}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <ThemedView style={styles.modalContent}>
              <ThemedView style={styles.modalHeader}>
                <ThemedText style={styles.modalHeaderText}>
                  Filter by {label}
                </ThemedText>
              </ThemedView>

              <View style={{ position: "relative", flex: 1 }}>
                <ScrollView
                  style={styles.optionsScrollContainer}
                  contentContainerStyle={styles.optionsList}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  showsVerticalScrollIndicator={false}
                >
                  {options.map((option) => {
                    const isSelected = tempSelectedValues.includes(
                      option.value as T
                    );
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={styles.option}
                        onPress={() => toggleSelection(option.value as T)}
                        accessibilityLabel={option.label}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isSelected }}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected,
                          ]}
                        >
                          {isSelected && (
                            <MaterialIcons
                              name="check"
                              size={18}
                              color="#FFFFFF"
                            />
                          )}
                        </View>
                        <ThemedText
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {option.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Scroll indicators */}
                {canScrollUp && (
                  <View
                    style={[styles.scrollIndicator, styles.scrollIndicatorTop]}
                  >
                    <MaterialIcons
                      name="keyboard-arrow-up"
                      size={18}
                      style={styles.scrollIndicatorIcon}
                    />
                  </View>
                )}
                {canScrollDown && (
                  <View
                    style={[
                      styles.scrollIndicator,
                      styles.scrollIndicatorBottom,
                    ]}
                  >
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={18}
                      style={styles.scrollIndicatorIcon}
                    />
                  </View>
                )}
              </View>

              <ThemedView style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.footerButton, styles.cancelButton]}
                  onPress={handleCancel}
                  accessibilityLabel="Cancel"
                  accessibilityRole="button"
                >
                  <ThemedText
                    style={[styles.buttonText, styles.cancelButtonText]}
                  >
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.footerButton, styles.applyButton]}
                  onPress={handleApply}
                  accessibilityLabel={`Apply ${
                    tempSelectedValues.length
                  } filter${tempSelectedValues.length === 1 ? "" : "s"}`}
                  accessibilityRole="button"
                >
                  <ThemedText
                    style={[styles.buttonText, styles.applyButtonText]}
                  >
                    Apply
                    {tempSelectedValues.length > 0 &&
                      ` (${tempSelectedValues.length})`}
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
