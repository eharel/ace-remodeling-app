/**
 * Data Builder Module
 *
 * Merges CSV data, scanned files, and upload results into complete Project documents
 * ready for Firestore.
 *
 * @module scripts/lib/firebase/dataBuilder
 */

import { randomUUID } from "crypto";

import { Document, DOCUMENT_TYPES } from "../../../core/types/Document";
import { MEDIA_STAGES, MediaAsset } from "../../../core/types/MediaAsset";
import { Project } from "../../../core/types/Project";
import { ProjectComponent } from "../../../core/types/ProjectComponent";
import {
  AssetType,
  ComponentFiles,
  DiscoveredAsset,
  DiscoveredMedia,
} from "../filesystem/types";
import { ComponentUploadResult, UploadResult } from "./storage";

/**
 * All data sources needed to build a Project document
 */
export interface ProjectDataSources {
  /** Project data from CSV (already parsed) */
  csvData: Project;

  /** Scanned files for all components */
  componentFiles: ComponentFiles[];

  /** Upload results with download URLs */
  uploadResults: ComponentUploadResult[];
}

/**
 * Result of building a project document
 */
export interface BuildResult {
  /** Whether build succeeded */
  success: boolean;
  /** Built project document (if successful) */
  project?: Project;
  /** Errors encountered during build */
  errors: string[];
  /** Warnings (non-fatal issues) */
  warnings: string[];
}

/**
 * Build a complete Project document from all data sources
 *
 * Merges CSV data, scanned files, and upload results into a single
 * Project document ready for Firestore.
 *
 * @param sources - All data sources
 * @returns BuildResult with Project or errors
 */
export function buildProjectDocument(sources: ProjectDataSources): BuildResult {
  const { csvData, componentFiles, uploadResults } = sources;

  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    console.log(`\n🔨 Building Project ${csvData.number}...`);
    console.log(`   • CSV data: ✅`);
    console.log(`   • Scanner data: ✅ (${componentFiles.length} components)`);
    console.log(`   • Upload results: ✅ (${uploadResults.length} components)`);
    console.log(`   • Merging...`);

    // Start with CSV data (has most metadata)
    const project: Project = {
      ...csvData,

      // Override components with fully populated data
      components: buildComponents(
        csvData.components,
        componentFiles,
        uploadResults,
        errors,
        warnings
      ),

      // Update timestamps
      updatedAt: new Date().toISOString(),
      // Keep original createdAt from CSV
    };

    // Validate before returning
    const validation = validateProject(project);
    if (!validation.valid) {
      errors.push(...validation.errors);
      return { success: false, errors, warnings };
    }

    const totalMedia = project.components.reduce(
      (sum, c) => sum + c.media.length,
      0
    );
    const totalAssets = project.components.reduce(
      (sum, c) => sum + (c.documents?.length || 0),
      0
    );

    console.log(`   ✅ Project ${csvData.number} built successfully`);
    console.log(`      Components: ${project.components.length}`);
    console.log(`      Media: ${totalMedia}`);
    console.log(`      Assets: ${totalAssets}`);

    return {
      success: true,
      project,
      errors: [],
      warnings,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Failed to build project: ${errorMessage}`);
    return { success: false, errors, warnings };
  }
}

/**
 * Build all components with populated media and documents
 *
 * Matches CSV components with scanned files and upload results,
 * then merges the data together.
 *
 * @param csvComponents - Components from CSV
 * @param scannedFiles - Scanned files grouped by component
 * @param uploadResults - Upload results grouped by component
 * @param errors - Array to collect errors
 * @param warnings - Array to collect warnings
 * @returns Array of fully populated components
 */
function buildComponents(
  csvComponents: ProjectComponent[],
  scannedFiles: ComponentFiles[],
  uploadResults: ComponentUploadResult[],
  errors: string[],
  warnings: string[]
): ProjectComponent[] {
  return csvComponents.map((csvComponent) => {
    // Find matching scanned files
    const files = scannedFiles.find(
      (f) =>
        f.category === csvComponent.category &&
        f.subcategory === csvComponent.subcategory
    );

    // Find matching upload results
    const uploads = uploadResults.find(
      (u) =>
        u.category === csvComponent.category &&
        u.subcategory === csvComponent.subcategory
    );

    if (!files) {
      warnings.push(
        `Component ${csvComponent.category}${
          csvComponent.subcategory ? "/" + csvComponent.subcategory : ""
        } has no scanned files`
      );
      return csvComponent;
    }

    if (!uploads) {
      warnings.push(
        `Component ${csvComponent.category}${
          csvComponent.subcategory ? "/" + csvComponent.subcategory : ""
        } has no upload results`
      );
      // Return component with empty arrays
      return {
        ...csvComponent,
        media: [],
        documents: [],
      };
    }

    // Build media array
    const media = buildMediaAssets(files, uploads.mediaResults, errors);

    // Build documents array
    const documents = buildDocuments(files, uploads.assetResults, errors);

    return {
      ...csvComponent,
      media,
      documents: documents.length > 0 ? documents : undefined,
    };
  });
}

/**
 * Build MediaAsset objects from scanned files and upload results
 *
 * @param files - Component files from scanner
 * @param uploadResults - Upload results for media files
 * @param errors - Array to collect errors
 * @returns Array of MediaAsset objects
 */
function buildMediaAssets(
  files: ComponentFiles,
  uploadResults: UploadResult[],
  errors: string[]
): MediaAsset[] {
  const mediaAssets: MediaAsset[] = [];
  let order = 1;

  for (const discoveredMedia of files.media) {
    // Find matching upload result
    const uploadResult = uploadResults.find(
      (r) => r.localPath === discoveredMedia.filepath
    );

    if (!uploadResult) {
      errors.push(
        `Media file ${discoveredMedia.filename} has no upload result`
      );
      continue;
    }

    if (!uploadResult.success || !uploadResult.downloadURL) {
      errors.push(
        `Media file ${discoveredMedia.filename} upload failed: ${uploadResult.error}`
      );
      continue;
    }

    // Map stage - scanner uses "rendering" but MediaAsset uses "renderings"
    const stageMap: Record<string, MediaAsset["stage"]> = {
      before: MEDIA_STAGES.BEFORE,
      after: MEDIA_STAGES.AFTER,
      "in-progress": MEDIA_STAGES.IN_PROGRESS,
      rendering: MEDIA_STAGES.RENDERINGS, // Map singular to plural
      other: MEDIA_STAGES.OTHER,
    };
    const stage = stageMap[discoveredMedia.stage] || MEDIA_STAGES.OTHER;

    // Create MediaAsset
    const mediaAsset: MediaAsset = {
      // FileAsset fields
      id: generateMediaId(discoveredMedia),
      filename: discoveredMedia.filename,
      url: uploadResult.downloadURL,
      storagePath: uploadResult.storagePath,
      size: discoveredMedia.size,
      order: order++,
      uploadedAt: new Date().toISOString(),

      // MediaAsset-specific fields
      mediaType: discoveredMedia.mediaType,
      stage: stage as MediaAsset["stage"],

      // Optional fields
      ...(discoveredMedia.width && { width: discoveredMedia.width }),
      ...(discoveredMedia.height && { height: discoveredMedia.height }),
      ...(discoveredMedia.duration && { duration: discoveredMedia.duration }),
      ...(discoveredMedia.codec && { codec: discoveredMedia.codec }),
    };

    mediaAssets.push(mediaAsset);
  }

  return mediaAssets;
}

/**
 * Build Document objects from scanned assets and upload results
 *
 * @param files - Component files from scanner
 * @param uploadResults - Upload results for asset files
 * @param errors - Array to collect errors
 * @returns Array of Document objects
 */
function buildDocuments(
  files: ComponentFiles,
  uploadResults: UploadResult[],
  errors: string[]
): Document[] {
  const documents: Document[] = [];
  let order = 1;

  for (const discoveredAsset of files.assets) {
    const uploadResult = uploadResults.find(
      (r) => r.localPath === discoveredAsset.filepath
    );

    if (!uploadResult) {
      errors.push(
        `Asset file ${discoveredAsset.filename} has no upload result`
      );
      continue;
    }

    if (!uploadResult.success || !uploadResult.downloadURL) {
      errors.push(
        `Asset file ${discoveredAsset.filename} upload failed: ${uploadResult.error}`
      );
      continue;
    }

    const document: Document = {
      // FileAsset fields
      id: generateDocumentId(discoveredAsset),
      filename: discoveredAsset.filename,
      url: uploadResult.downloadURL,
      storagePath: uploadResult.storagePath,
      size: discoveredAsset.size,
      order: order++,
      uploadedAt: new Date().toISOString(),

      // Document-specific fields
      name: discoveredAsset.filename,
      type: mapAssetTypeToDocumentType(discoveredAsset.assetType),
      fileType: getFileTypeFromExtension(discoveredAsset.extension),
      category: discoveredAsset.category,
    };

    documents.push(document);
  }

  return documents;
}

/**
 * Generate unique ID for media asset
 *
 * @param media - Discovered media file
 * @returns Unique ID string
 */
function generateMediaId(media: DiscoveredMedia): string {
  return randomUUID();
}

/**
 * Generate unique ID for document
 *
 * @param asset - Discovered asset file
 * @returns Unique ID string
 */
function generateDocumentId(asset: DiscoveredAsset): string {
  return randomUUID();
}

/**
 * Map asset type to Document type
 *
 * @param assetType - Asset type from scanner
 * @returns DocumentType
 */
function mapAssetTypeToDocumentType(assetType: AssetType): Document["type"] {
  const mapping: Record<AssetType, Document["type"]> = {
    plan: DOCUMENT_TYPES.FLOOR_PLAN,
    rendering: DOCUMENT_TYPES.RENDERING_3D,
    material: DOCUMENT_TYPES.MATERIALS,
    document: DOCUMENT_TYPES.OTHER,
    other: DOCUMENT_TYPES.OTHER,
  };

  return mapping[assetType] || DOCUMENT_TYPES.OTHER;
}

/**
 * Get file type MIME string from extension
 *
 * @param ext - File extension (e.g., ".pdf")
 * @returns MIME type string
 */
/**
 * Get MIME type from file extension
 *
 * Maps file extensions to proper MIME types for document assets.
 * Supports PDFs, CAD files, and high-resolution images.
 *
 * @param ext - File extension (with or without dot)
 * @returns MIME type string
 */
function getFileTypeFromExtension(ext: string): string {
  const extLower = ext.toLowerCase();

  // Documents
  if ([".pdf"].includes(extLower)) return "application/pdf";
  if ([".doc"].includes(extLower)) return "application/msword";
  if ([".docx"].includes(extLower))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  // CAD files
  if ([".dwg", ".dxf"].includes(extLower)) return "application/acad";
  if ([".skp"].includes(extLower)) return "application/vnd.sketchup.skp";

  // Images (high-res documents - specs, plans, etc.)
  if ([".jpg", ".jpeg"].includes(extLower)) return "image/jpeg";
  if ([".png"].includes(extLower)) return "image/png";
  if ([".heic"].includes(extLower)) return "image/heic";
  if ([".gif"].includes(extLower)) return "image/gif";
  if ([".webp"].includes(extLower)) return "image/webp";

  return "application/octet-stream";
}

/**
 * Validate project has all required fields
 *
 * @param project - Project to validate
 * @returns Validation result
 */
function validateProject(project: Project): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!project.number || project.number.trim() === "") {
    errors.push("Missing project number");
  }

  if (!project.name || project.name.trim() === "") {
    errors.push("Missing project name");
  }

  if (!project.components || project.components.length === 0) {
    errors.push("Project has no components");
  }

  // Validate each component
  for (const component of project.components) {
    if (!component.id) {
      errors.push(`Component missing id`);
    }

    if (!component.category) {
      errors.push(`Component missing category`);
    }

    // Media is required (can be empty array)
    if (!Array.isArray(component.media)) {
      errors.push(`Component ${component.id} has invalid media array`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
