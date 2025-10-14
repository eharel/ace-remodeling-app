/**
 * Utility functions for working with ISO date strings
 * These help convert between Date objects and ISO strings for Firebase
 */

/**
 * Convert a Date object to an ISO string
 * Use this when saving to Firebase
 */
export function dateToISO(date: Date): string {
  return date.toISOString();
}

/**
 * Convert an ISO string to a Date object
 * Use this when reading from Firebase
 */
export function isoToDate(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Get current timestamp as ISO string
 * Use this for createdAt/updatedAt fields
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Format an ISO string for display
 * Returns a user-friendly date string
 */
export function formatISODate(
  isoString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = isoToDate(isoString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  });
}

/**
 * Format an ISO string for display with time
 * Returns a user-friendly date and time string
 */
export function formatISODateTime(isoString: string): string {
  const date = isoToDate(isoString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Check if an ISO string represents today
 */
export function isToday(isoString: string): boolean {
  const date = isoToDate(isoString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if an ISO string represents yesterday
 */
export function isYesterday(isoString: string): boolean {
  const date = isoToDate(isoString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 */
export function getRelativeTime(isoString: string): string {
  const date = isoToDate(isoString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return formatISODate(isoString);
}
