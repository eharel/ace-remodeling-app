// Define all possible project statuses
export const PROJECT_STATUSES = {
  PLANNING: "planning",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  ON_HOLD: "on-hold",
} as const;

// Type-safe status type
export type ProjectStatus =
  (typeof PROJECT_STATUSES)[keyof typeof PROJECT_STATUSES];

// Type-safe status style mapping
export const STATUS_STYLE_MAP = {
  [PROJECT_STATUSES.PLANNING]: "status_planning",
  [PROJECT_STATUSES.IN_PROGRESS]: "status_in_progress",
  [PROJECT_STATUSES.COMPLETED]: "status_completed",
  [PROJECT_STATUSES.ON_HOLD]: "status_on_hold",
} as const;

// Type for status style keys
export type StatusStyleKey = (typeof STATUS_STYLE_MAP)[ProjectStatus];

// Helper function to get status style key
export function getStatusStyleKey(status: ProjectStatus): StatusStyleKey {
  return STATUS_STYLE_MAP[status];
}

// Helper function to get display text for status
export function getStatusDisplayText(status: ProjectStatus): string {
  return status.replace("-", " ").toUpperCase();
}
