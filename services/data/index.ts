/**
 * Data Service Layer
 *
 * Provides a clean API for Firestore operations on Projects and Components.
 * This layer abstracts the read-modify-write pattern required by Firestore's
 * nested array limitations, allowing UI components to work with nested data
 * without knowing about these implementation details.
 */

export * from "./mediaService";
export * from "./projectService";
