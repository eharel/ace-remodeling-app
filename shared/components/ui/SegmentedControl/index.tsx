/**
 * SegmentedControl Component - Barrel Export
 * 
 * Unified selection component with multiple visual variants (pills, tabs).
 * 
 * Exports:
 * - SegmentedControl: Main component
 * - Types: TypeScript interfaces and types
 * - Utils: Helper functions
 */

export { SegmentedControl } from "./SegmentedControl";
export type {
  SegmentedControlProps,
  SegmentedControlVariant,
  OptionComponentProps,
} from "./types";
export { formatLabel, isValidOption } from "./utils";

