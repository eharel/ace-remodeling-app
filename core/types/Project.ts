import { ProjectCategory, ProjectSubcategory } from "./Category";
import { Document } from "./Document";
import { Log } from "./Log";
import { Picture } from "./Picture";
import { ProjectManager } from "./ProjectManager";
import { ProjectStatus } from "./Status";

/**
 * Main project interface representing a complete remodeling project
 * Contains all project data including metadata, media, and tracking information
 */
export interface Project {
  id: string;
  projectNumber: string; // ACE project tracking number (e.g., "217", "311B")
  name: string; // Descriptive design-focused name
  category: ProjectCategory;
  subcategory?: ProjectSubcategory; // Only used for adu-addition category
  briefDescription: string;
  longDescription: string;
  thumbnail: string;

  // Location (public-facing: zip code + neighborhood only)
  location: {
    zipCode: string; // e.g., "78701"
    neighborhood: string; // e.g., "Downtown Austin"
  };

  // Project dates (duration calculated from these)
  projectDates: {
    start: string; // ISO date string: "2024-03-01T00:00:00.000Z"
    end: string; // ISO date string: "2024-05-15T00:00:00.000Z"
  };

  // Scope with design aspects
  scope: string;

  // Client testimonial (optional - will be added as received)
  testimonial?: {
    text: string;
    author: string; // First name or initials
    date: string; // ISO date string format
  };

  // PM information - multiple PMs can work on a project
  pms?: ProjectManager[];

  // Media and documents
  pictures: Picture[];
  documents: Document[];
  logs: Log[];

  // Internal metadata (not shown to public)
  status: ProjectStatus;
  createdAt: string; // ISO date string format
  updatedAt: string; // ISO date string format
  tags?: string[];
  featured?: boolean;
  // REMOVED: completionDate - use projectDates.end instead
}

// Simplified version for list views
export interface ProjectSummary {
  id: string;
  projectNumber: string; // ACE project tracking number
  name: string;
  category: ProjectCategory;
  briefDescription: string;
  thumbnail: string;
  status: ProjectStatus;
  completedAt?: string;
  // REMOVED: pmNames - compute from pms array instead of storing
}

/**
 * Utility functions for Project interfaces
 */

/**
 * Get PM names from a project
 */
export function getProjectPMNames(project: Project): string[] {
  return project.pms?.map((pm) => pm.name) || [];
}

/**
 * Get completion date from project dates
 */
export function getProjectCompletionDate(project: Project): string | undefined {
  return project.projectDates?.end;
}

/**
 * Check if project is completed
 */
export function isProjectCompleted(project: Project): boolean {
  return project.status === "completed";
}
