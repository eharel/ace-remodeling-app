import React from "react";
import { StyleSheet, View } from "react-native";

import { ChecklistItem as ChecklistItemComponent } from "@/components/ChecklistItem";
import { CHECKLIST_CONFIG } from "@/constants/ChecklistConfig";

interface ChecklistBodyProps {
  /** Array of checked states for each item */
  checkedItems: boolean[];
  /** Callback when an item is toggled */
  onToggleItem: (index: number) => void;
}

/**
 * Body component for the checklist modal
 * Renders the list of checklist items
 */
export function ChecklistBody({
  checkedItems,
  onToggleItem,
}: ChecklistBodyProps) {
  return (
    <View style={styles.body}>
      <View style={styles.checklistContainer}>
        {CHECKLIST_CONFIG.ITEMS.map((item, index) => (
          <ChecklistItemComponent
            key={`checklist-item-${index}`}
            text={item}
            isChecked={checkedItems[index] || false}
            onPress={() => onToggleItem(index)}
            accessibilityLabel={`${item} checklist item`}
            accessibilityHint={
              checkedItems[index]
                ? "Tap to uncheck this item"
                : "Tap to check this item"
            }
            accessibilityState={{
              checked: checkedItems[index] || false,
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: CHECKLIST_CONFIG.BODY.PADDING,
    flex: 1,
  },
  checklistContainer: {
    flex: 1,
  },
});
