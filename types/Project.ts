import { ProjectCategory } from "./Category";
import { Document } from "./Document";
import { Log } from "./Log";
import { Picture } from "./Picture";
import { ProjectManager } from "./ProjectManager";
import { ProjectStatus } from "./Status";

export interface Project {
  id: string;
  projectNumber: string; // ACE project tracking number (e.g., "217", "311B")
  name: string; // Descriptive design-focused name
  category: ProjectCategory;
  briefDescription: string;
  longDescription: string;
  thumbnail: string;

  // Location (public-facing: zip code + neighborhood only)
  location: {
    zipCode: string; // e.g., "78701"
    neighborhood: string; // e.g., "Downtown Austin"
  };

  // Project duration
  duration: {
    value: number; // e.g., 8
    unit: "days" | "weeks" | "months";
  };

  // Scope with design aspects
  scope: string;

  // Client testimonial (optional - will be added as received)
  testimonial?: {
    text: string;
    author: string; // First name or initials
    date?: string; // ISO string format
  };

  // PM information - multiple PMs can work on a project
  pms?: ProjectManager[];

  // Media and documents
  pictures: Picture[];
  documents: Document[];
  logs: Log[];

  // Internal metadata (not shown to public)
  projectDates?: {
    startDate: string; // ISO string format
    completionDate?: string;
    estimatedCompletion?: string;
  };
  status: ProjectStatus;
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  tags?: string[];
  featured?: boolean;
}

// Simplified version for list views
export interface ProjectSummary {
  id: string;
  projectNumber: string; // ACE project tracking number
  name: string;
  category: ProjectCategory;
  briefDescription: string;
  thumbnail: string;
  status: ProjectStatus;
  completedAt?: string;
  pmNames?: string[]; // PM names for list views and filtering
}
