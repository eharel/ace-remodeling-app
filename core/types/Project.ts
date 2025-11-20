import { ComponentCategory } from "./ComponentCategory";
import { Document } from "./Document";
import { Log } from "./Log";
import { MediaAsset } from "./MediaAsset";
import { ProjectComponent } from "./ProjectComponent";
import { ProjectManager } from "./ProjectManager";
import { ProjectStatus } from "./Status";

/**
 * Project represents a complete remodeling project that contains multiple components
 *
 * PROJECT STRUCTURE:
 * A project is the top-level entity (identified by number like "187").
 * It contains one or more components representing different aspects (bathroom, kitchen, etc.).
 *
 * FALLBACK PATTERN:
 * Project-level fields (summary, description, scope, etc.) provide defaults that
 * components inherit at runtime unless they specify their own values. This is
 * implemented in utility functions, not through TypeScript inheritance.
 *
 * SHARED RESOURCES:
 * Some resources (testimonials, shared documents/media/logs) are project-wide
 * and available to all components.
 *
 * TIMELINE FLEXIBILITY:
 * Timeline supports both precise dates (start/end) when available from JobTread,
 * and display strings (duration) when only rough estimates exist.
 */
export interface Project {
  /**
   * IDENTITY
   */

  /** Unique project identifier */
  id: string;

  /** ACE project tracking number (e.g., "187", "311B") */
  number: string;

  /** Project name - descriptive, design-focused */
  name: string;

  /**
   * DISPLAY DEFAULTS
   */

  /** Default short description (inherited by components unless overridden) */
  summary: string;

  /** Default full description (inherited by components unless overridden) */
  description: string;

  /** Default work scope (inherited by components unless overridden) */
  scope: string;

  /** Default project image (inherited by components unless overridden) */
  thumbnail: string;

  /**
   * LOCATION
   */

  /**
   * Project location. All fields optional - fill what's available.
   * street not displayed publicly.
   */
  location?: {
    /** Street address (not displayed publicly) */
    street?: string;
    /** Zip code for public display */
    zipCode?: string;
    /** Neighborhood for public display */
    neighborhood?: string;
    /** City name */
    city?: string;
    /** State abbreviation or full name */
    state?: string;
  };

  /**
   * TIMELINE
   */

  /**
   * Project timeline. Supports precise dates (start/end) or display string (duration).
   * Inherited by components unless overridden.
   */
  timeline?: {
    /** Start date in ISO format */
    start?: string;
    /** End date in ISO format */
    end?: string;
    /** Duration string for display (e.g., "3 months") */
    duration?: string;
  };

  /**
   * PROJECT TEAM
   */

  /** Project managers assigned to this project */
  projectManagers?: ProjectManager[];

  /**
   * CLIENT FEEDBACK
   */

  /**
   * Client testimonial (always project-level, available to all components)
   */
  testimonial?: {
    /** Testimonial text */
    text: string;
    /** Author name (first name or initials) */
    author: string;
    /** Date in ISO format */
    date: string;
  };

  /**
   * COMPONENTS
   */

  /**
   * All aspects/components of this project (bathroom, kitchen, etc.).
   * Required - every project has at least one component.
   */
  components: ProjectComponent[];

  /**
   * SHARED RESOURCES - Available to all components
   */

  /** Project-wide assets available to all components (contracts, permits, shared plans) */
  sharedDocuments?: Document[];

  /** Project-wide media not specific to one component (site photos, drone footage) */
  sharedMedia?: MediaAsset[];

  /** Project-wide activity logs and updates */
  sharedLogs?: Log[];

  /**
   * METADATA
   */

  /** Current project status */
  status: ProjectStatus;

  /**
   * Project-wide tags (inherited by all components, merged with component tags)
   */
  tags?: string[];

  /**
   * Whether entire project is featured (separate from component.isFeatured)
   */
  isFeatured?: boolean;

  /**
   * TIMESTAMPS
   */

  /** ISO format timestamp of project creation */
  createdAt: string;

  /** ISO format timestamp of last project update */
  updatedAt: string;
}

/**
 * Lightweight project summary for lists and cards
 *
 * Used for displaying projects in galleries, search results, and category pages.
 * Contains only the essential fields needed for preview display.
 */
export interface ProjectSummary {
  id: string;
  projectNumber: string;
  name: string;
  briefDescription?: string;
  thumbnail: string;
  status: ProjectStatus | string; // Allow string for flexibility
  category: ComponentCategory | string; // Allow string for flexibility
  completedAt?: string;
  location?: {
    neighborhood?: string;
    zipCode?: string;
  };
}
