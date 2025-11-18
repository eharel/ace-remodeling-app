import { ComponentCategory, ComponentSubcategory } from "./ComponentCategory";
import { Document } from "./Document";
import { Log } from "./Log";
import { MediaAsset } from "./MediaAsset";

/**
 * ProjectComponent represents a single aspect/phase of a project
 *
 * Examples: bathroom remodel, kitchen renovation, home theater installation
 *
 * INHERITANCE PATTERN:
 * Components can override project-level fields with more specific values.
 * All display override fields are optional - if not provided, the parent
 * project's values are used as defaults. This enables flexible data entry
 * while maintaining consistent fallback behavior.
 *
 * CONTENT OWNERSHIP:
 * Each component owns its media, documents, and logs. These are never
 * inherited from the project level (though projects can have shared resources).
 */
export interface ProjectComponent {
  /**
   * IDENTITY - Required fields
   */

  /** Unique component identifier (e.g., '187-bathroom') */
  id: string;

  /** Component category - can be core category or custom string */
  category: ComponentCategory;

  /** Optional subcategory (only used for adu-addition) */
  subcategory?: ComponentSubcategory;

  /**
   * DISPLAY OVERRIDES - Optional overrides of project-level values
   */

  /**
   * Component-specific name (e.g., 'Spa-Inspired Master Bath').
   * Falls back to project name if not provided.
   */
  name?: string;

  /**
   * Short description for card displays.
   * Falls back to project summary if not provided.
   */
  summary?: string;

  /**
   * Full description for component detail view.
   * Falls back to project description if not provided.
   */
  description?: string;

  /**
   * Work scope specific to this component.
   * Falls back to project scope if not provided.
   */
  scope?: string;

  /**
   * Component-specific hero image URL.
   * Falls back to project thumbnail if not provided.
   */
  thumbnail?: string;

  /**
   * CONTENT - Always component-specific
   */

  /** Images and videos for this component (required, can be empty array) */
  media: MediaAsset[];

  /** Component-specific documents (contracts, permits, etc.) */
  documents?: Document[];

  /** Component-specific activity logs and updates */
  logs?: Log[];

  /**
   * TIMELINE - Optional override if different from project timeline
   */

  /**
   * Component-specific timeline. If not provided, inherits from project timeline.
   * Includes optional duration string for display when precise dates unavailable.
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
   * METADATA - Optional overrides and additions
   */

  /** Component-specific tags (merged with project tags, not replaced) */
  tags?: string[];

  /** Whether this specific component is featured in its category browse view */
  isFeatured?: boolean;

  /**
   * FLEXIBILITY - For non-standard component properties
   */

  /** Custom fields for non-standard components with unique properties */
  customFields?: Record<string, unknown>;

  /**
   * TIMESTAMPS - Tracking metadata
   */

  /** ISO format timestamp of component creation */
  createdAt: string;

  /** ISO format timestamp of last component update */
  updatedAt: string;
}

