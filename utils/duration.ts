/**
 * Duration calculation and formatting utilities
 *
 * These functions calculate project duration from start/end dates
 * and format them in a marketing-friendly way.
 */

/**
 * Calculate number of days between two dates
 *
 * @param startDate - Start date (ISO string or Date)
 * @param endDate - End date (ISO string or Date)
 * @returns Number of days (rounded up)
 */
export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format days into human-readable duration
 *
 * Automatically chooses appropriate unit and rounds for marketing appeal:
 * - 0-13 days: show days
 * - 14-55 days: show weeks (rounded)
 * - 56+ days: show months (rounded to nearest 0.5)
 *
 * @param days - Number of days
 * @returns Formatted duration string
 *
 * @example
 * formatDuration(10) // "10 days"
 * formatDuration(48) // "7 weeks"
 * formatDuration(75) // "2.5 months"
 */
export function formatDuration(days: number): string {
  if (days === 0) return "Less than a day";
  if (days === 1) return "1 day";

  const weeks = days / 7;
  const months = days / 30;

  // Less than 2 weeks: show days
  if (weeks < 2) {
    return `${days} day${days !== 1 ? "s" : ""}`;
  }

  // 2-8 weeks: show weeks (rounded)
  if (weeks < 8) {
    const roundedWeeks = Math.round(weeks);
    return `${roundedWeeks} week${roundedWeeks !== 1 ? "s" : ""}`;
  }

  // 8+ weeks: show months (rounded to nearest 0.5)
  const roundedMonths = Math.round(months * 2) / 2;
  return `${roundedMonths} month${roundedMonths !== 1 ? "s" : ""}`;
}

/**
 * Get formatted duration from project dates object
 *
 * @param project - Project with projectDates field
 * @returns Formatted duration string
 *
 * @example
 * getProjectDuration({ projectDates: { start: "2024-01-01", end: "2024-03-01" } })
 * // "8 weeks"
 */
export function getProjectDuration(project: {
  projectDates: { start: string; end: string };
}): string {
  const days = calculateDays(
    project.projectDates.start,
    project.projectDates.end
  );
  return formatDuration(days);
}

/**
 * Calculate duration with specific unit
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @param unit - Desired unit
 * @returns Duration value in specified unit
 *
 * @example
 * calculateDurationInUnit("2024-01-01", "2024-03-01", "weeks") // 8.57
 */
export function calculateDurationInUnit(
  startDate: string,
  endDate: string,
  unit: "days" | "weeks" | "months"
): number {
  const days = calculateDays(startDate, endDate);

  switch (unit) {
    case "days":
      return days;
    case "weeks":
      return days / 7;
    case "months":
      return days / 30;
    default:
      return days;
  }
}

/**
 * Format duration with custom options
 *
 * @param days - Number of days
 * @param options - Formatting options
 * @returns Formatted string
 */
export function formatDurationCustom(
  days: number,
  options?: {
    preferredUnit?: "days" | "weeks" | "months";
    showDecimals?: boolean;
    shortForm?: boolean; // "7w" instead of "7 weeks"
  }
): string {
  const {
    preferredUnit,
    showDecimals = false,
    shortForm = false,
  } = options || {};

  let value: number;
  let unit: string;
  let shortUnit: string;

  if (preferredUnit === "days" || (!preferredUnit && days < 14)) {
    value = days;
    unit = "day";
    shortUnit = "d";
  } else if (preferredUnit === "weeks" || (!preferredUnit && days < 56)) {
    value = days / 7;
    unit = "week";
    shortUnit = "w";
  } else {
    value = days / 30;
    unit = "month";
    shortUnit = "mo";
  }

  const formattedValue = showDecimals
    ? value.toFixed(1)
    : Math.round(value).toString();

  if (shortForm) {
    return `${formattedValue}${shortUnit}`;
  }

  const pluralUnit = parseFloat(formattedValue) !== 1 ? `${unit}s` : unit;
  return `${formattedValue} ${pluralUnit}`;
}
