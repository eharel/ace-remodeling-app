import { useCallback, useMemo, useState } from "react";

import { CHECKLIST_CONFIG } from "@/constants/ChecklistConfig";

/**
 * Custom hook for managing checklist state and operations
 * Provides reusable logic for checklist functionality
 */
export function useChecklist(
  itemCount: number = CHECKLIST_CONFIG.ITEMS.length
) {
  const [checkedStates, setCheckedStates] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );

  /**
   * Toggle the checked state of a specific item
   */
  const toggleItem = useCallback(
    (index: number) => {
      // Bounds checking to prevent array index errors
      if (index < 0 || index >= itemCount) {
        console.warn(
          `toggleItem: Index ${index} is out of bounds (0-${itemCount - 1})`
        );
        return;
      }

      setCheckedStates((prev) => {
        const newState = [...prev];
        newState[index] = !newState[index];
        return newState;
      });
    },
    [itemCount]
  );

  /**
   * Reset all items to unchecked state
   */
  const resetItems = useCallback(() => {
    setCheckedStates(new Array(itemCount).fill(false));
  }, [itemCount]);

  /**
   * Calculate progress statistics
   */
  const progress = useMemo(() => {
    const completed = checkedStates.filter(Boolean).length;
    const total = checkedStates.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return {
      completed,
      total,
      percentage: Math.round(percentage),
      isComplete: completed === total,
      isEmpty: completed === 0,
    };
  }, [checkedStates]);

  /**
   * Get the checked state of a specific item
   */
  const isItemChecked = useCallback(
    (index: number) => {
      if (index < 0 || index >= itemCount) {
        console.warn(
          `isItemChecked: Index ${index} is out of bounds (0-${itemCount - 1})`
        );
        return false;
      }
      return checkedStates[index] || false;
    },
    [checkedStates, itemCount]
  );

  /**
   * Set the checked state of a specific item
   */
  const setItemChecked = useCallback(
    (index: number, checked: boolean) => {
      // Bounds checking to prevent array index errors
      if (index < 0 || index >= itemCount) {
        console.warn(
          `setItemChecked: Index ${index} is out of bounds (0-${itemCount - 1})`
        );
        return;
      }

      setCheckedStates((prev) => {
        const newState = [...prev];
        newState[index] = checked;
        return newState;
      });
    },
    [itemCount]
  );

  return {
    // State
    checkedStates,

    // Actions
    toggleItem,
    resetItems,
    setItemChecked,

    // Computed values
    progress,
    isItemChecked,
  };
}
