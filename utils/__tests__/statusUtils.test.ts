// This file demonstrates how TypeScript catches status-related errors at compile time

import { ProjectStatus } from "@/types/Status";
import {
  getStatusDisplayText,
  getStatusStyleKey,
  isValidProjectStatus,
} from "../statusUtils";

// ✅ This works - TypeScript knows these are valid
const validStatus: ProjectStatus = "in-progress";
const styleKey = getStatusStyleKey(validStatus); // "status_in_progress"
const displayText = getStatusDisplayText(validStatus); // "IN PROGRESS"

// ❌ This would cause a TypeScript error at compile time:
// const invalidStatus: ProjectStatus = "invalid-status"; // Error: Type '"invalid-status"' is not assignable to type 'ProjectStatus'

// ❌ This would also cause a TypeScript error:
// const wrongStyleKey = getStatusStyleKey("completed"); // This works, but if you typo:
// const wrongStyleKey = getStatusStyleKey("completd"); // Error: Argument of type '"completd"' is not assignable to parameter of type 'ProjectStatus'

// ✅ Type guard for runtime safety
function handleStatus(status: string) {
  if (isValidProjectStatus(status)) {
    // TypeScript now knows status is ProjectStatus
    const styleKey = getStatusStyleKey(status); // ✅ Works
    const displayText = getStatusDisplayText(status); // ✅ Works
    return { styleKey, displayText };
  }
  throw new Error(`Invalid status: ${status}`);
}

export { displayText, handleStatus, styleKey, validStatus };
