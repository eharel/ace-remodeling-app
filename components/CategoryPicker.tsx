import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed";
import { useProjects, useTheme } from "@/contexts";
import { DesignTokens } from "@/themes";
import { ProjectCategory } from "@/types/Category";
import {
  getAllCategories,
  getCategoryDisplayName,
  getCategoryIcon,
} from "@/utils/categoryUtils";

interface CategoryPickerProps {
  currentCategory: ProjectCategory;
  onCategoryChange: (category: ProjectCategory) => void;
}

interface CategoryOption {
  category: ProjectCategory;
  displayName: string;
  icon: string;
  count: number;
}

export function CategoryPicker({
  currentCategory,
  onCategoryChange,
}: CategoryPickerProps) {
  const { theme } = useTheme();
  const { projects } = useProjects();
  const [isOpen, setIsOpen] = useState(false);

  // Get all categories with project counts
  const categories = useMemo(() => {
    if (!projects) return [];

    const allCategories = getAllCategories();
    return allCategories.map((category) => ({
      category,
      displayName: getCategoryDisplayName(category),
      icon: getCategoryIcon(category),
      count: projects.filter((p) => p.category === category).length,
    }));
  }, [projects]);

  const handleSelect = (category: ProjectCategory) => {
    setIsOpen(false);
    onCategoryChange(category);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        trigger: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: DesignTokens.spacing[2],
          paddingVertical: DesignTokens.spacing[1],
        },
        triggerText: {
          fontSize: DesignTokens.typography.fontSize.lg,
          lineHeight:
            DesignTokens.typography.fontSize.lg *
            DesignTokens.typography.lineHeight.tight,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          color: theme.colors.text.primary,
          marginRight: DesignTokens.spacing[1],
        },
        modalOverlay: {
          flex: 1,
          backgroundColor: theme.colors.background.overlay,
          justifyContent: "center",
          alignItems: "center",
          padding: DesignTokens.spacing[4],
        },
        modalContent: {
          backgroundColor: theme.colors.background.card,
          borderRadius: DesignTokens.borderRadius.xl,
          padding: DesignTokens.spacing[4],
          maxHeight: "80%",
          width: "100%",
          maxWidth: 400,
          ...DesignTokens.shadows.lg,
        },
        modalHeader: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: DesignTokens.spacing[4],
          paddingBottom: DesignTokens.spacing[3],
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.primary,
        },
        modalTitle: {
          fontSize: DesignTokens.typography.fontSize.lg,
          lineHeight:
            DesignTokens.typography.fontSize.lg *
            DesignTokens.typography.lineHeight.tight,
          fontWeight: DesignTokens.typography.fontWeight.semibold,
          fontFamily: DesignTokens.typography.fontFamily.semibold,
          color: theme.colors.text.primary,
        },
        closeButton: {
          padding: DesignTokens.spacing[1],
        },
        categoryList: {
          maxHeight: 300,
        },
        categoryItem: {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: DesignTokens.spacing[3],
          paddingHorizontal: DesignTokens.spacing[2],
          borderRadius: DesignTokens.borderRadius.md,
          marginBottom: DesignTokens.spacing[1],
        },
        categoryItemPressed: {
          backgroundColor: theme.colors.background.secondary,
        },
        categoryItemCurrent: {
          backgroundColor: theme.colors.interactive.primary + "20",
        },
        categoryLeft: {
          flexDirection: "row",
          alignItems: "center",
          flex: 1,
        },
        categoryIcon: {
          width: 32,
          height: 32,
          borderRadius: DesignTokens.borderRadius.md,
          backgroundColor: theme.colors.interactive.primary,
          alignItems: "center",
          justifyContent: "center",
          marginRight: DesignTokens.spacing[3],
        },
        categoryInfo: {
          flex: 1,
        },
        categoryName: {
          fontSize: DesignTokens.typography.fontSize.base,
          lineHeight:
            DesignTokens.typography.fontSize.base *
            DesignTokens.typography.lineHeight.normal,
          fontWeight: DesignTokens.typography.fontWeight.medium,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          color: theme.colors.text.primary,
          marginBottom: DesignTokens.spacing[1],
        },
        categoryCount: {
          fontSize: DesignTokens.typography.fontSize.sm,
          lineHeight:
            DesignTokens.typography.fontSize.sm *
            DesignTokens.typography.lineHeight.tight,
          fontFamily: DesignTokens.typography.fontFamily.medium,
          color: theme.colors.text.secondary,
        },
        checkmark: {
          marginLeft: DesignTokens.spacing[2],
        },
      }),
    [theme]
  );

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel={`Current category: ${getCategoryDisplayName(
          currentCategory
        )}. Tap to change category.`}
        accessibilityHint="Opens a list of all project categories to choose from"
      >
        <ThemedText style={styles.triggerText}>
          {getCategoryDisplayName(currentCategory)}
        </ThemedText>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={theme.colors.text.primary}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Category</ThemedText>
              <Pressable
                onPress={handleClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close category picker"
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.colors.text.primary}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.categoryList}
              showsVerticalScrollIndicator={false}
            >
              {categories.map((item) => (
                <Pressable
                  key={item.category}
                  style={({ pressed }) => [
                    styles.categoryItem,
                    item.category === currentCategory &&
                      styles.categoryItemCurrent,
                    pressed && styles.categoryItemPressed,
                  ]}
                  onPress={() => handleSelect(item.category)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.displayName}, ${item.count} projects`}
                  accessibilityHint={`Switch to ${item.displayName.toLowerCase()} category`}
                >
                  <View style={styles.categoryLeft}>
                    <View style={styles.categoryIcon}>
                      <MaterialIcons
                        name={item.icon as any}
                        size={18}
                        color={theme.colors.text.inverse}
                      />
                    </View>
                    <View style={styles.categoryInfo}>
                      <ThemedText style={styles.categoryName}>
                        {item.displayName}
                      </ThemedText>
                      <ThemedText style={styles.categoryCount}>
                        {item.count} project{item.count !== 1 ? "s" : ""}
                      </ThemedText>
                    </View>
                  </View>
                  {item.category === currentCategory && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={theme.colors.interactive.primary}
                      style={styles.checkmark}
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
