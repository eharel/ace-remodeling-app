/**
 * SegmentedControl Component - Barrel Export
 * 
 * Unified selection component with multiple visual variants (pills, tabs).
 * 
 * Exports:
 * - SegmentedControl: Main component
 * - Types: TypeScript interfaces and types
 * - Utils: Helper functions
 * - Variants: PillOption and TabOption (for testing or advanced usage)
 */

export { SegmentedControl } from "./SegmentedControl";
export type {
  SegmentedControlProps,
  SegmentedControlVariant,
  OptionComponentProps,
} from "./types";
export { formatLabel, isValidOption } from "./utils";
export { default as PillOption } from "./PillOption";
export { default as TabOption } from "./TabOption";

