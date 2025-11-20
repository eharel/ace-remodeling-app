/**
 * Picture type for gallery display
 *
 * This is the standardized format expected by ImageGalleryModal.
 * All media assets and documents must be converted to this format
 * before being passed to gallery components.
 *
 * USAGE:
 * - Used by ImageGalleryModal, ImageGalleryCarousel, and related components
 * - Created by convertMediaToPictures() and convertDocumentsToPictures()
 * - Should NEVER be stored in database (only used for UI presentation)
 *
 * DESIGN DECISIONS:
 * - Uses 'uri' instead of 'url' to match expo-image expectations
 * - Uses 'type' as a generic category field (maps from stage/type)
 * - Uses 'description' for display text (maps from caption/name)
 * - This is a PRESENTATION MODEL, not a domain model
 */
export interface Picture {
  /**
   * Image URL - called 'uri' to match expo-image expectations
   * This is the public download URL from Firebase Storage
   */
  uri: string;

  /**
   * Unique identifier from source MediaAsset or Document
   * Used for tracking, caching, and error handling
   */
  id: string;

  /**
   * Image type/category for display and filtering
   * For MediaAsset: maps from stage (before/after/in-progress/other)
   * For Document: maps from type (Floor Plan/Materials/Permit/etc)
   */
  type: string;

  /**
   * Caption/description for display
   * For MediaAsset: uses caption field, falls back to description
   * For Document: uses name field, falls back to filename
   */
  description?: string;

  /**
   * Optional thumbnail URL for preview
   * Used for performance optimization in thumbnail grids
   */
  thumbnailUrl?: string;
}

