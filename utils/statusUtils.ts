import { ProjectStatus } from "@/types/Status";

// Type-safe status configuration
export const STATUS_CONFIG = {
  planning: {
    styleKey: "status_planning" as const,
    displayText: "PLANNING",
    colorKey: "status.infoLight" as const,
  },
  "in-progress": {
    styleKey: "status_in_progress" as const,
    displayText: "IN PROGRESS",
    colorKey: "status.warningLight" as const,
  },
  completed: {
    styleKey: "status_completed" as const,
    displayText: "COMPLETED",
    colorKey: "status.successLight" as const,
  },
  "on-hold": {
    styleKey: "status_on_hold" as const,
    displayText: "ON HOLD",
    colorKey: "status.errorLight" as const,
  },
} as const;

// Type-safe getter functions
export function getStatusConfig(status: ProjectStatus) {
  return STATUS_CONFIG[status];
}

export function getStatusStyleKey(status: ProjectStatus) {
  return STATUS_CONFIG[status].styleKey;
}

export function getStatusDisplayText(status: ProjectStatus) {
  return STATUS_CONFIG[status].displayText;
}

export function getStatusColorKey(status: ProjectStatus) {
  return STATUS_CONFIG[status].colorKey;
}

// Type guard to ensure status is valid
export function isValidProjectStatus(status: string): status is ProjectStatus {
  return status in STATUS_CONFIG;
}
