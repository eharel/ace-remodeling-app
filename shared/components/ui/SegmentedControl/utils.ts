/**
 * Utility functions for SegmentedControl component
 * 
 * Pure helper functions with no side effects.
 * These can be easily unit tested.
 */

/**
 * Format option value into display label
 * 
 * Converts kebab-case to Title Case:
 * - 'full-home' → 'Full Home'
 * - 'adu' → 'ADU' (special case)
 * - 'in-progress' → 'In Progress'
 * - 'all' → 'All' (special case)
 * 
 * @param value - The option value to format
 * @returns Human-readable display label
 * 
 * @example
 * formatLabel('full-home') // 'Full Home'
 * formatLabel('adu') // 'ADU'
 * formatLabel('in-progress') // 'In Progress'
 */
export function formatLabel(value: string): string {
  // Handle special cases
  if (value === 'all') return 'All';
  if (value === 'adu') return 'ADU';
  
  // Convert kebab-case to Title Case
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Type guard to check if a value is in an array of options
 * 
 * Provides type narrowing from string to the specific option type T.
 * Useful for runtime validation of option values.
 * 
 * @template T - The type of option values
 * @param value - The value to check
 * @param options - Array of valid options
 * @returns True if value is a valid option
 * 
 * @example
 * const options = ['option1', 'option2'] as const;
 * isValidOption('option1', options) // true
 * isValidOption('invalid', options) // false
 */
export function isValidOption<T extends string>(
  value: string,
  options: readonly T[]
): value is T {
  return options.includes(value as T);
}

