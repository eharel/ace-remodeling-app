import React from "react";
import { StyleSheet, View } from "react-native";

import { CHECKLIST_CONFIG } from "@/constants/ChecklistConfig";
import { DesignTokens } from "@/themes";
import { ChecklistItem as ChecklistItemComponent } from "./ChecklistItem";

interface ChecklistBodyProps {
  /** Array of checked states for each item */
  checkedStates: boolean[];
  /** Callback when an item is toggled */
  onToggleItem: (index: number) => void;
}

/**
 * Body component for the checklist modal
 * Renders the list of checklist items
 */
export function ChecklistBody({
  checkedStates,
  onToggleItem,
}: ChecklistBodyProps) {
  return (
    <View style={styles.body}>
      <View style={styles.checklistContainer}>
        {CHECKLIST_CONFIG.ITEMS.map((item, index) => (
          <ChecklistItemComponent
            key={`checklist-item-${index}`}
            text={item}
            isChecked={checkedStates[index] || false}
            onPress={() => onToggleItem(index)}
            accessibilityLabel={`${item} checklist item`}
            accessibilityHint={
              checkedStates[index]
                ? "Tap to uncheck this item"
                : "Tap to check this item"
            }
            accessibilityState={{
              checked: checkedStates[index] || false,
            }}
          />
        ))}
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
