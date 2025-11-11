import { MaterialIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import { ThemedButton, ThemedText, ThemedView } from "@/shared/components";
import { useTheme } from "@/shared/contexts";

import { FilterDropdownProps } from "../types/types";

/**
 * Constants for FilterDropdown component layout and behavior
 *
 * These values control the visual appearance and interaction behavior
 * of the multi-select dropdown modal. All values are theme-agnostic
 * dimensions that work across different screen sizes.
 */
const FILTER_DROPDOWN_CONSTANTS = {
  /** Layout calculations */
  OPTION_HEIGHT: 56, // Estimated height per option for scroll calculations
  HEADER_HEIGHT: 56, // Modal header height (includes title and quick actions)
  FOOTER_HEIGHT: 60, // Modal footer height (includes Apply/Cancel buttons)
  CONTENT_MARGIN: 32, // Additional margin for content area

  /** Scroll behavior */
  SCROLL_BUFFER: 10, // Buffer pixels for scroll detection (prevents flickering)

  /** Scroll indicators */
  SCROLL_INDICATOR_SIZE: 30, // Width/height of floating scroll indicator buttons
  SCROLL_INDICATOR_OFFSET: -15, // Transform offset to center indicator horizontally

  /** Modal sizing */
  MODAL_WIDTH_PERCENT: 0.4, // 40% of screen width (responsive sizing)
  MODAL_MAX_WIDTH: 500, // Maximum modal width (prevents too-wide modals on tablets)
  MODAL_MIN_HEIGHT: 400, // Minimum modal height (ensures usability)
  MODAL_MAX_HEIGHT_PERCENT: 0.7, // 70% of screen height (prevents overflow)
  MODAL_MAX_AVAILABLE_PERCENT: 0.8, // 80% of screen for content calculation

  /** UI elements */
  CHECKBOX_SIZE: 24, // Checkbox width/height (touch-friendly size)
  CHECKBOX_BORDER_WIDTH: 2, // Checkbox border width (visual clarity)
  ICON_SIZE: 18, // Material icon size for checkmarks and scroll indicators
  ARROW_ICON_SIZE: 20, // Arrow dropdown icon size in trigger button

  /** Spacing */
  SCROLL_INDICATOR_TOP: 8, // Top scroll indicator position from modal edge
  SCROLL_INDICATOR_BOTTOM: 8, // Bottom scroll indicator position from modal edge
} as const;

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
  disabled = false,
}: FilterDropdownProps<T>) {
  const { theme } = useTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelectedValues, setTempSelectedValues] =
    useState<T[]>(selectedValues);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Update temp values when modal opens
  const handleOpen = () => {
    setTempSelectedValues(selectedValues);
    setIsOpen(true);
  };

  // Generate display value based on selections
  /**
   * Generates the display text for the dropdown trigger based on current selections
   *
   * Handles three display states:
   * - No selections: "All"
   * - Single selection: Shows the option label
   * - Multiple selections: Shows count like "3 selected"
   *
   * @returns The text to display in the dropdown trigger button
   */
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
  /**
   * Handles scroll events to determine when to show scroll indicators
   *
   * Scroll indicators appear when content overflows the visible area.
   * Uses a buffer to prevent flickering when scrolling near the edges.
   *
   * @param event - ScrollView scroll event containing position and size data
   */
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const contentHeight = contentSize.height;
    const scrollViewHeight = layoutMeasurement.height;

    setCanScrollUp(scrollY > 0);
    setCanScrollDown(
      scrollY <
        contentHeight -
          scrollViewHeight -
          FILTER_DROPDOWN_CONSTANTS.SCROLL_BUFFER
    );
  };

  // Handle scroll indicator clicks
  const handleScrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleScrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  // Handle quick actions
  const handleSelectAll = () => {
    const allValues = options.map((option) => option.value as T);
    setTempSelectedValues(allValues);
  };

  const handleClearAll = () => {
    setTempSelectedValues([]);
  };

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
    triggerDisabled: {
      opacity: 0.5,
      backgroundColor: theme.colors.background.secondary,
    },
    triggerText: {
      fontSize: DesignTokens.typography.fontSize.sm,
      lineHeight:
        DesignTokens.typography.fontSize.sm *
        DesignTokens.typography.lineHeight.tight,
      fontWeight: DesignTokens.typography.fontWeight.medium,
      flex: 1,
    },
    triggerLabel: {
      fontSize: DesignTokens.typography.fontSize.xs,
      lineHeight:
        DesignTokens.typography.fontSize.xs *
        DesignTokens.typography.lineHeight.tight,
      opacity: 0.7,
      marginRight: DesignTokens.spacing[1],
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background.overlay,
    },
    modalContent: {
      width: Math.min(
        windowWidth * FILTER_DROPDOWN_CONSTANTS.MODAL_WIDTH_PERCENT,
        FILTER_DROPDOWN_CONSTANTS.MODAL_MAX_WIDTH
      ),
      maxWidth: FILTER_DROPDOWN_CONSTANTS.MODAL_MAX_WIDTH,
      minHeight: FILTER_DROPDOWN_CONSTANTS.MODAL_MIN_HEIGHT,
      maxHeight:
        windowHeight * FILTER_DROPDOWN_CONSTANTS.MODAL_MAX_HEIGHT_PERCENT,
      borderRadius: DesignTokens.borderRadius.lg,
      overflow: "hidden",
    },
    modalHeader: {
      paddingHorizontal: DesignTokens.spacing[4],
      paddingVertical: DesignTokens.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    modalHeaderContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalHeaderText: {
      fontSize: DesignTokens.typography.fontSize.lg,
      lineHeight:
        DesignTokens.typography.fontSize.lg *
        DesignTokens.typography.lineHeight.tight,
      fontWeight: "600",
      flex: 1,
    },
    quickActions: {
      flexDirection: "row",
      gap: DesignTokens.spacing[2],
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
      width: FILTER_DROPDOWN_CONSTANTS.CHECKBOX_SIZE,
      height: FILTER_DROPDOWN_CONSTANTS.CHECKBOX_SIZE,
      borderRadius: DesignTokens.borderRadius.sm,
      borderWidth: FILTER_DROPDOWN_CONSTANTS.CHECKBOX_BORDER_WIDTH,
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
      lineHeight:
        DesignTokens.typography.fontSize.base *
        DesignTokens.typography.lineHeight.normal,
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
    scrollIndicator: {
      position: "absolute",
      left: "50%",
      transform: [
        { translateX: FILTER_DROPDOWN_CONSTANTS.SCROLL_INDICATOR_OFFSET },
      ],
      width: FILTER_DROPDOWN_CONSTANTS.SCROLL_INDICATOR_SIZE,
      height: FILTER_DROPDOWN_CONSTANTS.SCROLL_INDICATOR_SIZE,
      borderRadius: DesignTokens.borderRadius.full,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
      backgroundColor: theme.colors.interactive.secondary,
      shadowColor: theme.colors.shadows.base.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.colors.shadows.base.shadowOpacity,
      shadowRadius: 4,
      elevation: 4, // Android shadow
    },
    scrollIndicatorTop: {
      top: FILTER_DROPDOWN_CONSTANTS.SCROLL_INDICATOR_TOP,
    },
    scrollIndicatorBottom: {
      bottom: FILTER_DROPDOWN_CONSTANTS.SCROLL_INDICATOR_BOTTOM,
    },
    scrollIndicatorIcon: {
      color: theme.colors.text.inverse,
    },
  });

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.trigger,
          selectedValues.length > 0 && styles.triggerActive,
          disabled && styles.triggerDisabled,
        ]}
        onPress={disabled ? undefined : handleOpen}
        disabled={disabled}
        accessibilityLabel={`${label} filter: ${displayValue}`}
        accessibilityHint={disabled ? "Filter is currently disabled" : `Opens ${label.toLowerCase()} filter menu`}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        testID={testID}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ThemedText style={styles.triggerLabel}>{label}:</ThemedText>
          <ThemedText style={styles.triggerText} numberOfLines={1}>
            {displayValue}
          </ThemedText>
        </View>
        <MaterialIcons
          name="arrow-drop-down"
          size={FILTER_DROPDOWN_CONSTANTS.ARROW_ICON_SIZE}
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
                <View style={styles.modalHeaderContent}>
                  <ThemedText style={styles.modalHeaderText}>
                    Filter by {label}
                  </ThemedText>
                  <View style={styles.quickActions}>
                    <ThemedButton
                      variant="secondary"
                      size="small"
                      onPress={handleSelectAll}
                      accessibilityLabel="Select all options"
                    >
                      All
                    </ThemedButton>
                    <ThemedButton
                      variant="secondary"
                      size="small"
                      onPress={handleClearAll}
                      accessibilityLabel="Clear all selections"
                    >
                      None
                    </ThemedButton>
                  </View>
                </View>
              </ThemedView>

              <View style={{ position: "relative", flex: 1 }}>
                <ScrollView
                  ref={scrollViewRef}
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
                              size={FILTER_DROPDOWN_CONSTANTS.ICON_SIZE}
                              color={theme.colors.text.inverse}
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
                  <TouchableOpacity
                    style={[styles.scrollIndicator, styles.scrollIndicatorTop]}
                    onPress={handleScrollToTop}
                    accessibilityLabel="Scroll to top"
                    accessibilityRole="button"
                  >
                    <MaterialIcons
                      name="keyboard-arrow-up"
                      size={FILTER_DROPDOWN_CONSTANTS.ICON_SIZE}
                      style={styles.scrollIndicatorIcon}
                    />
                  </TouchableOpacity>
                )}
                {canScrollDown && (
                  <TouchableOpacity
                    style={[
                      styles.scrollIndicator,
                      styles.scrollIndicatorBottom,
                    ]}
                    onPress={handleScrollToBottom}
                    accessibilityLabel="Scroll to bottom"
                    accessibilityRole="button"
                  >
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={FILTER_DROPDOWN_CONSTANTS.ICON_SIZE}
                      style={styles.scrollIndicatorIcon}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <ThemedView style={styles.modalFooter}>
                <ThemedButton
                  variant="secondary"
                  size="medium"
                  onPress={handleCancel}
                  accessibilityLabel="Cancel"
                  style={{ flex: 1 }}
                >
                  Cancel
                </ThemedButton>
                <ThemedButton
                  variant="primary"
                  size="medium"
                  onPress={handleApply}
                  accessibilityLabel={`Apply ${
                    tempSelectedValues.length
                  } filter${tempSelectedValues.length === 1 ? "" : "s"}`}
                  style={{ flex: 1 }}
                >
                  Apply
                  {tempSelectedValues.length > 0 &&
                    ` (${tempSelectedValues.length})`}
                </ThemedButton>
              </ThemedView>
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
