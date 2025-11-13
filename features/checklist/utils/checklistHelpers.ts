/**
 * Utility functions and types for hierarchical checklist functionality
 * Provides helper methods for working with nested checklist items
 */

/**
 * Interface for hierarchical checklist items
 * Supports parent-child relationships with optional nesting
 */
export interface ChecklistItem {
  /** Unique identifier (e.g., "intro", "intro-rapport") */
  id: string;
  /** Display text for the item */
  text: string;
  /** Optional nested child items */
  subItems?: ChecklistItem[];
}

/**
 * Progress information for checklist items or overall checklist
 */
export interface ChecklistProgress {
  /** Number of completed items */
  completed: number;
  /** Total number of items */
  total: number;
  /** Completion percentage (0-100) */
  percentage?: number;
}

/**
 * Recursively flatten a hierarchical checklist structure into a flat array
 * @param items - Array of potentially nested checklist items
 * @returns Flat array containing all items (parents and children) with their IDs
 */
export function flattenItems(items: ChecklistItem[]): ChecklistItem[] {
  const result: ChecklistItem[] = [];

  const flatten = (itemList: ChecklistItem[]) => {
    for (const item of itemList) {
      result.push(item);
      if (item.subItems && item.subItems.length > 0) {
        flatten(item.subItems);
      }
    }
  };

  flatten(items);
  return result;
}

/**
 * Check if a checklist item has children
 * @param item - The checklist item to check
 * @returns True if the item has sub-items, false otherwise
 */
export function hasChildren(item: ChecklistItem): boolean {
  return Boolean(item.subItems && item.subItems.length > 0);
}

/**
 * Get all child IDs for a given parent item
 * @param items - Array of checklist items to search
 * @param parentId - ID of the parent item
 * @returns Array of child item IDs, or empty array if no children found
 */
export function getChildIds(
  items: ChecklistItem[],
  parentId: string
): string[] {
  const parent = findItemById(items, parentId);
  if (!parent || !parent.subItems) {
    return [];
  }
  return parent.subItems.map((child) => child.id);
}

/**
 * Find a checklist item by its ID in a hierarchical structure
 * @param items - Array of checklist items to search
 * @param id - ID of the item to find
 * @returns The checklist item if found, undefined otherwise
 */
export function findItemById(
  items: ChecklistItem[],
  id: string
): ChecklistItem | undefined {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.subItems) {
      const found = findItemById(item.subItems, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * Find the parent of a given item ID
 * @param items - Array of checklist items to search
 * @param childId - ID of the child item
 * @returns The parent item if found, undefined if item is top-level or not found
 */
export function findParentOfItem(
  items: ChecklistItem[],
  childId: string
): ChecklistItem | undefined {
  for (const item of items) {
    if (item.subItems) {
      // Check if this item is a direct parent
      if (item.subItems.some((child) => child.id === childId)) {
        return item;
      }
      // Recursively search in sub-items
      const found = findParentOfItem(item.subItems, childId);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * Validate that all item IDs in a checklist structure are unique
 * @param items - Array of checklist items to validate
 * @returns Object with isValid flag and array of duplicate IDs if any
 */
export function validateUniqueIds(items: ChecklistItem[]): {
  isValid: boolean;
  duplicates: string[];
} {
  const flatItems = flattenItems(items);
  const ids = flatItems.map((item) => item.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const uniqueDuplicates = Array.from(new Set(duplicates));

  return {
    isValid: uniqueDuplicates.length === 0,
    duplicates: uniqueDuplicates,
  };
}

/**
 * Get all descendant IDs for a given item (children, grandchildren, etc.)
 * @param items - Array of checklist items to search
 * @param parentId - ID of the parent item
 * @returns Array of all descendant item IDs
 */
export function getAllDescendantIds(
  items: ChecklistItem[],
  parentId: string
): string[] {
  const parent = findItemById(items, parentId);
  if (!parent || !parent.subItems) {
    return [];
  }

  const descendants: string[] = [];
  const collectDescendants = (itemList: ChecklistItem[]) => {
    for (const item of itemList) {
      descendants.push(item.id);
      if (item.subItems) {
        collectDescendants(item.subItems);
      }
    }
  };

  collectDescendants(parent.subItems);
  return descendants;
}

