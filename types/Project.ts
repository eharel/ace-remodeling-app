import { ProjectCategory } from "./Category";
import { Document } from "./Document";
import { Log } from "./Log";
import { Picture } from "./Picture";
import { ProjectManager } from "./ProjectManager";
import { ProjectStatus } from "./Status";

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  briefDescription: string;
  longDescription: string;
  thumbnail: string;

  // PM information - multiple PMs can work on a project
  pms?: ProjectManager[];

  // Media and documents
  pictures: Picture[];
  documents: Document[];
  logs: Log[];

  // Additional fields
  location?: string;
  clientInfo?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  projectDates?: {
    startDate: string; // ISO string format
    completionDate?: string;
    estimatedCompletion?: string;
  };
  status: ProjectStatus;

  // Metadata
  createdAt: string; // ISO string format
  updatedAt: string; // ISO string format
  tags?: string[];
  estimatedCost?: number;
  actualCost?: number;
}

// Simplified version for list views
export interface ProjectSummary {
  id: string;
  name: string;
  category: ProjectCategory;
  briefDescription: string;
  thumbnail: string;
  status: ProjectStatus;
  completedAt?: string;
  pmNames?: string[]; // PM names for list views and filtering
}
