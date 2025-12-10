import { ComponentCategory } from "./ComponentCategory";
import { Project } from "./Project";
import { ProjectComponent } from "./ProjectComponent";
import { ProjectStatus } from "./Status";
import { getProjectThumbnail, getProjectCompletionDate } from "./ProjectUtils";

/**
 * ProjectCardView - Centralized DTO for project card displays
 *
 * This interface provides a consistent, normalized view of project data
 * for use in card components across the application. It replaces scattered
 * ProjectSummary manual mappings with a single source of truth.
 *
 * KEY DIFFERENCES FROM ProjectSummary:
 * - Uses consistent field naming (displayName, summary, thumbnailUrl)
 * - Includes projectId and componentId for navigation
 * - Includes isMultiComponent and componentCount for UI hints
 * - Always represents a single project-component pair
 */
export interface ProjectCardView {
  /** Project identifier for navigation */
  projectId: string;

  /** Component identifier for navigation */
  componentId: string;

  /** Display name (component.name ?? project.name) */
  displayName: string;

  /** Short description for card display (component.summary ?? project.summary) */
  summary?: string;

  /** Thumbnail image URL with fallback logic applied */
  thumbnailUrl: string;

  /** Project status */
  status: ProjectStatus | string;

  /** Component category */
  category: ComponentCategory | string;

  /** Optional subcategory (e.g., "pool", "deck" for outdoor-living) */
  subcategory?: string;

  /** Whether this project/component is featured */
  isFeatured?: boolean;

  /** Completion date (ISO format) */
  completedAt?: string;

  /** Location information */
  location?: {
    neighborhood?: string;
    zipCode?: string;
  };

  /** Whether the project has multiple components */
  isMultiComponent: boolean;

  /** Total number of components in the project */
  componentCount: number;
}

/**
 * Transform a project and component pair into a ProjectCardView DTO
 *
 * This function implements the fallback pattern:
 * - Component-specific values are used when available
 * - Project-level defaults are used when component values are undefined
 * - Thumbnail resolution uses getProjectThumbnail utility
 *
 * @param project - The parent project
 * @param component - The component to display
 * @returns ProjectCardView DTO ready for card display
 */
export function toProjectCardView(
  project: Project,
  component: ProjectComponent
): ProjectCardView {
  const isMultiComponent = project.components.length > 1;

  return {
    projectId: project.id,
    componentId: component.id,
    displayName: component.name ?? project.name,
    summary: component.summary ?? project.summary,
    thumbnailUrl: getProjectThumbnail(project, component),
    status: project.status,
    category: component.category,
    subcategory: component.subcategory,
    isFeatured: component.isFeatured ?? project.isFeatured,
    completedAt: getProjectCompletionDate(project),
    location: project.location
      ? {
          neighborhood: project.location.neighborhood,
          zipCode: project.location.zipCode,
        }
      : undefined,
    isMultiComponent,
    componentCount: project.components.length,
  };
}

/**
 * Transform projects filtered by category into ProjectCardView array
 *
 * Filters projects to only those containing at least one component matching
 * the specified category, then transforms each matching project-component pair
 * into a ProjectCardView.
 *
 * @param projects - Array of projects to filter and transform
 * @param category - Category to filter by
 * @returns Array of ProjectCardView DTOs for matching components
 */
export function toProjectCardViewsByCategory(
  projects: Project[],
  category: ComponentCategory
): ProjectCardView[] {
  const results: ProjectCardView[] = [];

  for (const project of projects) {
    // Find all components matching the category
    const matchingComponents = project.components.filter(
      (c) => c.category === category
    );

    // Transform each matching component
    for (const component of matchingComponents) {
      results.push(toProjectCardView(project, component));
    }
  }

  return results;
}

