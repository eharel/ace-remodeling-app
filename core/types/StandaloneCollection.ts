import { Document } from "./Document";
import { MediaAsset } from "./MediaAsset";

/**
 * Collection types for non-project content
 */
export const COLLECTION_TYPES = {
  STANDALONE: "standalone",
  MANAGEMENT_TOOLS: "management-tools",
} as const;

/**
 * Type-safe collection type
 */
export type CollectionType =
  (typeof COLLECTION_TYPES)[keyof typeof COLLECTION_TYPES];

/**
 * StandaloneCollection represents content that isn't tied to a specific project
 *
 * Examples:
 * - Outdoor installations portfolio (pavers, BBQ, turf, etc.)
 * - Management tool examples (logs, plans, processes)
 * - Marketing materials or general company assets
 *
 * Collections are organized into subcategories for better organization.
 * Unlike projects, collections don't have timelines, PMs, or testimonials.
 */
export interface StandaloneCollection {
  /** Unique collection identifier */
  id: string;

  /** Collection type (standalone or management-tools) */
  type: CollectionType;

  /** Collection category (e.g., 'outdoor', 'management-tools') */
  category: string;

  /** Display name (e.g., 'Outdoor Installations', 'Management Tools') */
  name: string;

  /** Optional description of the collection */
  description?: string;

  /** Organized subdivisions of this collection (required, can be empty array) */
  subcategories: CollectionSubcategory[];

  /** ISO format timestamp of collection creation */
  createdAt: string;

  /** ISO format timestamp of last collection update */
  updatedAt: string;
}

/**
 * CollectionSubcategory represents a subdivision of a collection
 *
 * Examples:
 * - "Pavers" under "Outdoor"
 * - "BBQ Installations" under "Outdoor"
 * - "Project Logs" under "Management Tools"
 *
 * Each subcategory has its own media and optional documents.
 */
export interface CollectionSubcategory {
  /** Unique subcategory identifier */
  id: string;

  /** Display name (e.g., 'Pavers', 'BBQ Installations') */
  name: string;

  /** Optional description of the subcategory */
  description?: string;

  /** Optional hero image for the subcategory */
  thumbnail?: string;

  /** Images and videos for this subcategory (required, can be empty array) */
  media: MediaAsset[];

  /** Optional documents related to this subcategory */
  documents?: Document[];

  /** Display order within parent collection */
  order: number;

  /** Optional tags for filtering and search */
  tags?: string[];
}
