# Project Upload System

Complete upload pipeline for ACE Remodeling projects from CSV to Firebase.

## Overview

The upload system provides an end-to-end solution for uploading projects to Firebase:

1. **Parse CSV** → Read project metadata from `projects.csv`
2. **Scan Filesystem** → Discover all photos, videos, and assets
3. **Upload to Storage** → Upload files to Firebase Storage
4. **Create Firestore Docs** → Build and write Project documents

## Quick Start

### Prerequisites

1. **CSV File**: `projects.csv` in assets folder
2. **Project Folders**: Organized in `ace-remodeling-assets/`
3. **Firebase Config**: Configured in `core/config/firebase.ts`
4. **Dependencies**: `npm install`

### Basic Usage

```bash
# Dry run first (always recommended!)
npm run upload -- --dry-run

# Upload all projects
npm run upload

# Upload specific projects
npm run upload -- --projects 187,148,145

# Clear existing Firestore data first
npm run upload -- --clear

# Skip files already in Storage
npm run upload -- --skip-existing
```

## Architecture

```
scripts/
├── uploadProjects.ts        # Main orchestrator script
├── lib/                     # Core modules
│   ├── csv/                # CSV parsing
│   │   └── parser.ts
│   ├── filesystem/         # File discovery
│   │   ├── scanner.ts
│   │   └── types.ts
│   ├── firebase/           # Firebase operations
│   │   ├── storage.ts      # Storage uploader
│   │   ├── firestore.ts    # Firestore operations
│   │   ├── dataBuilder.ts  # Data merging
│   │   └── client.ts       # Firebase client
│   └── utils/              # Utilities
│       ├── fileUtils.ts
│       └── progressTracker.ts
└── utilities/               # Standalone utilities
    ├── extractProjectList.ts
    └── addFeaturedField.ts
```

## Workflow

### Step 1: Prepare CSV

Create `projects.csv` with project metadata:

```csv
number,name,category,subcategory,componentName,isFeatured,projectManagers,summary,description,location.zipCode,location.neighborhood,timeline.duration,status,tags
187,Bold Beauty,bathroom,,Spa Master Bath,true,"Mike Johnson;Sarah Chen","Luxury home...","Full description...",78701,"Austin, TX","3 months",completed,"luxury;spa;modern"
187,Bold Beauty,theater-room,,Home Theater,false,"Mike Johnson","Luxury home...","Full description...",78701,"Austin, TX","3 months",completed,"luxury;theater"
```

### Step 2: Organize Files

Structure your assets folder:

```
ace-remodeling-assets/
├── projects.csv
├── 187/
│   ├── bathroom/
│   │   ├── photos/
│   │   │   ├── before/
│   │   │   │   ├── photo1.jpg
│   │   │   │   └── photo2.jpg
│   │   │   └── after/
│   │   │       ├── photo1.jpg
│   │   │       └── photo2.jpg
│   │   └── assets/
│   │       └── plans/
│   │           └── floor-plan.pdf
│   └── theater-room/
│       └── photos/
│           └── after/
│               └── theater.jpg
```

### Step 3: Run Upload

```bash
# Preview what will happen
npm run upload -- --dry-run

# Actually upload
npm run upload
```

## CLI Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview without uploading |
| `--projects 187,148` | Upload specific projects only |
| `--clear` | Clear existing Firestore data first |
| `--skip-existing` | Skip files already in Storage |
| `--verbose` | Detailed error output |

## Examples

### Upload Single Project

```bash
npm run upload -- --projects 187 --dry-run
```

### Full Upload with Options

```bash
npm run upload -- --clear --skip-existing
```

### Development vs Production

```bash
# Development (default)
npm run upload

# Production
npm run upload:prod
```

## Module Details

### CSV Parser (`lib/csv/parser.ts`)

- Parses `projects.csv` into Project objects
- Validates required fields
- Groups rows by project number
- Handles multiple components per project

### Filesystem Scanner (`lib/filesystem/scanner.ts`)

- Recursively scans project folders
- Identifies photos, videos, and assets
- Extracts stage from folder names
- Handles nested structures (outdoor/pool)

### Storage Uploader (`lib/firebase/storage.ts`)

- Uploads files to Firebase Storage
- Preserves folder structure
- Progress tracking with ETA
- Retry logic for failures
- Skip existing files option

### Firestore Creator (`lib/firebase/firestore.ts` + `dataBuilder.ts`)

- Merges CSV, scanner, and upload data
- Builds complete Project documents
- Validates before writing
- Creates Firestore documents

## Utilities

### Extract Project List

Generate project list for CSV:

```bash
npm run extract-projects
```

### Add Featured Field

Migration script to add featured field:

```bash
npm run add-featured:dev
npm run add-featured:prod
```

## Troubleshooting

### CSV Parsing Errors

**Problem**: Missing required fields

**Solution**: Check CSV has all required columns:
- `number`, `name`, `category`, `status` (required)
- `summary`, `description` (recommended)

### Files Not Found

**Problem**: Scanner can't find project folders

**Solution**: 
- Verify folder names match project numbers
- Check folder structure matches expected format
- Use `--verbose` for detailed errors

### Upload Failures

**Problem**: Some files fail to upload

**Solution**:
- Check Firebase Storage rules allow writes
- Verify network connection
- Use `--skip-existing` to avoid re-uploading
- Check file sizes (large files may timeout)

### Firestore Write Errors

**Problem**: Projects fail to create

**Solution**:
- Check Firestore security rules
- Verify Firebase credentials
- Use `--dry-run` to preview
- Check validation errors in output

## File Structure Requirements

### Project Folders

```
{projectNumber}/
├── {category}/
│   ├── photos/
│   │   ├── before/
│   │   ├── after/
│   │   ├── in-progress/
│   │   └── renderings/
│   ├── videos/ (optional)
│   │   └── {stage}/
│   └── assets/
│       ├── plans/
│       ├── materials/
│       └── renderings/
└── {category}/{subcategory}/ (for nested like outdoor/pool)
```

### Supported Stages

- `before` - Before photos
- `after` - After photos
- `in-progress` - During construction
- `renderings` - 3D renderings
- `other` - Other media

## Data Model

The system creates Project documents matching the TypeScript interfaces:

- **Project** - Top-level entity with components
- **ProjectComponent** - Individual aspects (bathroom, kitchen)
- **MediaAsset** - Photos and videos
- **Document** - PDFs, plans, materials

See `core/types/` for complete type definitions.

## Legacy System

The old upload system has been archived to `legacy/`. See `legacy/README.md` for details.

**Do not use the old system** - use this new CSV-based system instead.

## Environment Variables

- `NODE_ENV` - `development` (default) or `production`
- `EXPO_PUBLIC_FIREBASE_ENV` - Override Firebase environment

## Best Practices

1. **Always dry-run first**: `npm run upload -- --dry-run`
2. **Use `--skip-existing`**: Avoid re-uploading files
3. **Check CSV format**: Validate before uploading
4. **Organize files**: Follow folder structure conventions
5. **Test with one project**: Use `--projects` to test
6. **Review output**: Check logs for warnings/errors

## Support

For issues:
1. Check error messages in console
2. Use `--verbose` for detailed output
3. Review module documentation in `lib/`
4. Check Firebase Console for upload status
