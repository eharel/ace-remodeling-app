import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { DesignTokens } from "@/core/themes";
import { useTheme } from "@/shared/contexts";
import type { ChecklistItem as ChecklistItemType } from "@/features/checklist/utils/checklistHelpers";
import { ChecklistItem } from "./ChecklistItem";

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
 * Displays chevron, checkbox, progress badge, and nested child items
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
    const completed = item.subItems.filter((child) => checkedStates[child.id])
      .length;
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
      {/* Parent Row - Tappable for expand/collapse */}
      <TouchableOpacity
        style={styles.parentRow}
        onPress={handleToggleExpanded}
        activeOpacity={DesignTokens.interactions.activeOpacity}
        accessibilityRole="button"
        accessibilityLabel={`${isExpanded ? "Collapse" : "Expand"} ${item.text} section`}
        accessibilityState={{ expanded: isExpanded }}
        accessibilityHint={`${item.text} has ${childProgress.total} sub-items`}
      >
        {/* Chevron Icon */}
        <MaterialIcons
          name={isExpanded ? "expand-more" : "chevron-right"}
          size={24}
          color={theme.colors.text.secondary}
          style={styles.chevron}
          accessibilityElementsHidden={true}
        />

        {/* Parent Checkbox - Separate tap target */}
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
            size={24}
            color={
              isParentChecked
                ? theme.colors.interactive.primary
                : theme.colors.text.secondary
            }
            accessibilityElementsHidden={true}
          />
        </TouchableOpacity>

        {/* Parent Text */}
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

        {/* Progress Badge - Only show when collapsed */}
        {!isExpanded && (
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
        )}
      </TouchableOpacity>

      {/* Child Items - Indented, only visible when expanded */}
      {isExpanded && item.subItems && (
        <View style={styles.childrenContainer}>
          {item.subItems.map((child) => (
            <ChecklistItem
              key={child.id}
              text={child.text}
              isChecked={checkedStates[child.id] || false}
              onPress={() => onToggleItem(child.id)}
              accessibilityLabel={`${child.text} checklist item`}
              accessibilityHint={
                checkedStates[child.id]
                  ? "Tap to uncheck this item"
                  : "Tap to check this item"
              }
              accessibilityState={{ checked: checkedStates[child.id] || false }}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignTokens.spacing[1], // 4px spacing between sections
  },
  parentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: DesignTokens.spacing[3], // 12px
    paddingHorizontal: DesignTokens.spacing[1], // 4px
  },
  chevron: {
    marginRight: DesignTokens.spacing[2], // 8px
  },
  parentText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginLeft: DesignTokens.spacing[3], // 12px
    flex: 1,
  },
  progressBadge: {
    paddingHorizontal: DesignTokens.spacing[2], // 8px
  },
  progressBadgeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  childrenContainer: {
    marginLeft: DesignTokens.spacing[6], // 24px indentation
  },
});



