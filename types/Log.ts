/**
 * Log entry types for better type safety
 */
export const LOG_TYPES = {
  MILESTONE: "milestone",
  UPDATE: "update",
  ISSUE: "issue",
  COMPLETION: "completion",
  NOTE: "note",
} as const;

export type LogType = (typeof LOG_TYPES)[keyof typeof LOG_TYPES];

/**
 * Log entry status types
 */
export const LOG_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  BLOCKED: "blocked",
} as const;

export type LogStatus = (typeof LOG_STATUSES)[keyof typeof LOG_STATUSES];

/**
 * Log entry interface representing project activity and updates
 * Tracks milestones, updates, issues, and other project-related events
 */
export interface Log {
  id: string;
  projectId: string;
  type: LogType; // Type-safe log type
  title: string;
  description: string;
  date: string; // ISO date string format for consistency
  author?: string;
  attachments?: string[]; // URLs to related pictures/documents
  status?: LogStatus; // Type-safe log status
}
