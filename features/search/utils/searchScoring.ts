import { ProjectCardView } from "@/core/types";

/**
 * Constants for search scoring algorithm
 *
 * Higher scores indicate better matches. The scoring system prioritizes
 * exact matches over partial matches for better user experience.
 */
export const SEARCH_SCORING_CONSTANTS = {
  /** Scoring system - higher scores = better matches */
  EXACT_MATCH_SCORE: 100, // Exact project name match (highest priority)
  STARTS_WITH_SCORE: 50, // Project name starts with query
  NAME_CONTAINS_SCORE: 30, // Project name contains query anywhere
  DESCRIPTION_SCORE: 20, // Project description contains query
  LOCATION_SCORE: 10, // Project location contains query (lowest priority)
} as const;

/**
 * Pure utility functions for calculating search relevance scores
 *
 * These functions are side-effect free and can be easily unit tested.
 * Each function calculates a score for a specific aspect of matching.
 */

/**
 * Calculates score for name-based matching
 *
 * @param query - Search query (should be lowercase)
 * @param name - Project name to match against
 * @returns Score based on match quality (0 if no match)
 *
 * @example
 * ```typescript
 * calculateNameScore("kitchen", "Kitchen Renovation") // 50 (starts with)
 * calculateNameScore("kitchen", "kitchen") // 100 (exact match)
 * calculateNameScore("kitchen", "Modern Kitchen") // 30 (contains)
 * ```
 */
export function calculateNameScore(query: string, name: string): number {
  const lowerName = name.toLowerCase();

  if (lowerName === query) {
    return SEARCH_SCORING_CONSTANTS.EXACT_MATCH_SCORE;
  }

  if (lowerName.startsWith(query)) {
    return SEARCH_SCORING_CONSTANTS.STARTS_WITH_SCORE;
  }

  if (lowerName.includes(query)) {
    return SEARCH_SCORING_CONSTANTS.NAME_CONTAINS_SCORE;
  }

  return 0; // No match
}

/**
 * Calculates score for description-based matching
 *
 * @param query - Search query (should be lowercase)
 * @param description - Project description to match against
 * @returns Score if description contains query, 0 otherwise
 *
 * @example
 * ```typescript
 * calculateDescriptionScore("modern", "Modern kitchen renovation") // 20
 * calculateDescriptionScore("modern", "Traditional design") // 0
 * ```
 */
export function calculateDescriptionScore(
  query: string,
  description?: string
): number {
  if (!description) {
    return 0;
  }

  return description.toLowerCase().includes(query)
    ? SEARCH_SCORING_CONSTANTS.DESCRIPTION_SCORE
    : 0;
}

/**
 * Calculates score for location-based matching
 *
 * @param query - Search query (should be lowercase)
 * @param location - Project location object to match against
 * @returns Score if location contains query, 0 otherwise
 *
 * @example
 * ```typescript
 * calculateLocationScore("90210", { neighborhood: "Beverly Hills", zipCode: "90210" }) // 10
 * calculateLocationScore("beverly", { neighborhood: "Beverly Hills", zipCode: "90210" }) // 10
 * ```
 */
export function calculateLocationScore(
  query: string,
  location?: { neighborhood?: string; zipCode?: string }
): number {
  if (!location) {
    return 0;
  }

  const neighborhoodMatch = location.neighborhood
    ?.toLowerCase()
    .includes(query);
  const zipCodeMatch = location.zipCode?.includes(query);

  return neighborhoodMatch || zipCodeMatch
    ? SEARCH_SCORING_CONSTANTS.LOCATION_SCORE
    : 0;
}

/**
 * Calculates total relevance score for a card view against a search query
 *
 * Combines all scoring aspects to determine overall relevance.
 * Returns the highest score found (doesn't sum multiple matches).
 *
 * @param query - Search query (should be lowercase)
 * @param cardView - Project card view to score
 * @returns Total relevance score (0 if no matches)
 *
 * @example
 * ```typescript
 * const score = calculateCardViewScore("kitchen", {
 *   displayName: "Kitchen Renovation",
 *   summary: "Modern kitchen design",
 *   location: { neighborhood: "Downtown", zipCode: "12345" }
 * });
 * // Returns 50 (name starts with "kitchen")
 * ```
 */
export function calculateCardViewScore(
  query: string,
  cardView: ProjectCardView
): number {
  const nameScore = calculateNameScore(query, cardView.displayName);
  const descriptionScore = calculateDescriptionScore(query, cardView.summary);
  const locationScore = calculateLocationScore(
    query,
    cardView.location || undefined
  );

  // Return the highest score (don't sum multiple matches)
  return Math.max(nameScore, descriptionScore, locationScore);
}
