/**
 * Project status constants for type safety and consistency
 */
export const PROJECT_STATUSES = {
  PLANNING: "planning",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  ON_HOLD: "on-hold",
} as const;

/**
 * Type-safe project status type
 */
export type ProjectStatus =
  (typeof PROJECT_STATUSES)[keyof typeof PROJECT_STATUSES];

/**
 * Status style mapping for consistent UI styling
 */
export const STATUS_STYLE_MAP = {
  [PROJECT_STATUSES.PLANNING]: "status_planning",
  [PROJECT_STATUSES.IN_PROGRESS]: "status_in_progress",
  [PROJECT_STATUSES.COMPLETED]: "status_completed",
  [PROJECT_STATUSES.ON_HOLD]: "status_on_hold",
} as const;

/**
 * Type for status style keys
 */
export type StatusStyleKey = (typeof STATUS_STYLE_MAP)[ProjectStatus];

/**
 * Helper function to get status style key for consistent UI styling
 * @param status - The project status
 * @returns The corresponding style key
 */
export function getStatusStyleKey(status: ProjectStatus): StatusStyleKey {
  return STATUS_STYLE_MAP[status];
}

/**
 * Helper function to get display text for status
 * Converts kebab-case to title case for user display
 * @param status - The project status
 * @returns Formatted display text
 */
export function getStatusDisplayText(status: ProjectStatus): string {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Type guard to check if a string is a valid ProjectStatus
 */
export function isValidProjectStatus(status: string): status is ProjectStatus {
  return status in PROJECT_STATUSES;
}
