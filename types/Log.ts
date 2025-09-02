export interface Log {
  id: string;
  projectId: string;
  type: "milestone" | "update" | "issue" | "completion" | "note";
  title: string;
  description: string;
  date: Date;
  author?: string;
  attachments?: string[]; // URLs to related pictures/documents
  status?: "pending" | "in-progress" | "completed" | "blocked";
}
