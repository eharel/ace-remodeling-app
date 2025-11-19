# 📊 Scripts Folder Audit Report

**Date:** 2025-01-XX  
**Purpose:** Comprehensive audit before cleanup and reorganization

---

## Current Structure

```
scripts/
├── uploadPhotos.ts          # OLD SYSTEM - Category-based uploader
├── seedFirebase.ts          # OLD SYSTEM - Old Firestore seeding
├── uploadProjects.ts        # NEW SYSTEM ✅ - Main orchestrator
├── extractProjectList.ts   # UTILITY - Extract project list for CSV
├── addFeaturedField.ts     # UTILITY - Add featured field to Firestore
├── sync-version.js         # UTILITY - Sync version to app.json
├── reset-project.js        # UTILITY - Reset project structure
├── config/                 # OLD SYSTEM - Config for old uploader
│   └── uploadConfig.ts
├── types/                  # OLD SYSTEM - Types for old uploader
│   └── upload.ts
├── output/                 # GENERATED - Old system output files
│   ├── dev/
│   └── prod/
├── lib/                    # NEW SYSTEM ✅ - New upload architecture
│   ├── csv/
│   ├── filesystem/
│   ├── firebase/
│   └── utils/
└── [README files]
```

---

## Categorization

### ✅ NEW SYSTEM (Keep in place)
- **`uploadProjects.ts`** - Main orchestrator script
- **`lib/`** - Complete new upload architecture
  - `lib/csv/parser.ts` - CSV parser
  - `lib/filesystem/scanner.ts` - Filesystem scanner
  - `lib/filesystem/types.ts` - Scanner types
  - `lib/firebase/storage.ts` - Storage uploader
  - `lib/firebase/firestore.ts` - Firestore operations
  - `lib/firebase/dataBuilder.ts` - Data builder
  - `lib/firebase/client.ts` - Firebase client
  - `lib/utils/fileUtils.ts` - File utilities
  - `lib/utils/progressTracker.ts` - Progress tracker

### 🗄️ OLD SYSTEM (Archive → `legacy/`)
- **`uploadPhotos.ts`** - Old category-based uploader
  - Uploads by category (bathroom, kitchen)
  - Generates JSON output files
  - No CSV integration
  - Separate from seeding step

- **`seedFirebase.ts`** - Old Firestore seeding script
  - Reads JSON files from `output/`
  - Uses old Project type (Picture, not MediaAsset)
  - Separate step from upload

- **`config/uploadConfig.ts`** - Configuration for old uploader
  - Category mappings
  - File type definitions
  - Used only by `uploadPhotos.ts`

- **`types/upload.ts`** - Types for old uploader
  - LocalFile, UploadedFile interfaces
  - Used only by old system

- **`output/`** - Generated JSON files
  - Created by old uploader
  - Read by old seeder
  - Not needed for new system

### 🔧 UTILITIES (Keep, organize in `utilities/`)
- **`extractProjectList.ts`** - Extract project list for CSV
  - Scans assets folder
  - Outputs TSV format
  - Still useful for CSV generation

- **`addFeaturedField.ts`** - Add featured field to Firestore
  - Updates existing projects
  - One-time migration script
  - Still potentially useful

- **`sync-version.js`** - Sync version to app.json
  - Used by npm version commands
  - Keep at root level (used by npm scripts)

- **`reset-project.js`** - Reset project structure
  - Expo project reset utility
  - Keep at root level (rarely used)

### 📄 DOCUMENTATION (Review and update)
- **`README.md`** - Currently documents old seeding system
  - Needs complete rewrite for new system
  - Should document new upload architecture

- **`UPLOAD_README.md`** - Old upload documentation
  - Archive with old system

- **`UPLOAD_QUICK_START.md`** - Old quick start guide
  - Archive with old system

- **`FIREBASE_INTEGRATION.md`** - Firebase integration docs
  - Review if still relevant
  - May keep if contains useful info

---

## Proposed Organization

```
scripts/
├── uploadProjects.ts        # NEW MAIN SCRIPT
├── lib/                     # NEW SYSTEM MODULES
│   ├── csv/
│   ├── filesystem/
│   ├── firebase/
│   └── utils/
├── utilities/               # STANDALONE UTILITIES
│   ├── extractProjectList.ts
│   └── addFeaturedField.ts
├── legacy/                  # ARCHIVED OLD SYSTEM
│   ├── README.md
│   ├── uploadPhotos.ts
│   ├── seedFirebase.ts
│   ├── config/
│   │   └── uploadConfig.ts
│   ├── types/
│   │   └── upload.ts
│   ├── output/              # Generated files
│   ├── UPLOAD_README.md
│   └── UPLOAD_QUICK_START.md
├── sync-version.js          # Keep at root (npm script)
├── reset-project.js          # Keep at root (npm script)
└── README.md                # NEW MAIN DOCUMENTATION
```

---

## package.json Scripts Cleanup

### Current Scripts (to update):

**OLD SYSTEM (move to legacy: prefix):**
- `upload` → `legacy:upload`
- `upload:prod` → `legacy:upload:prod`
- `upload:dry-run` → `legacy:upload:dry-run`
- `upload:force` → `legacy:upload:force`
- `seed` → `legacy:seed`
- `seed:prod` → `legacy:seed:prod`

**NEW SYSTEM (keep/update):**
- `upload:projects` → `upload` (make primary)
- `upload:projects:dev` → `upload:dev`
- `upload:projects:prod` → `upload:prod`

**UTILITIES (update paths):**
- `extract-projects` → Update path to `utilities/extractProjectList.ts`
- `add-featured:dev` → Update path to `utilities/addFeaturedField.ts`
- `add-featured:prod` → Update path to `utilities/addFeaturedField.ts`

**KEEP AS-IS:**
- `version:*` scripts (use sync-version.js at root)
- `reset-project` (uses reset-project.js at root)

---

## Migration Notes

### Breaking Changes
- Old `npm run upload` will become `npm run legacy:upload`
- New primary command: `npm run upload` (points to new system)
- Old `npm run seed` will become `npm run legacy:seed`

### Backward Compatibility
- Old scripts still accessible via `legacy:` prefix
- Old system files preserved in `legacy/` folder
- Can reference old code if needed

---

## Next Steps

1. ✅ Create audit report (this file)
2. ⏳ Create `legacy/` directory structure
3. ⏳ Move old system files to `legacy/`
4. ⏳ Create `utilities/` directory
5. ⏳ Move utility scripts to `utilities/`
6. ⏳ Update `package.json` scripts
7. ⏳ Create `legacy/README.md`
8. ⏳ Rewrite main `README.md`
9. ⏳ Update `.gitignore` if needed
10. ⏳ Test all scripts still work

---

## Files Requiring Inspection

**FIREBASE_INTEGRATION.md** - Need to review contents to determine if:
- Still relevant to new system
- Contains useful information
- Should be kept or archived

