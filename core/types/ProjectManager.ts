/**
 * Project Manager interface representing team members who manage projects
 * All fields except name are optional to support gradual data collection
 */
export interface ProjectManager {
  name: string;
  id?: string;
  email?: string;
  phone?: string;
  role?: string;
}
