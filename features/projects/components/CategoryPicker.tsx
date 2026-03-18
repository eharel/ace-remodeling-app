import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import { DesignTokens } from "@/shared/themes";
import {
  CORE_CATEGORIES,
  CoreCategory,
  getCategoryLabel,
} from "@/shared/types/ComponentCategory";

interface CategoryPickerProps {
  currentCategory: string;
  onCategoryChange: (category: CoreCategory) => void;
  disabled?: boolean;
}

const CATEGORY_OPTIONS: { value: CoreCategory; label: string }[] = [
  { value: CORE_CATEGORIES.BATHROOM, label: "Bathroom" },
  { value: CORE_CATEGORIES.KITCHEN, label: "Kitchen" },
  { value: CORE_CATEGORIES.FULL_HOME, label: "Full Home" },
  { value: CORE_CATEGORIES.ADU_ADDITION, label: "ADU/Addition" },
  { value: CORE_CATEGORIES.OUTDOOR_LIVING, label: "Outdoor Living" },
  { value: CORE_CATEGORIES.NEW_CONSTRUCTION, label: "New Construction" },
  { value: CORE_CATEGORIES.COMMERCIAL, label: "Commercial" },
  { value: CORE_CATEGORIES.MISCELLANEOUS, label: "Other" },
];

/**
 * CategoryPicker - Dropdown picker for component category
 *
 * Opens as an anchored dropdown below the trigger button.
 */
export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  currentCategory,
  onCategoryChange,
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
      const maxLeft = windowWidth - 200;
      const adjustedLeft = Math.min(dropdownLeft, maxLeft);

      setDropdownPosition({
        top: dropdownTop,
        left: Math.max(8, adjustedLeft),
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
        categoryText: {
          fontSize: DesignTokens.typography.fontSize.sm,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          color: theme.colors.text.primary,
        },
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
          maxHeight: 300,
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

  const handleSelectCategory = (category: CoreCategory) => {
    onCategoryChange(category);
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
          accessibilityLabel={`Change category, current: ${getCategoryLabel(currentCategory)}`}
          accessibilityRole="button"
        >
          <ThemedText style={styles.categoryText}>
            {getCategoryLabel(currentCategory)}
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
            <ScrollView bounces={false}>
              {CATEGORY_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionButton,
                    currentCategory === option.value &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() => handleSelectCategory(option.value)}
                >
                  <ThemedText
                    style={[
                      styles.optionText,
                      currentCategory === option.value &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  {currentCategory === option.value && (
                    <MaterialIcons
                      name="check"
                      size={18}
                      color={theme.colors.interactive.primary}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};
