/**
 * Configuration for Firebase Storage upload script
 *
 * This file contains all constants, file type mappings, and category
 * mappings used by the upload script.
 */

/**
 * Base path to the folder containing project assets
 * Category-specific folders (kitchen, bathroom, pools, etc.) are subdirectories
 * Update this path to match your local setup
 */
export const BASE_ASSETS_PATH =
  "/Users/eliharel/Code/Projects/ace-remodeling-assets";

/**
 * Valid project categories
 * These match the local folder names in ace-remodeling-assets/
 */
export const VALID_CATEGORIES = [
  "kitchen",
  "bathroom",
  "full-home", // Full home remodels
  "adu-addition", // Combined category with subcategories (adu, addition)
  "outdoor", // Outdoor living spaces
  "pools", // Pool projects (future)
] as const;

/**
 * Valid subcategories for adu-addition category
 * These match the subfolder names within ace-remodeling-assets/adu-addition/
 */
export const ADU_ADDITION_SUBCATEGORIES = ["adu", "addition"] as const;

/**
 * Supported image file extensions
 */
export const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".webp"];

/**
 * Supported document file extensions
 */
export const DOCUMENT_EXTENSIONS = [".pdf"];

/**
 * Files to automatically skip during scanning
 */
export const SKIP_FILES = [".DS_Store", "Thumbs.db", ".gitkeep", "desktop.ini"];

/**
 * Maximum file size in MB (warnings for larger files)
 */
export const MAX_FILE_SIZE_MB = 50;

/**
 * Number of files to upload in parallel
 * Adjust based on network speed and Firebase quotas
 */
export const UPLOAD_BATCH_SIZE = 10;

/**
 * Maximum retry attempts for failed uploads
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Initial delay for exponential backoff (ms)
 */
export const RETRY_DELAY_MS = 1000;

/**
 * Default output path for generated Firestore data
 */
export const DEFAULT_OUTPUT_PATH = "./scripts/output/";

/**
 * Image category mappings
 *
 * Maps folder name variations (normalized to lowercase) to standardized
 * categories for Firebase Storage organization.
 */
export const IMAGE_CATEGORY_MAPPINGS: Record<string, string> = {
  // After variations
  "after photos": "after",
  "after images": "after",
  after: "after",
  completed: "after",
  final: "after",

  // Before variations
  "before photos": "before",
  "before images": "before",
  before: "before",
  existing: "before",
  original: "before",

  // Construction/Progress variations
  "during construction": "progress",
  construction: "progress",
  "in progress": "progress",
  progress: "progress",
  "in-progress": "progress",
  wip: "progress",
  "work in progress": "progress",

  // 3D Renderings (images)
  "3d rendering": "rendering",
  "3d remodeling": "rendering", // Client-specific variation
  rendering: "rendering",
  renderings: "rendering",
  "3d": "rendering",
  mockup: "rendering",
  mockups: "rendering",

  // Materials/Samples
  materials: "materials",
  samples: "materials",
  finishes: "materials",

  // Default fallback handled in code → 'other'
};

/**
 * Document category mappings
 *
 * Maps folder name variations (normalized to lowercase) to standardized
 * categories for Firebase Storage organization.
 */
export const DOCUMENT_CATEGORY_MAPPINGS: Record<string, string> = {
  // Plans
  plans: "plans",
  blueprints: "plans",
  "floor plans": "plans",
  floorplans: "plans",
  "architectural plans": "plans",

  // 3D Renderings (PDFs)
  "3d rendering": "rendering",
  "3d remodeling": "rendering",
  rendering: "rendering",
  renderings: "rendering",
  "3d": "rendering",

  // Contracts/Legal
  contracts: "contracts",
  contract: "contracts",
  agreement: "contracts",
  agreements: "contracts",

  // Invoices
  invoices: "invoices",
  invoice: "invoices",
  bills: "invoices",

  // Permits
  permits: "permits",
  permit: "permits",

  // Specifications
  specifications: "specifications",
  specs: "specifications",
  spec: "specifications",

  // Default fallback handled in code → 'other'
};

/**
 * MIME type mappings for file extensions
 */
export const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".heic": "image/heic",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

/**
 * Category display names for documents
 * Used when generating Firestore data
 */
export const DOCUMENT_TYPE_NAMES: Record<string, string> = {
  plans: "Floor Plan",
  rendering: "3D Rendering",
  contracts: "Contract",
  invoices: "Invoice",
  permits: "Permit",
  specifications: "Specification",
  other: "Document",
};

/**
 * Folder name patterns that indicate category suffixes to ignore
 * (e.g., " - Kitchen", " - Bathroom")
 */
export const CATEGORY_SUFFIXES = [
  "kitchen",
  "bathroom",
  "pantry",
  "outdoor",
  "interior",
  "exterior",
];
