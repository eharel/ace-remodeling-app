/**
 * Firebase Storage Upload Script
 *
 * Bulk uploads project photos and documents from local folders to Firebase Storage.
 * Features:
 * - Additive uploads only (preserves existing files)
 * - Intelligent folder name parsing and categorization
 * - Handles both images and PDF documents
 * - Generates Firestore-ready JSON data
 * - Comprehensive error handling and progress logging
 * - Supports dry-run mode and selective uploads
 *
 * Usage:
 *   npm run upload                           # Normal upload (defaults to kitchen)
 *   npm run upload -- --category bathroom    # Upload bathroom projects
 *   npm run upload -- --dry-run              # Preview without uploading
 *   npm run upload -- --force                # Re-upload existing files
 *   npm run upload -- --project 104          # Upload specific project only
 *
 * @module scripts/uploadPhotos
 */

import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import * as fs from "fs";
import * as path from "path";
import { storage } from "../core/config";
import {
  BASE_ASSETS_PATH,
  DEFAULT_OUTPUT_PATH,
  DOCUMENT_CATEGORY_MAPPINGS,
  DOCUMENT_EXTENSIONS,
  DOCUMENT_TYPE_NAMES,
  IMAGE_CATEGORY_MAPPINGS,
  IMAGE_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  MAX_RETRY_ATTEMPTS,
  MIME_TYPES,
  RETRY_DELAY_MS,
  SKIP_FILES,
  UPLOAD_BATCH_SIZE,
  VALID_CATEGORIES,
} from "./config/uploadConfig";
import {
  FirestoreData,
  FirestoreDocument,
  FirestorePhoto,
  FirestoreProject,
  LocalFile,
  ProjectInfo,
  ScanResult,
  SkippedFile,
  UploadedFile,
  UploadError,
  UploadOptions,
  UploadResult,
} from "./types/upload";

/**
 * Parse project folder name to extract project information
 *
 * Handles patterns like:
 * - "104 - Luxe Revival - Kitchen"
 * - "117 - Quiet Elegance - Kitchen"
 *
 * @param folderName - The folder name to parse
 * @returns Structured project information
 */
function parseProjectFolder(folderName: string): ProjectInfo | null {
  try {
    // Split on " - " delimiter
    const parts = folderName.split(" - ").map((p) => p.trim());

    if (parts.length < 2) {
      console.warn(`⚠️  Invalid folder name format: "${folderName}"`);
      return null;
    }

    const id = parts[0];
    const displayName = parts[1];
    const category = parts[2]?.toLowerCase() || "unknown";

    // Create slug (URL-friendly identifier)
    const slug = `${id}-${displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`;

    return {
      id,
      slug,
      displayName,
      category,
    };
  } catch (error) {
    console.error(`❌ Error parsing folder name "${folderName}":`, error);
    return null;
  }
}

/**
 * Parse subfolder name to extract the middle section for categorization
 *
 * Handles patterns like:
 * - "104 - After Photos - Kitchen" → "After Photos"
 * - "117 - 3D Remodeling - Kitchen" → "3D Remodeling"
 * - "120 - Plans - Kitchen" → "Plans"
 *
 * @param folderName - The subfolder name to parse
 * @returns The middle section (category descriptor)
 */
function parseSubfolderName(folderName: string): string {
  try {
    const parts = folderName.split(" - ").map((p) => p.trim());

    // Return middle section (index 1), or empty string if not enough parts
    return parts.length >= 2 ? parts[1] : folderName;
  } catch (error) {
    console.error(`❌ Error parsing subfolder name "${folderName}":`, error);
    return folderName;
  }
}

/**
 * Categorize folder name based on standardized mappings
 *
 * @param folderName - The folder name to categorize
 * @param isDocument - Whether this is for a document (vs image)
 * @returns Standardized category string
 */
function categorizeFolderName(folderName: string, isDocument: boolean): string {
  // Extract the middle section from patterns like "104 - After Photos - Kitchen"
  const middleSection = parseSubfolderName(folderName);

  // Normalize: lowercase and trim
  const normalized = middleSection.toLowerCase().trim();

  // Choose appropriate mapping
  const mappings = isDocument
    ? DOCUMENT_CATEGORY_MAPPINGS
    : IMAGE_CATEGORY_MAPPINGS;

  // Look up in mappings
  const category = mappings[normalized];

  // Return category or fallback to 'other'
  return category || "other";
}

/**
 * Determine file type based on extension
 *
 * @param extension - File extension (e.g., ".jpg", ".pdf")
 * @returns File type or 'skip' if not supported
 */
function getFileType(extension: string): "image" | "document" | "skip" {
  const lowerExt = extension.toLowerCase();

  if (IMAGE_EXTENSIONS.includes(lowerExt)) return "image";
  if (DOCUMENT_EXTENSIONS.includes(lowerExt)) return "document";
  return "skip";
}

/**
 * Get MIME type for file extension
 *
 * @param extension - File extension
 * @returns MIME type string
 */
function getMimeType(extension: string): string {
  return MIME_TYPES[extension.toLowerCase()] || "application/octet-stream";
}

/**
 * Check if filename should be skipped
 *
 * @param filename - The filename to check
 * @returns True if file should be skipped
 */
function shouldSkipFile(filename: string): boolean {
  // Skip system files
  if (SKIP_FILES.includes(filename)) return true;

  // Skip hidden files (starting with .)
  if (filename.startsWith(".")) return true;

  return false;
}

/**
 * Recursively scan local folder for project files
 *
 * @param basePath - Path to scan
 * @returns Scan result with file list and statistics
 */
function scanLocalFolder(basePath: string): ScanResult {
  console.log(`📁 Scanning local folder: ${basePath}`);

  const files: LocalFile[] = [];
  const projectFolders = new Set<string>();
  let skippedCount = 0;
  let totalSize = 0;

  try {
    // Check if base path exists
    if (!fs.existsSync(basePath)) {
      throw new Error(`Folder not found: ${basePath}`);
    }

    // Detect if this is adu-addition category (has subcategories)
    const categoryName = path.basename(basePath);
    const isAduAddition = categoryName === "adu-addition";

    // Build list of folders to scan (with optional subcategory)
    let foldersToScan: { path: string; name: string; subcategory?: string }[] =
      [];

    if (isAduAddition) {
      // Two-level nesting: adu-addition/subcategory/project
      console.log(
        `   Detected adu-addition category - scanning for subcategories...`
      );

      const subcategoryDirs = fs
        .readdirSync(basePath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .filter((dirent) => !shouldSkipFile(dirent.name));

      for (const subcatDir of subcategoryDirs) {
        const subcatPath = path.join(basePath, subcatDir.name);
        const subcategoryName = subcatDir.name.toLowerCase();

        console.log(`   Found subcategory: ${subcategoryName}`);

        // Get project folders within subcategory
        const projectsInSubcat = fs
          .readdirSync(subcatPath, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .filter((dirent) => !shouldSkipFile(dirent.name));

        for (const projDir of projectsInSubcat) {
          foldersToScan.push({
            path: subcatPath,
            name: projDir.name,
            subcategory: subcategoryName,
          });
        }
      }
    } else {
      // Single-level: category/project
      const projectDirs = fs
        .readdirSync(basePath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .filter((dirent) => !shouldSkipFile(dirent.name));

      for (const projDir of projectDirs) {
        foldersToScan.push({
          path: basePath,
          name: projDir.name,
          subcategory: undefined,
        });
      }
    }

    // Process each project folder
    for (const {
      path: parentPath,
      name: projectName,
      subcategory,
    } of foldersToScan) {
      const projectPath = path.join(parentPath, projectName);
      const projectInfo = parseProjectFolder(projectName);

      if (!projectInfo) {
        console.warn(`⚠️  Skipping invalid project folder: ${projectName}`);
        continue;
      }

      // Add subcategory to projectInfo
      if (subcategory) {
        projectInfo.subcategory = subcategory;
      }

      projectFolders.add(projectInfo.slug);

      // Get subfolders within project
      const subfolders = fs
        .readdirSync(projectPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .filter((dirent) => !shouldSkipFile(dirent.name));

      // Process each subfolder
      for (const subfolder of subfolders) {
        const subfolderPath = path.join(projectPath, subfolder.name);

        // Get all files in subfolder
        const fileEntries = fs
          .readdirSync(subfolderPath, { withFileTypes: true })
          .filter((dirent) => dirent.isFile())
          .filter((dirent) => !shouldSkipFile(dirent.name));

        // Process each file
        for (const fileEntry of fileEntries) {
          const filePath = path.join(subfolderPath, fileEntry.name);
          const extension = path.extname(fileEntry.name).toLowerCase();
          const fileType = getFileType(extension);

          if (fileType === "skip") {
            skippedCount++;
            continue;
          }

          // Get file stats
          const stats = fs.statSync(filePath);
          const fileSize = stats.size;
          totalSize += fileSize;

          // Warn about large files
          if (fileSize > MAX_FILE_SIZE_MB * 1024 * 1024) {
            console.warn(
              `⚠️  Large file (${(fileSize / 1024 / 1024).toFixed(1)} MB): ${
                fileEntry.name
              }`
            );
          }

          // Categorize based on subfolder name
          const category = categorizeFolderName(
            subfolder.name,
            fileType === "document"
          );

          files.push({
            projectInfo,
            category,
            subcategory,
            fileType,
            filename: fileEntry.name,
            localPath: filePath,
            size: fileSize,
            extension,
          });
        }
      }
    }

    const imageCount = files.filter((f) => f.fileType === "image").length;
    const documentCount = files.filter((f) => f.fileType === "document").length;

    console.log(
      `   Found ${projectFolders.size} projects, ${files.length} files total`
    );
    console.log(`   Images: ${imageCount} files`);
    console.log(`   Documents: ${documentCount} files`);
    console.log(`   Skipped: ${skippedCount} files`);

    return {
      files,
      projectCount: projectFolders.size,
      imageCount,
      documentCount,
      skippedCount,
      totalSize,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to scan local folder: ${errorMessage}`);
  }
}

/**
 * Get list of existing files in Firebase Storage for a project
 *
 * @param projectSlug - Project slug identifier
 * @returns Set of existing file paths
 */
async function getExistingFiles(projectSlug: string): Promise<Set<string>> {
  try {
    const existingPaths = new Set<string>();
    const projectRef = ref(storage, `projects/${projectSlug}/`);

    // List all files recursively
    const result = await listAll(projectRef);

    result.items.forEach((item) => {
      existingPaths.add(item.fullPath);
    });

    // Recursively list subfolders
    for (const folderRef of result.prefixes) {
      const subResult = await listAll(folderRef);
      subResult.items.forEach((item) => {
        existingPaths.add(item.fullPath);
      });

      // One more level deep for nested folders
      for (const subFolderRef of subResult.prefixes) {
        const deepResult = await listAll(subFolderRef);
        deepResult.items.forEach((item) => {
          existingPaths.add(item.fullPath);
        });
      }
    }

    return existingPaths;
  } catch (error) {
    // If project doesn't exist yet, return empty set
    return new Set<string>();
  }
}

/**
 * Upload a single file to Firebase Storage with retry logic
 *
 * @param file - Local file to upload
 * @param existingFiles - Set of existing file paths
 * @param options - Upload options
 * @returns Uploaded file data or null if skipped
 */
async function uploadFile(
  file: LocalFile,
  existingFiles: Set<string>,
  options: UploadOptions
): Promise<UploadedFile | null> {
  const {
    projectInfo,
    category,
    fileType,
    filename,
    localPath,
    size,
    extension,
  } = file;

  // Construct storage path
  const folderType = fileType === "image" ? "photos" : "documents";
  const storagePath = `projects/${projectInfo.slug}/${folderType}/${category}/${filename}`;

  // Check if file already exists
  if (existingFiles.has(storagePath) && !options.force) {
    // File exists - fetch its URL for JSON generation
    try {
      const storageRef = ref(storage, storagePath);
      const downloadURL = await getDownloadURL(storageRef);

      return {
        projectId: projectInfo.id,
        projectSlug: projectInfo.slug,
        projectName: projectInfo.displayName,
        category,
        subcategory: projectInfo.subcategory,
        fileType,
        filename,
        url: downloadURL,
        storagePath,
        size,
        uploadedAt: new Date().toISOString(),
        wasNewlyUploaded: false,
      };
    } catch (error) {
      console.warn(`⚠️  Could not get URL for ${filename}, skipping from JSON`);
      return null;
    }
  }

  // Dry run mode - don't actually upload
  if (options.dryRun) {
    return {
      projectId: projectInfo.id,
      projectSlug: projectInfo.slug,
      projectName: projectInfo.displayName,
      category,
      subcategory: projectInfo.subcategory,
      fileType,
      filename,
      url: `[DRY RUN] ${storagePath}`,
      storagePath,
      size,
      uploadedAt: new Date().toISOString(),
      wasNewlyUploaded: true,
    };
  }

  // Actual upload with retry logic
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < MAX_RETRY_ATTEMPTS) {
    try {
      // Read file
      const fileBuffer = fs.readFileSync(localPath);

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, fileBuffer, {
        contentType: getMimeType(extension),
      });

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        projectId: projectInfo.id,
        projectSlug: projectInfo.slug,
        projectName: projectInfo.displayName,
        category,
        subcategory: projectInfo.subcategory,
        fileType,
        filename,
        url: downloadURL,
        storagePath,
        size,
        uploadedAt: new Date().toISOString(),
        wasNewlyUploaded: true,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      if (attempt < MAX_RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(
          `   ⏳ Retry ${attempt}/${MAX_RETRY_ATTEMPTS} after ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  throw lastError || new Error("Upload failed after retries");
}

/**
 * Upload files in batches
 *
 * @param files - Files to upload
 * @param options - Upload options
 * @returns Upload result with statistics
 */
async function uploadFiles(
  files: LocalFile[],
  options: UploadOptions
): Promise<UploadResult> {
  const startTime = Date.now();
  const uploaded: UploadedFile[] = [];
  const skipped: SkippedFile[] = [];
  const errors: UploadError[] = [];

  // Group files by project
  const projectGroups = new Map<string, LocalFile[]>();
  for (const file of files) {
    const projectSlug = file.projectInfo.slug;
    if (!projectGroups.has(projectSlug)) {
      projectGroups.set(projectSlug, []);
    }
    projectGroups.get(projectSlug)!.push(file);
  }

  console.log(`\n📦 Projects to upload:`);
  for (const [projectSlug, projectFiles] of projectGroups) {
    const images = projectFiles.filter((f) => f.fileType === "image").length;
    const docs = projectFiles.filter((f) => f.fileType === "document").length;
    const projectName = projectFiles[0].projectInfo.displayName;
    console.log(
      `   • ${projectSlug} "${projectName}" (${projectFiles.length} files: ${images} images, ${docs} docs)`
    );
  }

  console.log(`\n🔧 Starting uploads...\n`);

  // Process each project
  for (const [projectSlug, projectFiles] of projectGroups) {
    console.log(`[${projectSlug}]`);

    // Get existing files for this project
    const existingFiles = await getExistingFiles(projectSlug);
    if (existingFiles.size > 0 && !options.force) {
      console.log(`   Found ${existingFiles.size} existing file(s) in storage`);
    }

    // Group by type for organized output
    const images = projectFiles.filter((f) => f.fileType === "image");
    const documents = projectFiles.filter((f) => f.fileType === "document");

    // Upload images
    if (images.length > 0) {
      console.log(`  Photos:`);
      for (let i = 0; i < images.length; i += options.batchSize) {
        const batch = images.slice(i, i + options.batchSize);
        const batchResults = await Promise.allSettled(
          batch.map((file) => uploadFile(file, existingFiles, options))
        );

        for (let j = 0; j < batchResults.length; j++) {
          const result = batchResults[j];
          const file = batch[j];

          if (result.status === "fulfilled") {
            if (result.value) {
              uploaded.push(result.value);
              const sizeMB = (file.size / 1024 / 1024).toFixed(1);

              if (result.value.wasNewlyUploaded) {
                console.log(
                  `    ✅ Uploaded: ${file.category}/${file.filename} (${sizeMB} MB)`
                );
              } else {
                console.log(
                  `    ✓  Exists: ${file.category}/${file.filename} (${sizeMB} MB)`
                );
              }
            } else {
              skipped.push({
                path: `${file.projectInfo.slug}/${file.fileType}s/${file.category}/${file.filename}`,
                reason: "already exists",
                size: file.size,
              });
              console.log(
                `    ⏭️  Skipped: ${file.category}/${file.filename} (already exists)`
              );
            }
          } else {
            errors.push({
              file: file.filename,
              error: result.reason?.message || "Unknown error",
              localPath: file.localPath,
            });
            console.error(
              `    ❌ Error: ${file.filename} - ${result.reason?.message}`
            );
          }
        }
      }
    }

    // Upload documents
    if (documents.length > 0) {
      console.log(`  Documents:`);
      for (let i = 0; i < documents.length; i += options.batchSize) {
        const batch = documents.slice(i, i + options.batchSize);
        const batchResults = await Promise.allSettled(
          batch.map((file) => uploadFile(file, existingFiles, options))
        );

        for (let j = 0; j < batchResults.length; j++) {
          const result = batchResults[j];
          const file = batch[j];

          if (result.status === "fulfilled") {
            if (result.value) {
              uploaded.push(result.value);
              const sizeMB = (file.size / 1024 / 1024).toFixed(1);

              if (result.value.wasNewlyUploaded) {
                console.log(
                  `    ✅ Uploaded: ${file.category}/${file.filename} (${sizeMB} MB)`
                );
              } else {
                console.log(
                  `    ✓  Exists: ${file.category}/${file.filename} (${sizeMB} MB)`
                );
              }
            } else {
              skipped.push({
                path: `${file.projectInfo.slug}/${file.fileType}s/${file.category}/${file.filename}`,
                reason: "already exists",
                size: file.size,
              });
              console.log(
                `    ⏭️  Skipped: ${file.category}/${file.filename} (already exists)`
              );
            }
          } else {
            errors.push({
              file: file.filename,
              error: result.reason?.message || "Unknown error",
              localPath: file.localPath,
            });
            console.error(
              `    ❌ Error: ${file.filename} - ${result.reason?.message}`
            );
          }
        }
      }
    }

    console.log(""); // Empty line between projects
  }

  const duration = Date.now() - startTime;
  const totalSize = uploaded.reduce((sum, file) => sum + file.size, 0);
  const imageCount = uploaded.filter((f) => f.fileType === "image").length;
  const documentCount = uploaded.filter(
    (f) => f.fileType === "document"
  ).length;

  return {
    uploaded,
    skipped,
    errors,
    summary: {
      totalFiles: files.length,
      uploadedCount: uploaded.length,
      skippedCount: skipped.length,
      errorCount: errors.length,
      totalSize,
      duration,
      imageCount,
      documentCount,
    },
  };
}

/**
 * Generate Firestore-ready data from uploaded files
 *
 * @param uploadedFiles - List of uploaded files
 * @param category - Project category (e.g., "kitchen")
 * @returns Firestore data structure
 */
function generateFirestoreData(
  uploadedFiles: UploadedFile[],
  category: string
): FirestoreData {
  // Group by project
  const projectMap = new Map<string, UploadedFile[]>();

  for (const file of uploadedFiles) {
    if (!projectMap.has(file.projectSlug)) {
      projectMap.set(file.projectSlug, []);
    }
    projectMap.get(file.projectSlug)!.push(file);
  }

  // Build project data
  const projects: FirestoreProject[] = [];

  for (const [projectSlug, projectFiles] of projectMap) {
    const firstFile = projectFiles[0];

    // Separate images and documents
    const imageFiles = projectFiles.filter((f) => f.fileType === "image");
    const documentFiles = projectFiles.filter((f) => f.fileType === "document");

    // Build photos array
    const photos: FirestorePhoto[] = imageFiles.map((file, index) => ({
      url: file.url,
      category: file.category,
      filename: file.filename,
      storagePath: file.storagePath,
      size: file.size,
      order: index + 1,
    }));

    // Build documents array
    const documents: FirestoreDocument[] = documentFiles.map((file) => ({
      url: file.url,
      category: file.category,
      filename: file.filename,
      storagePath: file.storagePath,
      size: file.size,
      type: DOCUMENT_TYPE_NAMES[file.category] || "Document",
    }));

    projects.push({
      id: firstFile.projectId,
      slug: projectSlug,
      name: firstFile.projectName,
      category,
      subcategory: firstFile.subcategory,
      photos,
      documents,
    });
  }

  // Sort projects by ID
  projects.sort((a, b) => {
    const aNum = parseInt(a.id);
    const bNum = parseInt(b.id);
    return aNum - bNum;
  });

  return {
    uploadDate: new Date().toISOString(),
    category,
    totalProjects: projects.length,
    projects,
  };
}

/**
 * Save Firestore data to JSON file
 *
 * @param data - Firestore data to save
 * @param outputPath - Output directory path
 * @param category - Project category
 */
function saveFirestoreData(
  data: FirestoreData,
  outputPath: string,
  category: string
): void {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const filename = `${category}-projects.json`;
    const filepath = path.join(outputPath, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");

    console.log(`💾 Firestore data saved to: ${filepath}`);
  } catch (error) {
    console.error(`❌ Error saving Firestore data:`, error);
  }
}

/**
 * Parse command-line arguments
 *
 * @param args - Process arguments
 * @returns Upload options
 */
function parseArguments(args: string[]): UploadOptions {
  const options: UploadOptions = {
    dryRun: false,
    force: false,
    outputPath: DEFAULT_OUTPUT_PATH,
    batchSize: UPLOAD_BATCH_SIZE,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--project" && i + 1 < args.length) {
      options.project = args[i + 1];
      i++;
    } else if (arg === "--output" && i + 1 < args.length) {
      options.outputPath = args[i + 1];
      i++;
    } else if (arg === "--batch-size" && i + 1 < args.length) {
      options.batchSize = parseInt(args[i + 1]);
      i++;
    }
  }

  return options;
}

/**
 * Format file size for display
 *
 * @param bytes - Size in bytes
 * @returns Formatted string
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Format duration for display
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted string
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Main function - orchestrates the upload process
 */
async function main(): Promise<void> {
  console.log("\n🚀 Firebase Storage Upload Script");
  console.log("=====================================");

  // Log environment
  const isProduction = process.env.NODE_ENV === "production";
  const environment = isProduction ? "production" : "development";
  console.log(`🔧 Environment: ${environment}`);
  console.log(
    `🗄️  Target Storage: ${
      isProduction ? "ace-remodeling" : "ace-remodeling-dev"
    }`
  );

  if (isProduction) {
    console.log(
      "\n⚠️  WARNING: You are about to upload to PRODUCTION storage!"
    );
    console.log("Press Ctrl+C within 5 seconds to cancel...\n");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  console.log(""); // Empty line

  // Parse command-line arguments to get category FIRST
  const args = process.argv.slice(2);
  const categoryIndex = args.indexOf("--category");
  const category = categoryIndex !== -1 ? args[categoryIndex + 1] : "kitchen";

  // Validate category
  if (!VALID_CATEGORIES.includes(category as any)) {
    console.error(`❌ Invalid category: ${category}`);
    console.error(`   Valid categories: ${VALID_CATEGORIES.join(", ")}`);
    process.exit(1);
  }

  // Build path dynamically based on category
  const LOCAL_PHOTOS_PATH = path.join(BASE_ASSETS_PATH, category);

  console.log(`📂 Category: ${category}`);
  console.log(`📁 Scanning path: ${LOCAL_PHOTOS_PATH}\n`);

  // Show security reminder
  console.log("⚠️  IMPORTANT: Ensure Firebase Storage rules allow writes");
  console.log("   Go to: Firebase Console → Storage → Rules");
  console.log("   Temporarily set: allow write: if true;");
  console.log("   (Remember to secure after uploading!)\n");

  try {
    // Parse command-line arguments
    const options = parseArguments(args);

    if (options.dryRun) {
      console.log("🔍 DRY RUN MODE - No files will be uploaded\n");
    }

    if (options.force) {
      console.log("⚠️  FORCE MODE - Will re-upload existing files\n");
    }

    // Scan local folder
    const scanResult = scanLocalFolder(LOCAL_PHOTOS_PATH);

    if (scanResult.files.length === 0) {
      console.log("❌ No files found to upload\n");
      process.exit(0);
    }

    // Filter by project if specified
    let filesToUpload = scanResult.files;
    if (options.project) {
      filesToUpload = scanResult.files.filter(
        (f) => f.projectInfo.id === options.project
      );

      if (filesToUpload.length === 0) {
        console.log(`❌ No files found for project: ${options.project}\n`);
        process.exit(1);
      }

      console.log(`\n📌 Filtering to project: ${options.project}`);
    }

    // Check Firebase connection
    console.log("\n🔄 Checking Firebase Storage connection...");

    // Upload files
    const uploadResult = await uploadFiles(filesToUpload, options);

    // Print summary
    const newlyUploaded = uploadResult.uploaded.filter(
      (f) => f.wasNewlyUploaded
    );
    const existing = uploadResult.uploaded.filter((f) => !f.wasNewlyUploaded);

    console.log("=====================================");
    console.log("📊 Upload Summary");
    console.log("=====================================");
    console.log(`✅ Total files processed: ${uploadResult.summary.totalFiles}`);
    console.log(`✅ Files uploaded: ${newlyUploaded.length}`);
    console.log(`✓  Files already existed: ${existing.length}`);
    console.log(`   - Images: ${uploadResult.summary.imageCount}`);
    console.log(`   - Documents: ${uploadResult.summary.documentCount}`);
    console.log(`⏭️  Files skipped: ${uploadResult.summary.skippedCount}`);
    console.log(`❌ Errors: ${uploadResult.summary.errorCount}`);
    console.log(
      `📦 Total size uploaded: ${formatSize(uploadResult.summary.totalSize)}`
    );
    console.log(
      `⏱️  Duration: ${formatDuration(uploadResult.summary.duration)}`
    );

    // Show errors if any
    if (uploadResult.errors.length > 0) {
      console.log("\n❌ Errors encountered:");
      uploadResult.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.file}: ${error.error}`);
      });
    }

    // Generate and save Firestore data (only for successful uploads)
    if (uploadResult.uploaded.length > 0 && !options.dryRun) {
      // Category already parsed at start of main(), use it directly
      const firestoreData = generateFirestoreData(
        uploadResult.uploaded,
        category
      );
      saveFirestoreData(firestoreData, options.outputPath, category);
    }

    console.log("\n🎉 Upload complete!\n");

    if (!options.dryRun) {
      console.log("⚠️  REMINDER: Secure your Firebase Storage rules!");
      console.log("   Set: allow write: if false;\n");
    }

    // Exit with appropriate code
    process.exit(uploadResult.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    console.error();
    process.exit(1);
  }
}

// Execute the script
main();
