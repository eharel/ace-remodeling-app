/**
 * Filesystem Scanner Module
 *
 * Scans local project folders and discovers all photos/videos/assets.
 * Handles nested component structures and provides detailed reporting.
 *
 * @module scripts/lib/filesystem/scanner
 */

import * as path from "path";
import {
  ComponentDir,
  ComponentFiles,
  DiscoveredAsset,
  DiscoveredMedia,
  MediaStage,
  ScanError,
  ScanResult,
  ScanStats,
  ScanWarning,
} from "./types";
import {
  extractAssetCategory,
  extractStageFromPath,
  formatBytes,
  getFilesInDirectory,
  getFileSize,
  getMediaType,
  getRelativePath,
  getSubdirectories,
  isAssetFile,
  isDirectory,
  pathExists,
} from "../utils/fileUtils";

/**
 * Scans local filesystem for all project files
 *
 * Recursively scans project folders to discover all media and asset files.
 * Handles both flat and nested component structures (e.g., outdoor/pool).
 *
 * @param assetsRoot - Root path to ace-remodeling-assets/
 * @param projectNumbers - Array of project numbers to scan (from CSV)
 * @returns Promise<ScanResult> with all discovered files and statistics
 */
export async function scanProjectFiles(
  assetsRoot: string,
  projectNumbers: string[]
): Promise<ScanResult> {
  const startTime = Date.now();

  console.log(`📁 Scanning filesystem: ${assetsRoot}`);
  console.log(`🔍 Looking for ${projectNumbers.length} projects...\n`);

  const components: ComponentFiles[] = [];
  const errors: ScanError[] = [];
  const warnings: ScanWarning[] = [];

  // Track which projects we actually found
  const foundProjects = new Set<string>();

  for (const projectNumber of projectNumbers) {
    const projectPath = path.join(assetsRoot, projectNumber);

    // Check if project folder exists
    if (!(await pathExists(projectPath))) {
      errors.push({
        projectNumber,
        message: `Project folder not found: ${projectPath}`,
      });
      console.log(`❌ Project ${projectNumber}: Folder not found`);
      continue;
    }

    foundProjects.add(projectNumber);
    console.log(`📦 Project ${projectNumber}:`);

    try {
      // Find all component directories in this project
      const componentDirs = await findComponentDirectories(
        projectPath,
        projectNumber
      );

      if (componentDirs.length === 0) {
        warnings.push({
          projectNumber,
          message: "No component directories found",
        });
        console.log(`   ⚠️  No component directories found`);
        continue;
      }

      // Scan each component
      for (const componentDir of componentDirs) {
        try {
          const componentFiles = await scanComponent(
            assetsRoot,
            componentDir,
            warnings
          );
          components.push(componentFiles);

          // Log component summary
          logComponentSummary(componentFiles);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push({
            projectNumber,
            component: componentDir.category,
            message: `Failed to scan component: ${errorMessage}`,
          });
          console.log(
            `   ✗ ${componentDir.category}: Scan failed - ${errorMessage}`
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push({
        projectNumber,
        message: `Failed to scan project: ${errorMessage}`,
      });
      console.log(`   ✗ Project scan failed: ${errorMessage}`);
    }
  }

  // Calculate aggregate stats
  const stats = calculateStats(
    components,
    foundProjects.size,
    Date.now() - startTime
  );

  // Log final summary
  logFinalSummary(components, errors, warnings, stats);

  return {
    success: errors.length === 0,
    components,
    errors,
    warnings,
    stats,
  };
}

/**
 * Find all component directories in a project folder
 *
 * Handles both flat structure (bathroom/) and nested (outdoor/pool/).
 * Looks for folders that contain photos/, videos/, or assets/ subdirectories.
 *
 * @param projectPath - Absolute path to project folder
 * @param projectNumber - Project number for reference
 * @returns Array of ComponentDir objects
 */
async function findComponentDirectories(
  projectPath: string,
  projectNumber: string
): Promise<ComponentDir[]> {
  const componentDirs: ComponentDir[] = [];

  // Get all subdirectories in project folder
  const subdirs = await getSubdirectories(projectPath);

  for (const subdir of subdirs) {
    const subdirPath = path.join(projectPath, subdir);

    // Check if this directory contains content folders (photos/videos/assets)
    const hasContentFolders = await hasAnyContentFolder(subdirPath);

    if (hasContentFolders) {
      // This is a component directory (e.g., "bathroom")
      componentDirs.push({
        projectNumber,
        category: subdir,
        path: subdirPath,
      });
    } else {
      // This might be a category with subcategories (e.g., "outdoor/pool")
      // Check one level deeper
      const nestedSubdirs = await getSubdirectories(subdirPath);

      for (const nestedSubdir of nestedSubdirs) {
        const nestedPath = path.join(subdirPath, nestedSubdir);
        const hasContent = await hasAnyContentFolder(nestedPath);

        if (hasContent) {
          componentDirs.push({
            projectNumber,
            category: subdir,
            subcategory: nestedSubdir,
            path: nestedPath,
          });
        }
      }
    }
  }

  return componentDirs;
}

/**
 * Check if directory contains any content folders (photos, videos, assets)
 *
 * @param dirPath - Directory path to check
 * @returns True if directory contains content folders
 */
async function hasAnyContentFolder(dirPath: string): Promise<boolean> {
  const subdirs = await getSubdirectories(dirPath);
  const contentFolders = ["photos", "videos", "assets"];

  return subdirs.some((subdir) =>
    contentFolders.includes(subdir.toLowerCase())
  );
}

/**
 * Scan a single component directory for all files
 *
 * Looks for photos/, videos/, and assets/ subdirectories and processes all files.
 *
 * @param assetsRoot - Root path for calculating relative paths
 * @param componentDir - Component directory information
 * @param warnings - Array to add warnings to
 * @returns ComponentFiles with all discovered files
 */
async function scanComponent(
  assetsRoot: string,
  componentDir: ComponentDir,
  warnings: ScanWarning[]
): Promise<ComponentFiles> {
  const media: DiscoveredMedia[] = [];
  const assets: DiscoveredAsset[] = [];

  // Scan photos folder
  const photosPath = path.join(componentDir.path, "photos");
  if (await pathExists(photosPath)) {
    const photosMedia = await scanMediaFolder(photosPath, assetsRoot);
    media.push(...photosMedia);
  }

  // Scan videos folder
  const videosPath = path.join(componentDir.path, "videos");
  if (await pathExists(videosPath)) {
    const videosMedia = await scanMediaFolder(videosPath, assetsRoot);
    media.push(...videosMedia);
  }

  // Scan assets folder
  const assetsPath = path.join(componentDir.path, "assets");
  if (await pathExists(assetsPath)) {
    const componentAssets = await scanAssetsFolder(assetsPath, assetsRoot);
    assets.push(...componentAssets);
  }

  // Check if component is empty
  const totalFiles = media.length + assets.length;
  if (totalFiles === 0) {
    warnings.push({
      projectNumber: componentDir.projectNumber,
      component: componentDir.category,
      message: "Component has no media or assets",
    });
  }

  // Calculate total size
  const totalSize =
    media.reduce((sum, m) => sum + m.size, 0) +
    assets.reduce((sum, a) => sum + a.size, 0);

  return {
    projectNumber: componentDir.projectNumber,
    category: componentDir.category,
    subcategory: componentDir.subcategory,
    media,
    assets,
    totalFiles,
    totalSize,
  };
}

/**
 * Recursively scan media folder (photos or videos)
 *
 * Looks for stage subfolders (before/, after/, etc.) and processes all media files.
 * If no stage folders exist, treats all files as "other" stage.
 *
 * @param mediaFolderPath - Path to photos/ or videos/ folder
 * @param assetsRoot - Root path for calculating relative paths
 * @returns Array of DiscoveredMedia objects
 */
async function scanMediaFolder(
  mediaFolderPath: string,
  assetsRoot: string
): Promise<DiscoveredMedia[]> {
  const discoveredMedia: DiscoveredMedia[] = [];

  // Check for stage subfolders
  const subdirs = await getSubdirectories(mediaFolderPath);

  if (subdirs.length > 0) {
    // Has stage folders (before/, after/, etc.)
    for (const subdir of subdirs) {
      const stagePath = path.join(mediaFolderPath, subdir);
      const stage = extractStageFromPath(stagePath);

      // Get all files in this stage folder
      const files = await getFilesInDirectory(stagePath);

      for (const filepath of files) {
        const mediaType = getMediaType(path.basename(filepath));
        if (mediaType) {
          const media = await processMediaFile(
            filepath,
            stage,
            mediaType,
            assetsRoot
          );
          discoveredMedia.push(media);
        }
      }
    }
  } else {
    // No stage folders - get all files directly in media folder
    const files = await getFilesInDirectory(mediaFolderPath);

    for (const filepath of files) {
      const mediaType = getMediaType(path.basename(filepath));
      if (mediaType) {
        const media = await processMediaFile(
          filepath,
          "other",
          mediaType,
          assetsRoot
        );
        discoveredMedia.push(media);
      }
    }
  }

  return discoveredMedia;
}

/**
 * Recursively scan assets folder
 *
 * Processes all asset files (PDFs, CAD files, etc.).
 * Extracts category from subfolder names if present.
 *
 * @param assetsFolderPath - Path to assets/ folder
 * @param assetsRoot - Root path for calculating relative paths
 * @returns Array of DiscoveredAsset objects
 */
async function scanAssetsFolder(
  assetsFolderPath: string,
  assetsRoot: string
): Promise<DiscoveredAsset[]> {
  const discoveredAssets: DiscoveredAsset[] = [];

  // Get all files recursively
  const files = await getFilesInDirectory(assetsFolderPath);

  for (const filepath of files) {
    if (isAssetFile(path.basename(filepath))) {
      // Extract category from parent folder
      const parentDir = path.dirname(filepath);
      const category = extractAssetCategory(parentDir);

      const asset = await processAssetFile(filepath, category, assetsRoot);
      discoveredAssets.push(asset);
    }
  }

  return discoveredAssets;
}

/**
 * Process a single media file (extract metadata)
 *
 * @param filepath - Absolute path to media file
 * @param stage - Media stage (before, after, etc.)
 * @param mediaType - Media type (image or video)
 * @param assetsRoot - Root path for calculating relative paths
 * @returns DiscoveredMedia object with metadata
 */
async function processMediaFile(
  filepath: string,
  stage: MediaStage,
  mediaType: "image" | "video",
  assetsRoot: string
): Promise<DiscoveredMedia> {
  const filename = path.basename(filepath);
  const extension = path.extname(filepath);
  const size = await getFileSize(filepath);
  const relativePath = getRelativePath(filepath, assetsRoot);

  const media: DiscoveredMedia = {
    filename,
    filepath,
    relativePath,
    extension,
    size,
    mediaType,
    stage,
  };

  // TODO: Extract image dimensions (would require image processing library)
  // TODO: Extract video duration/codec (would require video processing library)
  // For now, these remain undefined

  return media;
}

/**
 * Process a single asset file
 *
 * @param filepath - Absolute path to asset file
 * @param category - Asset category from folder name
 * @param assetsRoot - Root path for calculating relative paths
 * @returns DiscoveredAsset object
 */
async function processAssetFile(
  filepath: string,
  category: string,
  assetsRoot: string
): Promise<DiscoveredAsset> {
  const filename = path.basename(filepath);
  const extension = path.extname(filepath);
  const size = await getFileSize(filepath);
  const relativePath = getRelativePath(filepath, assetsRoot);

  // Determine asset type from extension or category
  let assetType: DiscoveredAsset["assetType"] = "other";
  if (extension === ".pdf") assetType = "document";
  else if ([".dwg", ".dxf", ".skp"].includes(extension)) assetType = "plan";
  else if (category.includes("rendering")) assetType = "rendering";
  else if (category.includes("material")) assetType = "material";

  return {
    filename,
    filepath,
    relativePath,
    extension,
    size,
    assetType,
    category,
  };
}

/**
 * Calculate aggregate statistics from scan results
 *
 * @param components - All discovered components
 * @param projectCount - Number of projects scanned
 * @param scanTime - Scan duration in milliseconds
 * @returns ScanStats object
 */
function calculateStats(
  components: ComponentFiles[],
  projectCount: number,
  scanTime: number
): ScanStats {
  let totalMedia = 0;
  let totalAssets = 0;
  let totalSize = 0;

  for (const component of components) {
    totalMedia += component.media.length;
    totalAssets += component.assets.length;
    totalSize += component.totalSize;
  }

  return {
    totalProjects: projectCount,
    totalComponents: components.length,
    totalMedia,
    totalAssets,
    totalSize,
    scanTime,
  };
}

/**
 * Log summary for a single component
 *
 * Shows file counts by stage for media and category for assets.
 *
 * @param componentFiles - Component files to summarize
 */
function logComponentSummary(componentFiles: ComponentFiles): void {
  const { category, subcategory, media, assets } = componentFiles;

  // Build component label
  let label = category;
  if (subcategory) {
    label += `/${subcategory}`;
  }

  // Count media by stage
  const stageCounts: Record<string, number> = {};
  for (const m of media) {
    stageCounts[m.stage] = (stageCounts[m.stage] || 0) + 1;
  }

  // Build media summary
  const mediaParts: string[] = [];
  if (stageCounts.before) mediaParts.push(`${stageCounts.before} before`);
  if (stageCounts.after) mediaParts.push(`${stageCounts.after} after`);
  if (stageCounts["in-progress"])
    mediaParts.push(`${stageCounts["in-progress"]} in-progress`);
  if (stageCounts.rendering)
    mediaParts.push(`${stageCounts.rendering} rendering`);
  if (stageCounts.other) mediaParts.push(`${stageCounts.other} other`);

  const mediaStr =
    mediaParts.length > 0
      ? `${media.length} photo${media.length !== 1 ? "s" : ""} (${mediaParts.join(", ")})`
      : "0 photos";

  const assetsStr =
    assets.length > 0
      ? `${assets.length} asset${assets.length !== 1 ? "s" : ""}`
      : "";

  // Combine parts
  const parts = [mediaStr];
  if (assetsStr) parts.push(assetsStr);

  console.log(`   ├─ ${label}: ${parts.join(", ")}`);
}

/**
 * Log final scan summary
 *
 * Shows aggregate statistics, errors, and warnings.
 *
 * @param components - All discovered components
 * @param errors - All errors encountered
 * @param warnings - All warnings generated
 * @param stats - Aggregate statistics
 */
function logFinalSummary(
  components: ComponentFiles[],
  errors: ScanError[],
  warnings: ScanWarning[],
  stats: ScanStats
): void {
  // Count images vs videos
  let imageCount = 0;
  let videoCount = 0;

  for (const component of components) {
    for (const media of component.media) {
      if (media.mediaType === "image") imageCount++;
      else if (media.mediaType === "video") videoCount++;
    }
  }

  // Print errors if any
  if (errors.length > 0) {
    console.log(`\n⚠️  Errors found:`);
    for (const error of errors) {
      const projectInfo = error.projectNumber
        ? `Project ${error.projectNumber}`
        : "";
      const componentInfo = error.component ? `, ${error.component}` : "";
      const context = projectInfo + componentInfo;
      console.log(`   ✗ ${context}: ${error.message}`);
    }
  }

  // Print warnings if any
  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings:`);
    for (const warning of warnings) {
      const projectInfo = warning.projectNumber
        ? `Project ${warning.projectNumber}`
        : "";
      const componentInfo = warning.component ? `, ${warning.component}` : "";
      const context = projectInfo + componentInfo;
      console.log(`   ⚠️  ${context}: ${warning.message}`);
    }
  }

  // Print summary
  console.log(`\n📊 Scan Summary:`);
  console.log(`   • Projects scanned: ${stats.totalProjects}`);
  console.log(`   • Components found: ${stats.totalComponents}`);
  console.log(
    `   • Total media files: ${stats.totalMedia} (${imageCount} images, ${videoCount} videos)`
  );
  console.log(`   • Total assets: ${stats.totalAssets}`);
  console.log(`   • Total size: ${formatBytes(stats.totalSize)}`);
  console.log(`   • Errors: ${errors.length}`);
  console.log(`   • Warnings: ${warnings.length}`);
  console.log(`   ⏱️  Scan time: ${(stats.scanTime / 1000).toFixed(1)}s`);
}

// Test harness for quick verification
if (require.main === module) {
  const assetsRoot =
    "/Users/eliharel/Code/Projects/ace-remodeling-assets";
  const projectNumbers = ["001", "187", "148"]; // Sample projects

  scanProjectFiles(assetsRoot, projectNumbers)
    .then((result) => {
      console.log("\n✅ Scan complete!");
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error("\n❌ Unhandled error:", error);
      process.exit(1);
    });
}

