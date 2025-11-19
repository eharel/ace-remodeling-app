# Legacy Upload System (Archived)

This folder contains the old upload system that was replaced in January 2025.

## Why Archived?

The old system had these limitations:

- **Category-based uploads**: Required uploading by category (bathroom, kitchen) rather than by project
- **Multiple runs needed**: Had to run upload script multiple times for different categories
- **No CSV integration**: Manual metadata management, no structured data import
- **Separate steps**: Upload and seed were separate operations
- **Old data model**: Used `Picture` type instead of `MediaAsset`, old Project structure
- **Generated JSON files**: Created intermediate JSON files in `output/` folder

## New System

See `../README.md` for the new upload system documentation.

The new system:
- ✅ Reads from CSV for structured project data
- ✅ Uploads entire projects in one run
- ✅ Integrated pipeline (CSV → Scan → Upload → Firestore)
- ✅ Uses modern data model (`MediaAsset`, `ProjectComponent`)
- ✅ No intermediate files needed

## Files

- **`uploadPhotos.ts`** - Old category-based uploader
  - Uploaded files by category (bathroom, kitchen, etc.)
  - Generated JSON files in `output/` folder
  - Required manual category switching

- **`seedFirebase.ts`** - Old Firestore seeding script
  - Read JSON files from `output/` folder
  - Converted uploaded data to old Project format
  - Used old types (`Picture`, `ProjectCategory`)

- **`config/uploadConfig.ts`** - Configuration for old uploader
  - Category mappings
  - File type definitions
  - Used only by old system

- **`types/upload.ts`** - TypeScript types for old uploader
  - `LocalFile`, `UploadedFile` interfaces
  - Used only by old system

- **`output/`** - Generated JSON files
  - Created by old uploader
  - Read by old seeder
  - Contains project data in old format

- **Documentation files**:
  - `UPLOAD_README.md` - Old upload documentation
  - `UPLOAD_QUICK_START.md` - Old quick start guide
  - `FIREBASE_INTEGRATION.md` - Old integration docs

## If You Need These

These scripts are kept for reference only. If you need to understand how the old system worked, they're here. But **do not use them** - use the new system instead.

### To Use Old System (Not Recommended)

```bash
# Old upload (by category)
npm run legacy:upload -- --category bathroom

# Old seed
npm run legacy:seed
```

### Migration Path

If you have data in the old format:
1. Use the new CSV-based system
2. Run `npm run upload` (new system)
3. Old system files can be deleted after migration

## Archive Date

January 2025

