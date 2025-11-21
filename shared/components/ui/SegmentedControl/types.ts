/**
 * Type definitions for SegmentedControl component
 * 
 * Provides strongly-typed interfaces for the unified selection component
 * that supports multiple visual variants (pills, tabs).
 */

/**
 * Visual variant types for SegmentedControl
 */
export type SegmentedControlVariant = 'pills' | 'tabs';

/**
 * Main component props - uses TypeScript generics for type safety
 * 
 * @template T - The type of option values (must extend string)
 */
export interface SegmentedControlProps<T extends string> {
  // Required props
  /** Array of option values - readonly to prevent mutation */
  options: readonly T[];
  
  /** Currently selected value (must be in options array) */
  selected: T;
  
  /** Selection callback - called when user selects an option */
  onSelect: (option: T) => void;

  // Visual variant
  /** Visual style variant - defaults to 'tabs' */
  variant?: SegmentedControlVariant;

  // Optional features
  /** Whether to display counts next to labels */
  showCounts?: boolean;
  
  /** Function to get count for an option (required if showCounts is true) */
  getCounts?: (option: T) => number;
  
  /** Custom label formatter - defaults to formatLabel utility */
  getLabel?: (option: T) => string;
  
  /** Accessibility label for the entire control */
  ariaLabel?: string;
  
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Individual option component props (used by variant components)
 * 
 * Variant components (PillOption, TabOption) receive these props
 * and handle only visual presentation.
 */
export interface OptionComponentProps {
  /** Display label for the option */
  label: string;
  
  /** Whether this option is currently selected */
  isSelected: boolean;
  
  /** Callback when option is pressed */
  onPress: () => void;
  
  /** Optional accessibility label */
  accessibilityLabel?: string;
  
  /** Optional test ID */
  testID?: string;
}

