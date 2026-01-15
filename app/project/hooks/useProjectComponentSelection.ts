import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_DISPLAY_ORDER } from "@/shared/utils";
import { CoreCategory } from "@/shared/types/ComponentCategory";
import type { Project, ProjectComponent } from "@/shared/types";

/**
 * Hook for managing project component selection based on URL params and project data
 * Handles initial component selection, URL param syncing, and component sorting
 */
export function useProjectComponentSelection(
  projectId: string | undefined,
  componentIdParam: string | undefined,
  projects: Project[]
) {
  const [project, setProject] = useState<Project | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    null
  );
  // Track current selection to preserve it across project updates
  const currentSelectionRef = useRef<string | null>(null);
  // Track previous componentIdParam to only act when it actually changes
  const previousComponentIdParamRef = useRef<string | undefined>(undefined);

  // Initialize project and set initial component selection
  // Only runs when id, componentId param, or projects change - NOT when selectedComponentId changes
  useEffect(() => {
    const componentIdParamChanged = componentIdParam !== previousComponentIdParamRef.current;
    previousComponentIdParamRef.current = componentIdParam;

    if (projectId) {
      const foundProject = projects.find((p) => p.id === projectId);
      setProject(foundProject || null);

      // Set selected component: use componentId param if provided AND it changed, otherwise preserve current or default to first
      // Only set on initial load or when project/componentId param changes
      if (foundProject && foundProject.components.length > 0) {
        // Sort components by category display order to get consistent first component
        const sorted = [...foundProject.components].sort((a, b) => {
          const orderA = CATEGORY_DISPLAY_ORDER.indexOf(
            a.category as CoreCategory
          );
          const orderB = CATEGORY_DISPLAY_ORDER.indexOf(
            b.category as CoreCategory
          );
          if (orderA === -1 && orderB === -1) return 0;
          if (orderA === -1) return 1;
          if (orderB === -1) return -1;
          return orderA - orderB;
        });

        // If componentId param is provided AND it changed, use it
        // Otherwise preserve current selection when projects array updates
        if (componentIdParam && componentIdParamChanged) {
          const matchingComponent = foundProject.components.find(
            (c) => c.id === componentIdParam
          );
          if (matchingComponent) {
            setSelectedComponentId(componentIdParam);
            currentSelectionRef.current = componentIdParam;
          } else {
            // componentId doesn't match, fall back to first component from sorted order
            const firstComponentId = sorted[0].id;
            setSelectedComponentId(firstComponentId);
            currentSelectionRef.current = firstComponentId;
          }
        } else {
          // No componentId param OR param hasn't changed - preserve current selection if it still exists, otherwise default to first
          // This preserves the selected component when project data updates (e.g., after editing)
          const currentSelection = currentSelectionRef.current || selectedComponentId;
          if (currentSelection) {
            const currentComponentStillExists = foundProject.components.some(
              (c) => c.id === currentSelection
            );
            if (currentComponentStillExists) {
              // Keep the current selection - don't reset
              setSelectedComponentId(currentSelection);
              return;
            }
          }
          // No valid selection - set to first component from sorted order
          const firstComponentId = sorted[0].id;
          setSelectedComponentId(firstComponentId);
          currentSelectionRef.current = firstComponentId;
        }
      }
    }
  }, [projectId, componentIdParam, projects]);


  // Update ref when selectedComponentId changes from user interaction
  useEffect(() => {
    if (selectedComponentId) {
      currentSelectionRef.current = selectedComponentId;
    }
  }, [selectedComponentId]);

  /**
   * Current selected component
   * Filters project components to find the one matching selectedComponentId
   */
  const currentComponent = useMemo(() => {
    if (!project || !selectedComponentId) return null;

    return (
      project.components.find((c) => c.id === selectedComponentId) ||
      project.components[0] ||
      null
    );
  }, [project, selectedComponentId]);

  /**
   * Sorted components by category display order
   * Used for ComponentSelector to ensure consistent ordering
   */
  const sortedComponents = useMemo(() => {
    if (!project) return [];
    return [...project.components].sort((a, b) => {
      const orderA = CATEGORY_DISPLAY_ORDER.indexOf(a.category as CoreCategory);
      const orderB = CATEGORY_DISPLAY_ORDER.indexOf(b.category as CoreCategory);
      // If not in order array, put at end
      if (orderA === -1 && orderB === -1) return 0;
      if (orderA === -1) return 1;
      if (orderB === -1) return -1;
      return orderA - orderB;
    });
  }, [project]);

  /**
   * Media for current component + shared media
   * Filters to show only the selected component's media plus project-wide shared media
   */
  const currentMedia = useMemo(() => {
    if (!project) return [];
    const componentMedia = currentComponent?.media || [];
    const sharedMedia = project.sharedMedia || [];
    return [...componentMedia, ...sharedMedia];
  }, [project, currentComponent]);

  /**
   * Documents for current component + shared documents
   * Filters to show only the selected component's documents plus project-wide shared documents
   */
  const currentDocuments = useMemo(() => {
    if (!project) return [];
    const componentDocuments = currentComponent?.documents || [];
    const sharedDocuments = project.sharedDocuments || [];
    return [...componentDocuments, ...sharedDocuments];
  }, [project, currentComponent]);

  return {
    project,
    selectedComponentId,
    setSelectedComponentId,
    currentComponent,
    sortedComponents,
    currentMedia,
    currentDocuments,
  };
}
