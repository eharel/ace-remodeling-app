import { useCallback, useMemo, useState } from "react";

import { CHECKLIST_CONFIG } from "@/core/constants";
import {
  flattenItems,
  findItemById,
  getChildIds,
  hasChildren,
  findParentOfItem,
  validateUniqueIds,
  type ChecklistItem,
  type ChecklistProgress,
} from "@/features/checklist/utils/checklistHelpers";

/**
 * Custom hook for managing hierarchical checklist state and operations
 * Provides reusable logic for nested checklist functionality with cascade behavior
 */
export function useChecklist(
  items: readonly ChecklistItem[] = CHECKLIST_CONFIG.ITEMS,
  initialCheckedStates?: Record<string, boolean>,
  initialExpandedStates?: Record<string, boolean>
) {
  // Validate unique IDs on initialization
  useMemo(() => {
    const validation = validateUniqueIds([...items]);
    if (!validation.isValid) {
      // Checklist contains duplicate IDs - silently ignore
    }
  }, [items]);

  // Flatten items for easier access and iteration
  const flatItems = useMemo(() => flattenItems([...items]), [items]);

  // Initialize checked states - keyed by item ID
  const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>(
    () => {
      if (initialCheckedStates) {
        return initialCheckedStates;
      }
      const initial: Record<string, boolean> = {};
      flatItems.forEach((item) => {
        initial[item.id] = false;
      });
      return initial;
    }
  );

  // Initialize expanded states - keyed by item ID (only for parents)
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>(
    () => {
      if (initialExpandedStates) {
        return initialExpandedStates;
      }
      const initial: Record<string, boolean> = {};
      flatItems.forEach((item) => {
        if (hasChildren(item)) {
          initial[item.id] = false; // Default to collapsed
        }
      });
      return initial;
    }
  );

  /**
   * Check if all children of a parent are checked
   */
  const areAllChildrenChecked = useCallback(
    (parentId: string): boolean => {
      const childIds = getChildIds([...items], parentId);
      if (childIds.length === 0) return false;
      return childIds.every((childId) => checkedStates[childId] === true);
    },
    [items, checkedStates]
  );

  /**
   * Update parent checked state based on children
   * Auto-checks parent when all children are checked
   * Auto-unchecks parent when any child is unchecked
   */
  const updateParentState = useCallback(
    (childId: string, newStates: Record<string, boolean>) => {
      const parent = findParentOfItem([...items], childId);
      if (!parent) return newStates;

      const childIds = getChildIds([...items], parent.id);
      const allChildrenChecked = childIds.every(
        (id) => newStates[id] === true
      );

      // Update parent based on children state
      newStates[parent.id] = allChildrenChecked;

      return newStates;
    },
    [items]
  );

  /**
   * Set the checked state of a specific item programmatically
   * Does not trigger cascade logic - use for internal state updates
   */
  const setItemChecked = useCallback(
    (id: string, checked: boolean) => {
      const item = findItemById([...items], id);
      if (!item) {
        return;
      }

      setCheckedStates((prev) => ({
        ...prev,
        [id]: checked,
      }));
    },
    [items]
  );

  /**
   * Toggle the checked state of a specific item with cascade logic
   * Handles parent-child relationships according to hybrid behavior:
   * - Parent with no children: Acts as regular checkbox
   * - Parent with children (unchecked → checked): Checks all children
   * - Parent with children (checked → unchecked): Unchecks all children
   * - Child state change: Auto-updates parent based on all children state
   */
  const toggleItem = useCallback(
    (id: string) => {
      const item = findItemById([...items], id);
      if (!item) {
        return;
      }

      setCheckedStates((prev) => {
        const newStates = { ...prev };
        const currentState = prev[id] || false;
        const newState = !currentState;

        // Update the item itself
        newStates[id] = newState;

        // If item has children, update them all to match parent's new state
        if (hasChildren(item)) {
          const childIds = getChildIds([...items], id);
          childIds.forEach((childId) => {
            newStates[childId] = newState;
          });
        } else {
          // If item is a child, update parent based on all children
          updateParentState(id, newStates);
        }

        return newStates;
      });
    },
    [items, updateParentState]
  );

  /**
   * Toggle the expanded/collapsed state of a parent item
   * Only applicable to items with sub-items
   */
  const toggleExpanded = useCallback(
    (id: string) => {
      const item = findItemById([...items], id);
      if (!item) {
        return;
      }

      if (!hasChildren(item)) {
        return;
      }

      setExpandedStates((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    },
    [items]
  );

  /**
   * Reset all items to unchecked state and collapse all parents
   */
  const resetItems = useCallback(() => {
    const newCheckedStates: Record<string, boolean> = {};
    const newExpandedStates: Record<string, boolean> = {};

    flatItems.forEach((item) => {
      newCheckedStates[item.id] = false;
      if (hasChildren(item)) {
        newExpandedStates[item.id] = false;
      }
    });

    setCheckedStates(newCheckedStates);
    setExpandedStates(newExpandedStates);
  }, [flatItems]);

  /**
   * Get the checked state of a specific item
   */
  const isItemChecked = useCallback(
    (id: string): boolean => {
      const item = findItemById([...items], id);
      if (!item) {
        return false;
      }
      return checkedStates[id] || false;
    },
    [items, checkedStates]
  );

  /**
   * Get the expanded state of a parent item
   */
  const isItemExpanded = useCallback(
    (id: string): boolean => {
      const item = findItemById([...items], id);
      if (!item) {
        return false;
      }
      if (!hasChildren(item)) {
        return false; // Non-parent items are never "expanded"
      }
      return expandedStates[id] || false;
    },
    [items, expandedStates]
  );

  /**
   * Get progress for a specific parent item (completed children / total children)
   */
  const getItemProgress = useCallback(
    (id: string): ChecklistProgress => {
      const item = findItemById([...items], id);
      if (!item) {
        return { completed: 0, total: 0 };
      }

      if (!hasChildren(item)) {
        return { completed: 0, total: 0 };
      }

      const childIds = getChildIds([...items], id);
      const completed = childIds.filter((childId) => checkedStates[childId])
        .length;

      return {
        completed,
        total: childIds.length,
      };
    },
    [items, checkedStates]
  );

  /**
   * Get overall progress counting ALL items (parents + children)
   */
  const getTotalProgress = useCallback((): ChecklistProgress => {
    const total = flatItems.length;
    const completed = flatItems.filter((item) => checkedStates[item.id])
      .length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      percentage,
    };
  }, [flatItems, checkedStates]);

  /**
   * Get progress counting only parent items
   */
  const getParentProgress = useCallback((): ChecklistProgress => {
    const parentItems = flatItems.filter((item) => hasChildren(item));
    const total = parentItems.length;
    const completed = parentItems.filter((item) => checkedStates[item.id])
      .length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      percentage,
    };
  }, [flatItems, checkedStates]);

  return {
    // State
    checkedStates,
    expandedStates,

    // Actions
    toggleItem,
    toggleExpanded,
    resetItems,
    setItemChecked,

    // Queries
    isItemChecked,
    isItemExpanded,
    getItemProgress,
    getTotalProgress,
    getParentProgress,

    // Utility access
    items: [...items],
    flatItems,
  };
}
