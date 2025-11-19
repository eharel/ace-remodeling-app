import {
  ComponentCategory,
  CORE_CATEGORIES,
  getCategoryLabel,
  isCoreCategory,
} from "./ComponentCategory";
import { Document } from "./Document";
import { Log } from "./Log";
import { MediaAsset } from "./MediaAsset";
import { Project } from "./Project";
import { ProjectComponent } from "./ProjectComponent";
import { ProjectManager } from "./ProjectManager";
import { ProjectStatus } from "./Status";

/**
 * Fully-resolved component display data with all fallbacks applied
 *
 * This interface represents a component's data as it should be displayed in the UI,
 * with all optional fields resolved through the fallback pattern:
 * - Component overrides are used when present
 * - Project defaults are used when component fields are undefined
 * - Shared resources are merged with component-specific resources
 *
 * UI components should consume this interface rather than raw Project/ProjectComponent
 * to ensure consistent fallback behavior.
 */
export interface ComponentDisplayData {
  /**
   * IDENTITY
   */

  /** Parent project ID */
  projectId: string;

  /** Parent project number (e.g., '187') */
  number: string;

  /** Component ID (e.g., '187-bathroom') */
  componentId: string;

  /** Component category (core or custom) */
  category: ComponentCategory;

  /**
   * RESOLVED DISPLAY VALUES
   */

  /** Resolved name (component.name ?? project.name + category label) */
  name: string;

  /** Resolved summary (component.summary ?? project.summary) */
  summary: string;

  /** Resolved description (component.description ?? project.description) */
  description: string;

  /** Resolved scope (component.scope ?? project.scope) */
  scope: string;

  /** Resolved thumbnail URL (component.thumbnail ?? project.thumbnail) */
  thumbnail: string;

  /**
   * CATEGORY INFO
   */

  /** Human-readable category label */
  categoryLabel: string;

  /** Whether category is a core navigation category */
  isCoreCategory: boolean;

  /**
   * TIMELINE
   */

  /** Resolved timeline (component.timeline ?? project.timeline) */
  timeline: {
    /** Start date in ISO format */
    start?: string;
    /** End date in ISO format */
    end?: string;
    /** Duration string for display (e.g., "3 months") */
    duration?: string;
  };

  /**
   * LOCATION
   */

  /** Project location (always from project, never component-specific) */
  location?: Project["location"];

  /**
   * TEAM
   */

  /** Project managers (always from project) */
  projectManagers: ProjectManager[];

  /**
   * MERGED CONTENT
   */

  /** Merged media (project.sharedMedia + component.media) */
  media: MediaAsset[];

  /** Merged documents (project.sharedDocuments + component.documents) */
  documents: Document[];

  /** Merged logs (project.sharedLogs + component.logs) */
  logs: Log[];

  /** Merged tags (project.tags + component.tags, deduplicated) */
  tags: string[];

  /**
   * METADATA
   */

  /** Resolved featured status (component.isFeatured ?? project.isFeatured ?? false) */
  isFeatured: boolean;

  /** Project status (always from project) */
  status: ProjectStatus;

  /** Client testimonial (always from project) */
  testimonial?: Project["testimonial"];

  /**
   * CONTEXT
   */

  /** Whether parent project has multiple components */
  isMultiComponent: boolean;

  /** Other components in the same project (for navigation) */
  siblingComponents: {
    id: string;
    category: ComponentCategory;
    name: string;
  }[];
}

/**
 * Get fully-resolved display data for a component with fallbacks applied
 *
 * This is the PRIMARY utility for displaying component information in the UI.
 * It implements the fallback pattern by:
 * 1. Using component values when present (overrides)
 * 2. Falling back to project values when component values are undefined
 * 3. Merging shared resources with component-specific resources
 * 4. Computing derived values (categoryLabel, isMultiComponent, etc.)
 *
 * USAGE:
 * Instead of accessing project/component fields directly, UI components should
 * call this function and use the returned ComponentDisplayData for consistent
 * fallback behavior.
 *
 * @param project - The parent project
 * @param component - The component to resolve
 * @returns Fully-resolved component display data
 */
export function getComponentDisplayData(
  project: Project,
  component: ProjectComponent
): ComponentDisplayData {
  const categoryLabel = getCategoryLabel(component.category);

  return {
    // Identity
    projectId: project.id,
    number: project.number,
    componentId: component.id,
    category: component.category,

    // Resolved display values
    name: component.name ?? `${project.name} - ${categoryLabel}`,
    summary: component.summary ?? project.summary,
    description: component.description ?? project.description,
    scope: component.scope ?? project.scope,
    thumbnail: component.thumbnail ?? project.thumbnail,

    // Category info
    categoryLabel,
    isCoreCategory: isCoreCategory(component.category),

    // Timeline
    timeline: component.timeline ?? project.timeline ?? {},

    // Location (always from project)
    location: project.location,

    // Team (always from project)
    projectManagers: project.projectManagers ?? [],

    // Merged content
    media: [...(project.sharedMedia ?? []), ...component.media],
    documents: [
      ...(project.sharedDocuments ?? []),
      ...(component.documents ?? []),
    ],
    logs: [...(project.sharedLogs ?? []), ...(component.logs ?? [])],
    tags: Array.from(
      new Set([...(project.tags ?? []), ...(component.tags ?? [])])
    ),

    // Metadata
    isFeatured: component.isFeatured ?? project.isFeatured ?? false,
    status: project.status,
    testimonial: project.testimonial,

    // Context
    isMultiComponent: project.components.length > 1,
    siblingComponents: project.components
      .filter((c) => c.id !== component.id)
      .map((c) => ({
        id: c.id,
        category: c.category,
        name: c.name ?? getCategoryLabel(c.category),
      })),
  };
}

/**
 * Get all components for a specific category across all projects
 *
 * Useful for category browsing screens (e.g., "All Bathrooms").
 * Returns tuples of {project, component} so you have full context.
 *
 * @param projects - All projects to search
 * @param category - Category to filter by (core or custom)
 * @returns Array of {project, component} tuples
 */
export function getComponentsByCategory(
  projects: Project[],
  category: ComponentCategory
): { project: Project; component: ProjectComponent }[] {
  return projects.flatMap((project) =>
    project.components
      .filter((component) => component.category === category)
      .map((component) => ({ project, component }))
  );
}

/**
 * Get all unique categories used across all projects
 *
 * Includes both core and custom categories. Useful for dynamically
 * generating navigation or discovering what custom categories exist.
 *
 * @param projects - All projects to scan
 * @returns Array of unique category strings (sorted: core first, then custom alphabetically)
 */
export function getAllUsedCategories(projects: Project[]): ComponentCategory[] {
  const categoriesSet = new Set<ComponentCategory>();

  // Collect all unique categories
  projects.forEach((project) => {
    project.components.forEach((component) => {
      categoriesSet.add(component.category);
    });
  });

  // Convert to array and sort
  const categories = Array.from(categoriesSet);
  const coreValues = Object.values(CORE_CATEGORIES);

  return categories.sort((a, b) => {
    const aIsCore = coreValues.includes(a as (typeof coreValues)[number]);
    const bIsCore = coreValues.includes(b as (typeof coreValues)[number]);

    // Core categories first
    if (aIsCore && !bIsCore) return -1;
    if (!aIsCore && bIsCore) return 1;

    // Within core categories, maintain CORE_CATEGORIES order
    if (aIsCore && bIsCore) {
      return (
        coreValues.indexOf(a as (typeof coreValues)[number]) -
        coreValues.indexOf(b as (typeof coreValues)[number])
      );
    }

    // Custom categories alphabetically
    return a.localeCompare(b);
  });
}

/**
 * Check if a project has multiple components
 *
 * @param project - The project to check
 * @returns True if project has more than one component
 */
export function isMultiComponentProject(project: Project): boolean {
  return project.components.length > 1;
}

/**
 * Get project completion date from timeline (end date)
 *
 * @param project - The project to get completion date from
 * @returns ISO date string of completion, or undefined if not available
 */
export function getProjectCompletionDate(project: Project): string | undefined {
  return project.timeline?.end;
}

/**
 * Get component completion date (component.timeline.end ?? project.timeline.end)
 *
 * @param project - The parent project
 * @param component - The component to get completion date from
 * @returns ISO date string of completion, or undefined if not available
 */
export function getComponentCompletionDate(
  project: Project,
  component: ProjectComponent
): string | undefined {
  return component.timeline?.end ?? project.timeline?.end;
}

/**
 * Get project manager names from a project
 *
 * @param project - The project to extract PM names from
 * @returns Array of PM names, or empty array if none
 */
export function getProjectPMNames(project: Project): string[] {
  return project.projectManagers?.map((pm) => pm.name) ?? [];
}

/**
 * Check if project status is completed
 *
 * @param project - The project to check
 * @returns True if project status is "completed"
 */
export function isProjectCompleted(project: Project): boolean {
  return project.status === "completed";
}

/**
 * Get display-friendly duration string from timeline
 *
 * Prefers computed duration from precise dates if available,
 * otherwise returns the manual duration string.
 *
 * @param timeline - Timeline object (from project or component)
 * @returns Duration string for display, or undefined if no timeline
 */
export function getDisplayDuration(timeline?: {
  start?: string;
  end?: string;
  duration?: string;
}): string | undefined {
  if (!timeline) {
    return undefined;
  }

  // If we have both start and end dates, compute duration
  if (timeline.start && timeline.end) {
    const start = new Date(timeline.start);
    const end = new Date(timeline.end);
    const days = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30); // Approximate

    if (months >= 2) {
      return `${months} months`;
    } else if (weeks >= 2) {
      return `${weeks} weeks`;
    } else {
      return `${days} days`;
    }
  }

  // Otherwise return the manual duration string if available
  return timeline.duration;
}
