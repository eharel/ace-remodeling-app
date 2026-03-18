import { z } from "zod";

export const LOG_TYPES = {
  MILESTONE: "milestone",
  UPDATE: "update",
  ISSUE: "issue",
  COMPLETION: "completion",
  NOTE: "note",
} as const;

export type LogType = (typeof LOG_TYPES)[keyof typeof LOG_TYPES];

const logTypeValues = Object.values(LOG_TYPES);
export const LogTypeSchema = z.enum(logTypeValues as [LogType, ...LogType[]]);

export const LOG_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  BLOCKED: "blocked",
} as const;

export type LogStatus = (typeof LOG_STATUSES)[keyof typeof LOG_STATUSES];

const logStatusValues = Object.values(LOG_STATUSES);
export const LogStatusSchema = z.enum(
  logStatusValues as [LogStatus, ...LogStatus[]]
);

export const LogSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  type: LogTypeSchema,
  title: z.string(),
  description: z.string(),
  date: z.string(),
  author: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  status: LogStatusSchema.optional(),
});

export type Log = z.infer<typeof LogSchema>;
