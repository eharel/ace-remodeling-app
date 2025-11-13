import React, { createContext, useContext, ReactNode } from "react";

import { useChecklist } from "../hooks/useChecklist";
import type { ChecklistItem, ChecklistProgress } from "../utils/checklistHelpers";

/**
 * Context value interface - exposes all hook methods and state
 */
interface ChecklistContextValue {
  // State
  checkedStates: Record<string, boolean>;
  expandedStates: Record<string, boolean>;

  // Actions
  toggleItem: (id: string) => void;
  toggleExpanded: (id: string) => void;
  resetItems: () => void;
  setItemChecked: (id: string, checked: boolean) => void;

  // Queries
  isItemChecked: (id: string) => boolean;
  isItemExpanded: (id: string) => boolean;
  getItemProgress: (id: string) => ChecklistProgress;
  getTotalProgress: () => ChecklistProgress;
  getParentProgress: () => ChecklistProgress;

  // Utility
  items: ChecklistItem[];
  flatItems: ChecklistItem[];
}

/**
 * Context for sharing checklist state across all components
 * Ensures all components use the same state instance
 */
const ChecklistContext = createContext<ChecklistContextValue | undefined>(
  undefined
);

/**
 * Provider component that wraps useChecklist and shares state
 */
export function ChecklistProvider({ children }: { children: ReactNode }) {
  const checklistState = useChecklist();

  return (
    <ChecklistContext.Provider value={checklistState}>
      {children}
    </ChecklistContext.Provider>
  );
}

/**
 * Hook to access checklist context
 * Must be used within ChecklistProvider
 */
export function useChecklistContext() {
  const context = useContext(ChecklistContext);

  if (context === undefined) {
    throw new Error(
      "useChecklistContext must be used within a ChecklistProvider"
    );
  }

  return context;
}

