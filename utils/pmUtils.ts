import { Project } from "../types/Project";

/**
 * Utility functions for working with multiple Project Managers
 */

export interface PMInfo {
  name: string;
  // Future fields can be added here:
  // id?: string;
  // email?: string;
  // phone?: string;
  // role?: string;
  // assignedAt?: string;
}

/**
 * Get all PM names from a project
 */
export function getPMNames(project: Project): string[] {
  return project.pms?.map((pm) => pm.name) || [];
}

/**
 * Get PM names as a comma-separated string
 */
export function getPMNamesString(project: Project): string {
  const names = getPMNames(project);
  return names.join(", ");
}

/**
 * Get the first PM (primary PM)
 */
export function getPrimaryPM(project: Project): PMInfo | undefined {
  if (!project.pms || project.pms.length === 0) return undefined;
  return project.pms[0];
}

/**
 * Check if a specific PM is assigned to a project
 */
export function isPMAssigned(project: Project, pmName: string): boolean {
  return project.pms?.some((pm) => pm.name === pmName) || false;
}

/**
 * Get PM by name
 */
export function getPMByName(
  project: Project,
  pmName: string
): PMInfo | undefined {
  return project.pms?.find((pm) => pm.name === pmName);
}

/**
 * Add a PM to a project
 */
export function addPMToProject(project: Project, pmInfo: PMInfo): Project {
  const currentPMs = project.pms || [];

  // Check if PM is already assigned
  if (isPMAssigned(project, pmInfo.name)) {
    throw new Error(`PM ${pmInfo.name} is already assigned to this project`);
  }

  return {
    ...project,
    pms: [...currentPMs, pmInfo],
    pmNames: getPMNames({ ...project, pms: [...currentPMs, pmInfo] }),
  };
}

/**
 * Remove a PM from a project
 */
export function removePMFromProject(project: Project, pmName: string): Project {
  const currentPMs = project.pms || [];
  const updatedPMs = currentPMs.filter((pm) => pm.name !== pmName);

  return {
    ...project,
    pms: updatedPMs,
    pmNames: getPMNames({ ...project, pms: updatedPMs }),
  };
}

/**
 * Get project count for a PM
 */
export function getProjectCountForPM(
  projects: Project[],
  pmName: string
): number {
  return projects.filter((project) => isPMAssigned(project, pmName)).length;
}

/**
 * Get all projects for a specific PM
 */
export function getProjectsForPM(
  projects: Project[],
  pmName: string
): Project[] {
  return projects.filter((project) => isPMAssigned(project, pmName));
}

/**
 * Format PM info for display
 */
export function formatPMInfo(pm: PMInfo): string {
  return pm.name;
}
