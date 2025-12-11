import { MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { DesignTokens } from "@/core/themes";
import {
  CORE_CATEGORIES,
  ComponentCategory,
  CoreCategory,
  getCategoryLabel,
} from "@/core/types/ComponentCategory";
import { ThemedText } from "@/shared/components";
import { useTheme } from "@/shared/contexts";
import {
  CATEGORY_DISPLAY_ORDER,
  getCategoryIcon,
} from "@/shared/utils/categoryUtils";

/**
 * Props for CategoryPicker component
 */
export interface CategoryPickerProps {
  /** Currently selected category */
  value: ComponentCategory | null;
  /** Callback when category changes */
  onChange: (category: ComponentCategory) => void;
  /** Categories to exclude (e.g., already used in project) */
  excludeCategories?: ComponentCategory[];
  /** Whether to allow custom category entry */
  allowCustom?: boolean;
  /** Test ID for testing */
  testID?: string;
}

/**
 * CategoryPicker - Reusable category selection component
 *
 * Displays a list of predefined core categories with icons.
 * Optionally allows custom category entry and excludes already-used categories.
 *
 * @component
 */
export function CategoryPicker({
  value,
  onChange,
  excludeCategories = [],
  allowCustom = true,
  testID = "category-picker",
}: CategoryPickerProps) {
  const { theme } = useTheme();
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: DesignTokens.spacing[3],
        },
        grid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: DesignTokens.spacing[2],
        },
        categoryButton: {
          flexDirection: "row",
          alignItems: "center",
          gap: DesignTokens.spacing[2],
          paddingHorizontal: DesignTokens.spacing[4],
          paddingVertical: DesignTokens.spacing[3],
          borderRadius: DesignTokens.borderRadius.md,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
          backgroundColor: theme.colors.background.secondary,
          minWidth: 140,
        },
        categoryButtonSelected: {
          borderColor: theme.colors.interactive.primary,
          backgroundColor: theme.colors.interactive.primary + "10",
        },
        categoryButtonDisabled: {
          opacity: DesignTokens.interactions.disabledOpacity,
        },
        categoryIcon: {
          opacity: 0.7,
        },
        categoryText: {
          fontSize: DesignTokens.typography.fontSize.base,
          color: theme.colors.text.primary,
          fontWeight: DesignTokens.typography.fontWeight.medium,
        },
        customInputContainer: {
          gap: DesignTokens.spacing[2],
        },
        customInput: {
          borderWidth: 1,
          borderRadius: DesignTokens.borderRadius.md,
          paddingHorizontal: DesignTokens.spacing[3],
          paddingVertical: DesignTokens.spacing[2],
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.primary,
          color: theme.colors.text.primary,
          fontSize: DesignTokens.typography.fontSize.base,
        },
        customInputLabel: {
          fontSize: DesignTokens.typography.fontSize.sm,
          color: theme.colors.text.secondary,
        },
      }),
    [theme]
  );

  const availableCategories = useMemo(() => {
    return CATEGORY_DISPLAY_ORDER.filter(
      (cat) => !excludeCategories.includes(cat)
    );
  }, [excludeCategories]);

  const handleCategorySelect = (category: CoreCategory) => {
    onChange(category);
    setShowCustomInput(false);
    setCustomCategory("");
  };

  const handleCustomCategory = () => {
    if (customCategory.trim()) {
      onChange(customCategory.trim().toLowerCase().replace(/\s+/g, "-"));
      setShowCustomInput(false);
    }
  };

  const isCustomCategory =
    value && !Object.values(CORE_CATEGORIES).includes(value as CoreCategory);

  return (
    <View style={styles.container} testID={testID}>
      {/* Core Categories Grid */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {availableCategories.map((category) => {
          const isSelected = value === category;
          const isExcluded = excludeCategories.includes(category);
          const iconName = getCategoryIcon(
            category
          ) as keyof typeof MaterialIcons.glyphMap;

          return (
            <Pressable
              key={category}
              style={[
                styles.categoryButton,
                isSelected && styles.categoryButtonSelected,
                isExcluded && styles.categoryButtonDisabled,
              ]}
              onPress={() => !isExcluded && handleCategorySelect(category)}
              disabled={isExcluded}
              accessibilityRole="button"
              accessibilityLabel={`Select ${getCategoryLabel(
                category
              )} category`}
              accessibilityState={{ selected: isSelected }}
            >
              <MaterialIcons
                name={iconName}
                size={20}
                color={
                  isSelected
                    ? theme.colors.interactive.primary
                    : theme.colors.text.secondary
                }
                style={styles.categoryIcon}
              />
              <ThemedText style={styles.categoryText}>
                {getCategoryLabel(category)}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Custom Category Input */}
      {allowCustom && (
        <View style={styles.customInputContainer}>
          {!showCustomInput && !isCustomCategory ? (
            <Pressable
              onPress={() => setShowCustomInput(true)}
              accessibilityRole="button"
              accessibilityLabel="Enter custom category"
            >
              <ThemedText
                style={[
                  styles.customInputLabel,
                  { color: theme.colors.interactive.primary },
                ]}
              >
                + Custom Category
              </ThemedText>
            </Pressable>
          ) : (
            <>
              <ThemedText style={styles.customInputLabel}>
                Custom Category
              </ThemedText>
              <TextInput
                style={styles.customInput}
                value={
                  isCustomCategory ? getCategoryLabel(value) : customCategory
                }
                onChangeText={setCustomCategory}
                placeholder="e.g., home-theater, study-room"
                placeholderTextColor={theme.colors.text.tertiary}
                onSubmitEditing={handleCustomCategory}
                editable={!isCustomCategory}
                accessibilityLabel="Custom category name"
              />
              {!isCustomCategory && (
                <Pressable
                  onPress={() => {
                    setShowCustomInput(false);
                    setCustomCategory("");
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel custom category"
                >
                  <ThemedText
                    style={[
                      styles.customInputLabel,
                      { color: theme.colors.text.tertiary },
                    ]}
                  >
                    Cancel
                  </ThemedText>
                </Pressable>
              )}
            </>
          )}
        </View>
      )}

      {/* Show selected custom category */}
      {isCustomCategory && (
        <View style={styles.customInputContainer}>
          <ThemedText style={styles.customInputLabel}>
            Selected: {getCategoryLabel(value)}
          </ThemedText>
          <Pressable
            onPress={() => onChange("" as ComponentCategory)}
            accessibilityRole="button"
            accessibilityLabel="Clear selection"
          >
            <ThemedText
              style={[
                styles.customInputLabel,
                { color: theme.colors.interactive.primary },
              ]}
            >
              Change Category
            </ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}
