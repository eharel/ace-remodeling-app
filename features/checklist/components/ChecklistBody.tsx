import React from "react";
import { StyleSheet, View } from "react-native";

import { CHECKLIST_CONFIG } from "@/core/constants";
import { DesignTokens } from "@/core/themes";
import { hasChildren } from "@/features/checklist/utils/checklistHelpers";
import { useChecklist } from "@/features/checklist/hooks/useChecklist";
import { ChecklistItem as ChecklistItemComponent } from "./ChecklistItem";
import { ChecklistItemWithChildren } from "./ChecklistItemWithChildren";

/**
 * Body component for the checklist modal
 * Renders the hierarchical list of checklist items
 * No props needed - uses hook directly
 */
export function ChecklistBody() {
  const {
    checkedStates,
    toggleItem,
    toggleExpanded,
    isItemExpanded,
  } = useChecklist();

  return (
    <View style={styles.body}>
      <View style={styles.checklistContainer}>
        {CHECKLIST_CONFIG.ITEMS.map((item) => {
          if (hasChildren(item)) {
            // Render parent item with expandable children
            return (
              <ChecklistItemWithChildren
                key={item.id}
                item={item}
                isExpanded={isItemExpanded(item.id)}
                checkedStates={checkedStates}
                onToggleExpanded={toggleExpanded}
                onToggleItem={toggleItem}
              />
            );
          } else {
            // Render standalone item (no children)
            return (
              <ChecklistItemComponent
                key={item.id}
                text={item.text}
                isChecked={checkedStates[item.id] || false}
                onPress={() => toggleItem(item.id)}
                accessibilityLabel={`${item.text} checklist item`}
                accessibilityHint={
                  checkedStates[item.id]
                    ? "Tap to uncheck this item"
                    : "Tap to check this item"
                }
                accessibilityState={{
                  checked: checkedStates[item.id] || false,
                }}
              />
            );
          }
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: DesignTokens.spacing[5], // 20px padding
    flex: 1,
  },
  checklistContainer: {
    flex: 1,
  },
});
