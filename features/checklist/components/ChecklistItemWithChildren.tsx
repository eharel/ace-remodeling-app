import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import type { ChecklistItem as ChecklistItemType } from "@/features/checklist/utils/checklistHelpers";
import { useTheme } from "@/shared/contexts";

/**
 * Layout constants for column-based grid structure
 * Shared by both parent and child rows for consistent alignment
 */
const LAYOUT = {
  ICON_SIZE: 24,
  ICON_MARGIN_RIGHT: DesignTokens.spacing[2], // 8px
  CHECKBOX_SIZE: 24,
  CHECKBOX_MARGIN_RIGHT: DesignTokens.spacing[3], // 12px
  ROW_PADDING_VERTICAL: DesignTokens.spacing[3], // 12px
  ROW_PADDING_HORIZONTAL: DesignTokens.spacing[1], // 4px
  MIN_TOUCH_TARGET: 44, // Minimum height for accessibility
} as const;

// Calculate icon column width (chevron + margin)
const ICON_COLUMN_WIDTH = LAYOUT.ICON_SIZE + LAYOUT.ICON_MARGIN_RIGHT; // 32px

// Calculate checkbox column width (checkbox + margin)
const CHECKBOX_COLUMN_WIDTH =
  LAYOUT.CHECKBOX_SIZE + LAYOUT.CHECKBOX_MARGIN_RIGHT; // 36px

/**
 * Props for the ChecklistItemWithChildren component
 */
interface ChecklistItemWithChildrenProps {
  /** Parent item with subItems */
  item: ChecklistItemType;
  /** Current expand state */
  isExpanded: boolean;
  /** All checked states keyed by item ID */
  checkedStates: Record<string, boolean>;
  /** Toggle expand/collapse callback */
  onToggleExpanded: (id: string) => void;
  /** Toggle checked state callback */
  onToggleItem: (id: string) => void;
}

/**
 * Component for rendering parent checklist items with expandable children
 * Uses column-based grid layout for robust alignment between parent and children
 */
export function ChecklistItemWithChildren({
  item,
  isExpanded,
  checkedStates,
  onToggleExpanded,
  onToggleItem,
}: ChecklistItemWithChildrenProps) {
  const { theme } = useTheme();

  // Calculate progress for this parent
  const childProgress = React.useMemo(() => {
    if (!item.subItems || item.subItems.length === 0) {
      return { completed: 0, total: 0 };
    }
    const completed = item.subItems.filter(
      (child) => checkedStates[child.id]
    ).length;
    return { completed, total: item.subItems.length };
  }, [item.subItems, checkedStates]);

  const isParentChecked = checkedStates[item.id] || false;

  // Handler to toggle expand/collapse
  const handleToggleExpanded = () => {
    onToggleExpanded(item.id);
  };

  // Handler to toggle parent checkbox (separate from expand)
  const handleToggleParent = (e: any) => {
    e.stopPropagation(); // Prevent expand toggle
    onToggleItem(item.id);
  };

  return (
    <View style={styles.container}>
      {/* PARENT ROW - Column-based grid layout */}
      <TouchableOpacity
        style={styles.parentRow}
        onPress={handleToggleExpanded}
        activeOpacity={DesignTokens.interactions.activeOpacity}
        accessibilityRole="button"
        accessibilityLabel={`${isExpanded ? "Collapse" : "Expand"} ${
          item.text
        } section`}
        accessibilityState={{ expanded: isExpanded }}
        accessibilityHint={`${item.text} has ${childProgress.total} sub-items`}
      >
        {/* Column 1: Icon Column (Chevron) */}
        <View style={styles.iconColumn}>
          <MaterialIcons
            name={isExpanded ? "expand-more" : "chevron-right"}
            size={LAYOUT.ICON_SIZE}
            color={theme.colors.text.secondary}
            accessibilityElementsHidden={true}
          />
        </View>

        {/* Column 2: Checkbox Column */}
        <View style={styles.checkboxColumn}>
          <TouchableOpacity
            onPress={handleToggleParent}
            activeOpacity={DesignTokens.interactions.activeOpacity}
            accessibilityRole="checkbox"
            accessibilityLabel={`${item.text} parent checkbox`}
            accessibilityHint={
              isParentChecked
                ? "Tap to uncheck parent and all children"
                : "Tap to check parent and all children"
            }
            accessibilityState={{ checked: isParentChecked }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name={isParentChecked ? "check-box" : "check-box-outline-blank"}
              size={LAYOUT.CHECKBOX_SIZE}
              color={
                isParentChecked
                  ? theme.colors.interactive.primary
                  : theme.colors.text.secondary
              }
              accessibilityElementsHidden={true}
            />
          </TouchableOpacity>
        </View>

        {/* Column 3: Text Column (flexible) */}
        <Text
          style={[
            styles.parentText,
            {
              color: theme.colors.text.primary,
              textDecorationLine: isParentChecked ? "line-through" : "none",
              opacity: isParentChecked
                ? DesignTokens.interactions.disabledOpacity
                : 1,
            },
          ]}
          accessibilityElementsHidden={true}
        >
          {item.text}
        </Text>

        {/* Column 4: Progress Badge (always visible) */}
        <View
          style={styles.progressBadge}
          accessibilityLabel={`${childProgress.completed} of ${childProgress.total} items completed`}
        >
          <Text
            style={[
              styles.progressBadgeText,
              { color: theme.colors.text.secondary },
            ]}
          >
            [{childProgress.completed}/{childProgress.total}]
          </Text>
        </View>
      </TouchableOpacity>

      {/* CHILD ROWS - Same column structure with empty spacer in icon column */}
      {isExpanded && item.subItems && (
        <View style={styles.childrenContainer}>
          {item.subItems.map((child) => {
            const isChildChecked = checkedStates[child.id] || false;

            return (
              <TouchableOpacity
                key={child.id}
                style={styles.childRow}
                onPress={() => onToggleItem(child.id)}
                activeOpacity={DesignTokens.interactions.activeOpacity}
                accessibilityRole="checkbox"
                accessibilityLabel={`${child.text} checklist item`}
                accessibilityHint={
                  isChildChecked
                    ? "Tap to uncheck this item"
                    : "Tap to check this item"
                }
                accessibilityState={{ checked: isChildChecked }}
              >
                {/* Column 1: Checkbox Column (first column in child rows) */}
                <View style={styles.checkboxColumn}>
                  <MaterialIcons
                    name={
                      isChildChecked ? "check-box" : "check-box-outline-blank"
                    }
                    size={LAYOUT.CHECKBOX_SIZE}
                    color={
                      isChildChecked
                        ? theme.colors.interactive.primary
                        : theme.colors.text.secondary
                    }
                    accessibilityElementsHidden={true}
                  />
                </View>

                {/* Column 3: Text Column (flexible) */}
                <Text
                  style={[
                    styles.childText,
                    {
                      color: theme.colors.text.primary,
                      textDecorationLine: isChildChecked
                        ? "line-through"
                        : "none",
                      opacity: isChildChecked
                        ? DesignTokens.interactions.disabledOpacity
                        : 1,
                    },
                  ]}
                  accessibilityElementsHidden={true}
                >
                  {child.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignTokens.spacing[1], // 4px spacing between sections
  },

  // === PARENT ROW STYLES ===
  parentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: LAYOUT.ROW_PADDING_VERTICAL,
    // No paddingHorizontal - scrollContent handles container boundary
    minHeight: LAYOUT.MIN_TOUCH_TARGET,
  },

  // === COLUMN DEFINITIONS (shared by parent and children) ===
  iconColumn: {
    width: ICON_COLUMN_WIDTH, // 32px (24px icon + 8px margin)
    justifyContent: "center", // Ensures column maintains width even when empty
  },

  checkboxColumn: {
    width: CHECKBOX_COLUMN_WIDTH, // 36px (24px checkbox + 12px margin)
    justifyContent: "center", // Ensures column maintains width even when empty
  },

  // === PARENT TEXT ===
  parentText: {
    fontSize: DesignTokens.typography.fontSize.lg, // 18px for stronger hierarchy
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    flex: 1, // Flexible width
  },

  // === PROGRESS BADGE ===
  progressBadge: {
    paddingHorizontal: DesignTokens.spacing[2], // 8px internal padding
    marginLeft: DesignTokens.spacing[2], // 8px spacing from text
  },

  progressBadgeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  // === CHILDREN CONTAINER ===
  childrenContainer: {
    marginLeft: ICON_COLUMN_WIDTH + CHECKBOX_COLUMN_WIDTH, // 68px (32px icon + 36px checkbox)
    // This indents the entire child row container, aligning child checkboxes with parent text start
  },

  // === CHILD ROW STYLES ===
  childRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: LAYOUT.ROW_PADDING_VERTICAL,
    // No paddingHorizontal - scrollContent handles container boundary
    minHeight: LAYOUT.MIN_TOUCH_TARGET,
  },

  // === CHILD TEXT ===
  childText: {
    fontSize: DesignTokens.typography.fontSize.base,
    flex: 1, // Flexible width
  },
});
