# 🧹 Scripts Cleanup Plan

Based on the audit report, here's the step-by-step cleanup plan.

## Summary

- **NEW SYSTEM:** `uploadProjects.ts` + `lib/` (keep)
- **OLD SYSTEM:** Archive to `legacy/` (5 files + 2 folders)
- **UTILITIES:** Move to `utilities/` (2 files)
- **KEEP AT ROOT:** `sync-version.js`, `reset-project.js` (used by npm)

---

## Execution Steps

### Step 1: Create Directory Structure
```bash
mkdir -p scripts/legacy/config
mkdir -p scripts/legacy/types
mkdir -p scripts/legacy/output
mkdir -p scripts/utilities
```

### Step 2: Move Old System Files
```bash
# Main old system files
mv scripts/uploadPhotos.ts scripts/legacy/
mv scripts/seedFirebase.ts scripts/legacy/

# Config and types
mv scripts/config scripts/legacy/
mv scripts/types scripts/legacy/

# Output folder
mv scripts/output scripts/legacy/

# Old documentation
mv scripts/UPLOAD_README.md scripts/legacy/
mv scripts/UPLOAD_QUICK_START.md scripts/legacy/
mv scripts/FIREBASE_INTEGRATION.md scripts/legacy/
```

### Step 3: Move Utilities
```bash
mv scripts/extractProjectList.ts scripts/utilities/
mv scripts/addFeaturedField.ts scripts/utilities/
```

### Step 4: Update package.json Scripts

**Remove:**
- `upload:dry-run`
- `upload:force`
- `upload` (old)
- `upload:prod` (old)
- `seed`
- `seed:prod`

**Add/Update:**
- `upload` → `tsx scripts/uploadProjects.ts` (new primary)
- `upload:dev` → `NODE_ENV=development tsx scripts/uploadProjects.ts`
- `upload:prod` → `NODE_ENV=production tsx scripts/uploadProjects.ts`
- `legacy:upload` → `tsx scripts/legacy/uploadPhotos.ts`
- `legacy:upload:prod` → `NODE_ENV=production tsx scripts/legacy/uploadPhotos.ts`
- `legacy:seed` → `tsx scripts/legacy/seedFirebase.ts`
- `legacy:seed:prod` → `NODE_ENV=production tsx scripts/legacy/seedFirebase.ts`
- `extract-projects` → Update path to `utilities/extractProjectList.ts`
- `add-featured:dev` → Update path to `utilities/addFeaturedField.ts`
- `add-featured:prod` → Update path to `utilities/addFeaturedField.ts`

### Step 5: Create Documentation

1. Create `scripts/legacy/README.md`
2. Rewrite `scripts/README.md` for new system

### Step 6: Update .gitignore

Add:
```
# Script outputs
scripts/legacy/output/
scripts/**/*.json
!scripts/lib/**/*.json
```

---

## Files to Create

1. `scripts/legacy/README.md` - Explains archived old system
2. `scripts/README.md` - New main documentation

---

## Verification Checklist

After cleanup, verify:
- [ ] All old system files in `legacy/`
- [ ] All utilities in `utilities/`
- [ ] New system files untouched
- [ ] package.json scripts updated
- [ ] Documentation created
- [ ] .gitignore updated
- [ ] Test `npm run upload` works (new system)
- [ ] Test `npm run legacy:upload` works (old system)

