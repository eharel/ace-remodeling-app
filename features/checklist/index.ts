/**
 * Checklist Feature Module
 * Exports all checklist-related components, hooks, and contexts
 */

// Components
export { ChecklistBody } from "./components/ChecklistBody";
export { ChecklistHeader } from "./components/ChecklistHeader";
export { ChecklistItem } from "./components/ChecklistItem";
export { ChecklistItemWithChildren } from "./components/ChecklistItemWithChildren";
export { ChecklistModal } from "./components/ChecklistModal";
export { FloatingChecklistButton } from "./components/FloatingChecklistButton";

// Hooks
export { useChecklist } from "./hooks/useChecklist";

// Contexts
export { ChecklistProvider, useChecklistContext } from "./contexts/ChecklistContext";

// Utilities and Types
export {
  flattenItems,
  hasChildren,
  getChildIds,
  findItemById,
  findParentOfItem,
  validateUniqueIds,
  getAllDescendantIds,
  type ChecklistItem as ChecklistItemType,
  type ChecklistProgress,
} from "./utils/checklistHelpers";
