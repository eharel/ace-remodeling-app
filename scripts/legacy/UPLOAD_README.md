# Firebase Storage Upload Script Documentation

Comprehensive documentation for the bulk photo and document upload system.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Command-Line Options](#command-line-options)
- [Folder Structure Requirements](#folder-structure-requirements)
- [Category Mappings](#category-mappings)
- [Usage Examples](#usage-examples)
- [Output Files](#output-files)
- [Troubleshooting](#troubleshooting)
- [Security](#security)

## Overview

This script bulk uploads project photos and documents from local folders to Firebase Storage. It's designed to handle real-world remodeling project assets with intelligent categorization and organization.

### Key Features

✅ **Additive uploads only** - Preserves existing files, never deletes  
✅ **Intelligent categorization** - Auto-categorizes based on folder names  
✅ **Dual file type support** - Handles both images (JPG, PNG, HEIC, WebP) and documents (PDF)  
✅ **Progress tracking** - Clear console output with emojis for visual scanning  
✅ **Error resilience** - Continues processing even if individual files fail  
✅ **Retry logic** - Automatic retries with exponential backoff  
✅ **Firestore data generation** - Creates JSON ready for database seeding  
✅ **Dry-run mode** - Preview without uploading  
✅ **Batch processing** - Uploads multiple files in parallel

## Prerequisites

### 1. Firebase Configuration

Ensure Firebase is properly configured in `config/firebase.ts` with Storage enabled.

### 2. Firebase Storage Rules

**IMPORTANT:** Temporarily update your Firebase Storage security rules to allow writes.

Go to: **Firebase Console → Storage → Rules**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;  // ⚠️ TEMPORARY - for development only
    }
  }
}
```

⚠️ **Remember to secure these rules after uploading!**

### 3. Local Folder Structure

Update the path in `scripts/config/uploadConfig.ts`:

```typescript
export const LOCAL_PHOTOS_PATH = "/path/to/your/local/assets/kitchen";
```

### 4. Dependencies

Ensure all packages are installed:

```bash
npm install
```

## Quick Start

### 1. Preview (Dry Run)

Always start with a dry run to preview what will be uploaded:

```bash
npm run upload:dry-run
```

### 2. Upload Files

Once you've verified the preview looks correct:

```bash
npm run upload
```

### 3. Check Firebase Console

Verify files in: **Firebase Console → Storage → Files**

### 4. Secure Storage Rules

After uploading, **immediately** secure your Firebase Storage rules!

## Command-Line Options

### Basic Commands

```bash
# Normal upload (skips existing files)
npm run upload

# Preview without uploading
npm run upload:dry-run

# Force re-upload all files (updates URLs)
npm run upload:force
```

### Advanced Options

```bash
# Upload specific project only
npm run upload -- --project 104

# Custom output path for generated JSON
npm run upload -- --output ./data/uploads/

# Adjust batch size (default: 10)
npm run upload -- --batch-size 5

# Combine options
npm run upload -- --project 117 --dry-run
```

### Option Reference

| Option             | Description                   | Example                              |
| ------------------ | ----------------------------- | ------------------------------------ |
| `--dry-run`        | Preview without uploading     | `npm run upload:dry-run`             |
| `--force`          | Re-upload existing files      | `npm run upload:force`               |
| `--project <id>`   | Upload specific project only  | `npm run upload -- --project 104`    |
| `--output <path>`  | Custom output directory       | `npm run upload -- --output ./data/` |
| `--batch-size <n>` | Files per batch (default: 10) | `npm run upload -- --batch-size 20`  |

## Folder Structure Requirements

### Local Folder Organization

Your local assets folder should follow this structure:

```
/Users/you/ace-remodeling-assets/kitchen/
├── 104 - Luxe Revival - Kitchen/
│   ├── 104 - After Photos - Kitchen/
│   │   ├── IMG_1234.jpg
│   │   ├── IMG_1235.jpg
│   │   └── IMG_1236.jpg
│   ├── 104 - Before Images - Kitchen/
│   │   ├── IMG_0001.jpg
│   │   └── IMG_0002.jpg
│   ├── 104 - 3D Remodeling - Kitchen/
│   │   └── rendering.pdf
│   └── 104 - Plans - Kitchen/
│       └── floor-plan.pdf
├── 117 - Quiet Elegance - Kitchen/
│   ├── 117 - After Photos - Kitchen/
│   ├── 117 - Before Photos - Kitchen/
│   └── 117 - During Construction - Kitchen/
└── ... (more projects)
```

### Naming Patterns

**Project folders:** `{number} - {name} - {category}`

- Example: `104 - Luxe Revival - Kitchen`
- Extracts: ID = "104", Name = "Luxe Revival"

**Subfolders:** `{number} - {type} - {category}`

- Example: `104 - After Photos - Kitchen`
- Extracts: Type = "After Photos" → Category = "after"

### Firebase Storage Structure

Files are uploaded to this organized structure:

```
projects/
├── 104-luxe-revival/
│   ├── photos/
│   │   ├── after/
│   │   │   ├── IMG_1234.jpg
│   │   │   ├── IMG_1235.jpg
│   │   │   └── IMG_1236.jpg
│   │   ├── before/
│   │   │   ├── IMG_0001.jpg
│   │   │   └── IMG_0002.jpg
│   │   ├── progress/
│   │   └── rendering/
│   └── documents/
│       ├── plans/
│       │   └── floor-plan.pdf
│       └── rendering/
│           └── rendering.pdf
└── 117-quiet-elegance/
    └── ... (same structure)
```

## Category Mappings

The script intelligently maps folder names to standardized categories:

### Image Categories

| Folder Name Variations                                                  | Mapped Category |
| ----------------------------------------------------------------------- | --------------- |
| "After Photos", "After Images", "After", "Completed", "Final"           | `after`         |
| "Before Photos", "Before Images", "Before", "Existing", "Original"      | `before`        |
| "During Construction", "Construction", "In Progress", "Progress", "WIP" | `progress`      |
| "3D Rendering", "3D Remodeling", "Rendering", "Mockup"                  | `rendering`     |
| "Materials", "Samples", "Finishes"                                      | `materials`     |
| Anything else                                                           | `other`         |

### Document Categories

| Folder Name Variations                       | Mapped Category  |
| -------------------------------------------- | ---------------- |
| "Plans", "Blueprints", "Floor Plans"         | `plans`          |
| "3D Rendering", "3D Remodeling", "Rendering" | `rendering`      |
| "Contracts", "Contract", "Agreement"         | `contracts`      |
| "Invoices", "Invoice", "Bills"               | `invoices`       |
| "Permits", "Permit"                          | `permits`        |
| "Specifications", "Specs", "Spec"            | `specifications` |
| Anything else                                | `other`          |

### Customizing Mappings

Edit `scripts/config/uploadConfig.ts`:

```typescript
export const IMAGE_CATEGORY_MAPPINGS: Record<string, string> = {
  "after photos": "after",
  "your custom name": "after", // Add your variations
  // ... more mappings
};
```

## Usage Examples

### Example 1: First-Time Upload

```bash
# 1. Preview what will be uploaded
npm run upload:dry-run

# Output:
# 📁 Scanning local folder...
#    Found 11 projects, 263 files total
#    Images: 245 files
#    Documents: 18 files

# 2. Verify the preview looks correct

# 3. Upload for real
npm run upload

# 4. Check Firebase Console to verify
```

### Example 2: Adding New Project

```bash
# Upload just the new project #148
npm run upload -- --project 148

# Output:
# 📌 Filtering to project: 148
# [148-hilltop-retreat]
#   Photos:
#     ✅ Uploaded: after/IMG_1234.jpg (2.3 MB)
#     ✅ Uploaded: before/IMG_5678.jpg (1.8 MB)
#   Documents:
#     ✅ Uploaded: plans/floor-plan.pdf (0.8 MB)
```

### Example 3: Updating Existing Project

If you add more photos to an existing project:

```bash
# Normal upload automatically skips existing files
npm run upload -- --project 104

# Output:
#   Photos:
#     ⏭️  Skipped: after/IMG_1234.jpg (already exists)
#     ⏭️  Skipped: before/IMG_5678.jpg (already exists)
#     ✅ Uploaded: after/IMG_9999.jpg (2.1 MB)  # New file!
```

### Example 4: Re-uploading Everything

If you need to regenerate all URLs (rare):

```bash
# ⚠️ Use with caution - re-uploads everything
npm run upload:force

# This will:
# - Re-upload all files even if they exist
# - Generate new download URLs
# - Update the generated JSON with new URLs
```

## Output Files

### Generated JSON Structure

Location: `scripts/output/kitchen-projects.json`

```json
{
  "uploadDate": "2025-10-14T20:30:00.000Z",
  "category": "kitchen",
  "totalProjects": 11,
  "projects": [
    {
      "id": "104",
      "slug": "104-luxe-revival",
      "name": "Luxe Revival",
      "category": "kitchen",
      "photos": [
        {
          "url": "https://firebasestorage.googleapis.com/v0/b/...",
          "category": "after",
          "filename": "IMG_1234.jpg",
          "storagePath": "projects/104-luxe-revival/photos/after/IMG_1234.jpg",
          "size": 2457600,
          "order": 1
        }
      ],
      "documents": [
        {
          "url": "https://firebasestorage.googleapis.com/...",
          "category": "plans",
          "filename": "floor-plan.pdf",
          "storagePath": "projects/104-luxe-revival/documents/plans/floor-plan.pdf",
          "size": 819200,
          "type": "Floor Plan"
        }
      ]
    }
  ]
}
```

### Using Generated Data

Integrate the generated JSON into your seed data:

1. Copy the relevant project data from `kitchen-projects.json`
2. Add to your `data/seedData.ts` file
3. Map the URLs to the `pictures` and `documents` arrays
4. Run `npm run seed` to update Firestore

## Troubleshooting

### Error: "Folder not found"

**Problem:** The LOCAL_PHOTOS_PATH in config doesn't exist.

**Solution:**

```typescript
// Update scripts/config/uploadConfig.ts
export const LOCAL_PHOTOS_PATH = "/correct/path/to/your/assets/kitchen";
```

### Error: "PERMISSION_DENIED"

**Problem:** Firebase Storage rules are blocking uploads.

**Solution:**

1. Go to Firebase Console → Storage → Rules
2. Temporarily set: `allow write: if true;`
3. Remember to secure after uploading!

### Error: "Network request failed"

**Problem:** Network timeout or connection issues.

**Solution:**

- Check your internet connection
- Try reducing batch size: `npm run upload -- --batch-size 5`
- The script will automatically retry failed uploads

### Files Not Categorized Correctly

**Problem:** Files are uploaded to the "other" category.

**Solution:**

1. Check folder naming matches expected patterns
2. Review `scripts/config/uploadConfig.ts` mappings
3. Add your specific folder name variations to the mappings
4. Run `npm run upload:force` to re-upload with correct categories

### Warning: "Large file"

**Problem:** File is over 50MB.

**Solution:**

- This is just a warning - file will still upload
- Consider optimizing very large images
- Increase timeout if needed (edit MAX_RETRY_ATTEMPTS in config)

### Upload Stuck or Hanging

**Problem:** Script seems frozen during upload.

**Solution:**

1. Check Firebase Console for quota limits
2. Reduce batch size: `npm run upload -- --batch-size 3`
3. Check network stability
4. Look for error messages in console

### Duplicate Filenames

**Problem:** Multiple files with same name in one category.

**Solution:**

- Files with duplicate names will overwrite each other
- Rename files to be unique before uploading
- Consider adding prefixes: `room1-after.jpg`, `room2-after.jpg`

### Storage Quota Exceeded

**Problem:** Firebase free tier storage limit reached.

**Solution:**

1. Upgrade Firebase plan if needed
2. Optimize images before uploading (compress, resize)
3. Use JPG instead of PNG for photos (smaller file size)

## Security

### Storage Rules

**Development Rules (Temporary):**

```javascript
allow read, write: if true;  // ⚠️ Anyone can upload!
```

**Production Rules (After Upload):**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read access for project files
    match /projects/{allPaths=**} {
      allow read: if true;
      allow write: if false;  // ✅ No public writes
    }

    // Admin-only writes (if you have auth)
    match /projects/{allPaths=**} {
      allow write: if request.auth != null &&
                     request.auth.token.admin == true;
    }
  }
}
```

### Best Practices

1. **Never commit Firebase credentials** - Already in `.gitignore`
2. **Secure rules after uploading** - Set `allow write: if false`
3. **Use admin authentication** - For production uploads
4. **Review uploaded files** - Check Firebase Console regularly
5. **Monitor storage usage** - Set up Firebase alerts
6. **Backup important data** - Before force re-uploading

## Advanced Usage

### Processing Multiple Categories

Upload different categories separately:

```bash
# Update config for bathrooms
export const LOCAL_PHOTOS_PATH = '/path/to/assets/bathroom';
npm run upload

# Update config for kitchens
export const LOCAL_PHOTOS_PATH = '/path/to/assets/kitchen';
npm run upload
```

### Automating Uploads

Create a shell script for batch processing:

```bash
#!/bin/bash
# upload-all.sh

categories=("kitchen" "bathroom" "outdoor")

for category in "${categories[@]}"; do
  echo "Uploading $category projects..."
  # Update config programmatically here
  npm run upload
done
```

### Integration with CI/CD

Add to GitHub Actions or similar:

```yaml
- name: Upload Assets to Firebase
  env:
    FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
  run: |
    npm install
    npm run upload
```

## Support

If you encounter issues not covered here:

1. Check console output for detailed error messages
2. Verify Firebase configuration and permissions
3. Ensure folder structure matches expected patterns
4. Review category mappings in config
5. Test with `--dry-run` first
6. Try uploading a single project to isolate issues

## Future Enhancements

Potential improvements:

- [ ] Support for video files (.mp4, .mov)
- [ ] Image optimization before upload (resize, compress)
- [ ] Resume interrupted uploads
- [ ] Progress bar for large batches
- [ ] Email notifications on completion
- [ ] Automatic thumbnail generation
- [ ] Metadata extraction (EXIF data)
- [ ] Parallel project uploads
