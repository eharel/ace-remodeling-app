import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import { CHECKLIST_CONFIG } from "@/constants/ChecklistConfig";

/**
 * Custom hook for managing checklist state and operations
 * Provides reusable logic for checklist functionality
 */
export function useChecklist(itemCount: number = CHECKLIST_CONFIG.ITEM_COUNT) {
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );

  /**
   * Toggle the checked state of a specific item
   */
  const toggleItem = useCallback((index: number) => {
    setCheckedItems((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  }, []);

  /**
   * Reset all items to unchecked state
   */
  const resetItems = useCallback(() => {
    setCheckedItems(new Array(itemCount).fill(false));
  }, [itemCount]);

  /**
   * Reset all items with confirmation dialog
   */
  const resetItemsWithConfirmation = useCallback(() => {
    try {
      Alert.alert(
        CHECKLIST_CONFIG.ALERT.TITLE,
        CHECKLIST_CONFIG.ALERT.MESSAGE,
        [
          {
            text: CHECKLIST_CONFIG.ALERT.CANCEL_TEXT,
            style: "cancel",
          },
          {
            text: CHECKLIST_CONFIG.ALERT.RESET_TEXT,
            style: "destructive",
            onPress: resetItems,
          },
        ],
        {
          cancelable: CHECKLIST_CONFIG.ALERT.CANCELABLE,
          onDismiss: () => {
            // Handles when alert is dismissed by tapping outside or back button
            // No action needed - just dismisses the alert
          },
        }
      );
    } catch (error) {
      // Fallback: direct reset without confirmation if alert fails
      console.warn("Alert failed, resetting directly:", error);
      resetItems();
    }
  }, [resetItems]);

  /**
   * Calculate progress statistics
   */
  const progress = useMemo(() => {
    const completed = checkedItems.filter(Boolean).length;
    const total = checkedItems.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return {
      completed,
      total,
      percentage: Math.round(percentage),
      isComplete: completed === total,
      isEmpty: completed === 0,
    };
  }, [checkedItems]);

  /**
   * Get the checked state of a specific item
   */
  const isItemChecked = useCallback(
    (index: number) => checkedItems[index] || false,
    [checkedItems]
  );

  /**
   * Set the checked state of a specific item
   */
  const setItemChecked = useCallback((index: number, checked: boolean) => {
    setCheckedItems((prev) => {
      const newState = [...prev];
      newState[index] = checked;
      return newState;
    });
  }, []);

  return {
    // State
    checkedItems,

    // Actions
    toggleItem,
    resetItems,
    resetItemsWithConfirmation,
    setItemChecked,

    // Computed values
    progress,
    isItemChecked,
  };
}
