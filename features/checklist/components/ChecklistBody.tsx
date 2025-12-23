import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { CHECKLIST_CONFIG } from "@/shared/constants";
import { DesignTokens } from "@/shared/themes";
import { hasChildren } from "@/features/checklist/utils/checklistHelpers";
import { useChecklistContext } from "@/features/checklist/contexts/ChecklistContext";
import { ChecklistItem as ChecklistItemComponent } from "./ChecklistItem";
import { ChecklistItemWithChildren } from "./ChecklistItemWithChildren";

/**
 * Body component for the checklist modal
 * Renders the hierarchical list of checklist items with scrolling support
 * No props needed - uses context for shared state
 */
export function ChecklistBody() {
  const {
    checkedStates,
    toggleItem,
    toggleExpanded,
    isItemExpanded,
  } = useChecklistContext();

  return (
    <View style={styles.body}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: DesignTokens.spacing[5], // 20px horizontal padding for container
    paddingVertical: DesignTokens.spacing[4], // 16px vertical padding
    paddingBottom: DesignTokens.spacing[5], // Extra padding at bottom
  },
});
