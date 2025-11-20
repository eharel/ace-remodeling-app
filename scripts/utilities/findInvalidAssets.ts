import * as fs from "fs";
import * as path from "path";

const ASSETS_BASE_PATH = "/Users/eliharel/Code/Projects/ace-remodeling-assets";

// File extensions that should NOT be in /assets/
// These are unsupported formats that should be converted or moved
const INVALID_EXTENSIONS = [
  ".gif",
  ".GIF", // Animated images (not supported)
  ".bmp",
  ".BMP", // Bitmap (use PNG instead)
  ".tiff",
  ".TIFF", // TIFF (use PNG instead)
  ".svg",
  ".SVG", // Vector graphics (not supported as document)
  ".mp4",
  ".MP4", // Videos (should be in /videos/)
  ".mov",
  ".MOV", // Videos (should be in /videos/)
  ".avi",
  ".AVI", // Videos (should be in /videos/)
];

// Valid document extensions
// PDFs and supported image formats are now valid in /assets/
// This is for reference/documentation - the script checks for invalid extensions
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VALID_EXTENSIONS = [
  ".pdf",
  ".PDF", // PDFs
  ".jpg",
  ".jpeg",
  ".JPG",
  ".JPEG", // Images ✅ NOW VALID
  ".png",
  ".PNG", // Images ✅ NOW VALID
  ".heic",
  ".HEIC", // Images ✅ NOW VALID
];

interface InvalidAsset {
  projectNumber: string;
  component: string;
  category: string;
  filename: string;
  fullPath: string;
  extension: string;
}

function scanAssetsFolder(basePath: string): InvalidAsset[] {
  const invalidAssets: InvalidAsset[] = [];

  if (!fs.existsSync(basePath)) {
    console.error(`❌ Path does not exist: ${basePath}`);
    return invalidAssets;
  }

  // Get all project folders
  const projectFolders = fs
    .readdirSync(basePath)
    .filter((name) => fs.statSync(path.join(basePath, name)).isDirectory());

  for (const projectNumber of projectFolders) {
    const projectPath = path.join(basePath, projectNumber);

    // Get all component folders
    const componentFolders = fs.readdirSync(projectPath).filter((name) => {
      const fullPath = path.join(projectPath, name);
      return fs.statSync(fullPath).isDirectory();
    });

    for (const component of componentFolders) {
      const assetsPath = path.join(projectPath, component, "assets");

      if (!fs.existsSync(assetsPath)) continue;

      // Scan all subdirectories in assets/
      scanAssetsRecursive(assetsPath, projectNumber, component, invalidAssets);
    }
  }

  return invalidAssets;
}

function scanAssetsRecursive(
  dirPath: string,
  projectNumber: string,
  component: string,
  results: InvalidAsset[]
) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recurse into subdirectory
      scanAssetsRecursive(fullPath, projectNumber, component, results);
    } else if (stat.isFile()) {
      const ext = path.extname(item);

      // Check if this is an invalid file type
      if (INVALID_EXTENSIONS.includes(ext)) {
        // Determine category from parent folder name
        const parentFolder = path.basename(path.dirname(fullPath));

        results.push({
          projectNumber,
          component,
          category: parentFolder,
          filename: item,
          fullPath,
          extension: ext,
        });
      }
    }
  }
}

function printResults(invalidAssets: InvalidAsset[]) {
  console.log("\n╔════════════════════════════════════════╗");
  console.log("║  Invalid Assets Report                ║");
  console.log("╚════════════════════════════════════════╝\n");

  if (invalidAssets.length === 0) {
    console.log(
      "✅ No invalid assets found! All files in /assets/ are PDFs or supported images.\n"
    );
    return;
  }

  console.log(
    `❌ Found ${invalidAssets.length} unsupported files in /assets/ folders:\n`
  );

  // Group by project
  const byProject = invalidAssets.reduce((acc, asset) => {
    if (!acc[asset.projectNumber]) {
      acc[asset.projectNumber] = [];
    }
    acc[asset.projectNumber].push(asset);
    return acc;
  }, {} as Record<string, InvalidAsset[]>);

  for (const [projectNumber, assets] of Object.entries(byProject)) {
    console.log(`\n📁 Project ${projectNumber}:`);

    for (const asset of assets) {
      console.log(
        `   ⚠️  ${asset.component}/${asset.category}/${asset.filename}`
      );
      console.log(`      Path: ${asset.fullPath}`);
      console.log(`      Type: ${asset.extension}`);
    }
  }

  console.log("\n\n📋 Summary by file type:");
  const byExtension = invalidAssets.reduce((acc, asset) => {
    acc[asset.extension] = (acc[asset.extension] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  for (const [ext, count] of Object.entries(byExtension)) {
    console.log(`   ${ext}: ${count} files`);
  }

  console.log("\n\n💡 Recommendations:");
  console.log(
    "   1. Convert unsupported formats to PDF or supported image formats"
  );
  console.log("   2. Move videos to /videos/ folder");
  console.log("   3. Re-run this script after making changes");
  console.log("   4. Re-upload: npm run upload -- --clear\n");
}

// Main execution
const invalidAssets = scanAssetsFolder(ASSETS_BASE_PATH);
printResults(invalidAssets);
