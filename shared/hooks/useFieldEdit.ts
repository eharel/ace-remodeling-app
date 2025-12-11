import { useCallback, useMemo } from "react";
import { useProjectMutations } from "./useProjectMutations";

/**
 * Options for useFieldEdit hook
 */
export interface UseFieldEditOptions {
  /** Project ID */
  projectId: string;
  /** Component ID */
  componentId: string;
  /** Field name to edit */
  field: string;
  /** Current component value */
  currentValue: string | undefined;
  /** Inherited value from project (if component value is empty) */
  inheritedValue?: string;
  /** Callback when creating an override for inherited value */
  onCreateOverride?: () => void;
}

/**
 * Return type for useFieldEdit hook
 */
export interface UseFieldEditReturn {
  /** Current display value (component value or inherited) */
  value: string;
  /** Whether the displayed value is inherited */
  isInherited: boolean;
  /** Save function to update the field */
  save: (newValue: string) => Promise<void>;
  /** Whether save is in progress */
  isSaving: boolean;
  /** Error from last save, if any */
  error: Error | null;
  /** Clear the error state */
  clearError: () => void;
}

/**
 * Hook for managing field editing with inheritance support
 *
 * Handles the logic for determining if a value is inherited and
 * provides a save function that creates component-level overrides.
 *
 * @param options - Configuration options
 * @returns Object containing value, inheritance status, and save function
 *
 * @example
 * function ComponentNameField({ project, component }) {
 *   const { value, isInherited, save } = useFieldEdit({
 *     projectId: project.id,
 *     componentId: component.id,
 *     field: "name",
 *     currentValue: component.name,
 *     inheritedValue: project.name,
 *   });
 *
 *   return (
 *     <EditableText
 *       value={value}
 *       isInherited={isInherited}
 *       inheritedFrom={`Project ${project.number}`}
 *       onSave={save}
 *     />
 *   );
 * }
 */
export function useFieldEdit({
  projectId,
  componentId,
  field,
  currentValue,
  inheritedValue,
  onCreateOverride,
}: UseFieldEditOptions): UseFieldEditReturn {
  const { updateComponentField, isUpdating, error, clearError } =
    useProjectMutations();

  // Determine if value is inherited
  const isInherited = useMemo(() => {
    return !currentValue && !!inheritedValue;
  }, [currentValue, inheritedValue]);

  // Get display value (component value or inherited)
  const value = useMemo(() => {
    return currentValue || inheritedValue || "";
  }, [currentValue, inheritedValue]);

  // Save function
  const save = useCallback(
    async (newValue: string) => {
      // Always save to component (creates override if was inherited)
      await updateComponentField(
        projectId,
        componentId,
        field as any,
        newValue || undefined // Convert empty string to undefined
      );

      // Notify if we created an override
      if (isInherited && onCreateOverride) {
        onCreateOverride();
      }
    },
    [
      projectId,
      componentId,
      field,
      updateComponentField,
      isInherited,
      onCreateOverride,
    ]
  );

  return {
    value,
    isInherited,
    save,
    isSaving: isUpdating,
    error,
    clearError,
  };
}
