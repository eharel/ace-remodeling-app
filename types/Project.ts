import { ProjectCategory } from "./Category";
import { Document } from "./Document";
import { Log } from "./Log";
import { Picture } from "./Picture";
import { ProjectStatus } from "./Status";

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  briefDescription: string;
  longDescription: string;
  thumbnail: string;

  // Media and documents
  pictures: Picture[];
  documents: Document[];
  logs: Log[];

  // Additional fields for future use
  location?: string;
  clientInfo?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
  };
  projectDates?: {
    startDate: Date;
    completionDate?: Date;
    estimatedCompletion?: Date;
  };
  status: ProjectStatus;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
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
  status: Project["status"];
  completedAt?: Date;
}
