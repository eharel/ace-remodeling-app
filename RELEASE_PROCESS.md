# Release Process Guide

This document outlines the complete process for releasing a major update to the ACE Remodeling app, including database migrations.

---

## Overview

When releasing a major update that includes:
- Database schema changes
- Migration scripts that need to run on production
- Breaking changes to data models
- New features requiring data transformation

You'll need to follow this process to ensure a smooth deployment.

---

## Pre-Release Checklist

### 1. Code & Testing
- [ ] All features tested on device
- [ ] No console errors or warnings
- [ ] All migration scripts tested on dev database
- [ ] Verify migration scripts work correctly and are idempotent
- [ ] Update CHANGELOG.md (move [Unreleased] items to new version)
- [ ] Review RELEASE_NOTES.md for pending migrations

### 2. Version Bumping

**Decide on version number** (Semantic Versioning):
- **Patch** (2.1.X): Bug fixes, minor tweaks
- **Minor** (2.X.0): New features, backward compatible (← most common)
- **Major** (X.0.0): Breaking changes, major redesign

**Update these files:**

`package.json`:
```json
"version": "2.2.0"
```

`app.json`:
```json
"version": "2.2.0",
"runtimeVersion": "2.2.0",
"ios": {
  "buildNumber": "12"  // Must increment for EVERY iOS build
}
```

**Note:** The `runtimeVersion` in `app.json` must match the `version` for OTA updates to work correctly.

### 3. Commit Version Bump
```bash
git add package.json app.json CHANGELOG.md
git commit -m "chore: bump version to 2.2.0"
git tag v2.2.0
git push && git push --tags
```

---

## Migration Process (CRITICAL)

### Step 1: Run Migrations on Development

**ALWAYS test migrations on dev first!**

1. **Review RELEASE_NOTES.md** for pending migrations
2. **Run each migration script on dev:**
   ```bash
   # Example: Featured migration
   npm run migrate:featured-to-components:dev
   
   # Example: Document consolidation
   npx tsx scripts/migrations/syncDocumentTypeWithCategory.ts --env=dev
   ```

3. **Verify results:**
   - Check Firebase Console for data changes
   - Test app functionality with migrated data
   - Ensure no data loss or corruption

### Step 2: Run Migrations on Production

**⚠️ IMPORTANT: Only proceed when ready to deploy!**

1. **Backup production database** (if possible)
2. **Run migrations in order** (as listed in RELEASE_NOTES.md):
   ```bash
   # Example: Featured migration
   npm run migrate:featured-to-components:prod
   
   # Example: Document consolidation
   npx tsx scripts/migrations/syncDocumentTypeWithCategory.ts --env=prod
   ```

3. **Verify production data:**
   - Check Firebase Console
   - Spot-check a few projects
   - Ensure migrations completed successfully

### Step 3: Update RELEASE_NOTES.md

After migrations are complete:
- [ ] Move completed migrations to "Completed Migrations" section
- [ ] Update checkboxes in "Pending Production Migrations"
- [ ] Document any issues encountered

---

## Build & Deploy

### Option A: OTA Update (JavaScript-only changes)

Use this if you only have:
- UI tweaks
- Bug fixes in JavaScript code
- Content updates
- Minor styling changes

```bash
npm run deploy:update
```

**Note:** OTA updates require the `runtimeVersion` in `app.json` to match the current app version. If you changed `runtimeVersion`, you'll need a full build.

### Option B: Full Build (New version required)

Use this when you have:
- New native dependencies
- Changes to app.json or native configuration
- Significant feature additions (minor/major version bump)
- Changes to permissions or entitlements
- Database migrations (app needs new code to handle migrated data)

```bash
npm run build:ios:submit
```

This will:
1. Build the app with EAS
2. Automatically submit to App Store Connect
3. Increment buildNumber automatically (via sync-version.js)

---

## Post-Release

### 1. Monitor Build Status
```bash
npm run build:status
```

### 2. Update Documentation
- [ ] Update CHANGELOG.md with actual release date
- [ ] Update RELEASE_NOTES.md (move migrations to completed)
- [ ] Create GitHub release (optional):
  - Tag: `v2.2.0`
  - Title: `v2.2.0 - [Feature Name]`
  - Description: Copy from CHANGELOG

### 3. Testing
- [ ] Test the production build once approved by Apple
- [ ] Verify migrations worked correctly in production
- [ ] Test critical user flows
- [ ] Monitor for any issues

---

## iOS Build Number Rules

- **buildNumber** must increment for EVERY build submitted to App Store
- Even if you rebuild the same version, increment buildNumber
- Apple rejects builds with duplicate buildNumbers

**Example progression:**
- v2.1.0 (buildNumber: 11)
- v2.2.0 (buildNumber: 12) ← Next build
- v2.2.1 (buildNumber: 13)
- v2.3.0 (buildNumber: 14)

---

## Migration Script Best Practices

When creating migration scripts:

1. **Make them idempotent**: Safe to run multiple times
2. **Add dry-run mode**: Test without making changes
3. **Log everything**: What changed, what didn't, why
4. **Handle errors gracefully**: Don't crash on edge cases
5. **Test on dev first**: Always!
6. **Document in RELEASE_NOTES.md**: What it does, why, and how to run

---

## Troubleshooting

### Build failed?
- Check `npm run build:status` for errors
- Common issues:
  - Missing credentials
  - Invalid bundle identifier
  - Duplicate buildNumber

### Migration failed?
- Check Firebase Console for partial changes
- Review script logs for errors
- May need to manually fix data or rollback
- Test migration script fixes on dev before retrying prod

### Update not appearing?
- OTA updates can take a few minutes to propagate
- Users need to close and reopen the app
- Check EAS dashboard for update status
- Verify `runtimeVersion` matches app version

### Version mismatch errors?
- Ensure `runtimeVersion` matches `version` in app.json
- Clear build cache: `npm run prebuild:clean`
- Check that buildNumber was incremented

---

## Quick Reference

```bash
# 1. Update version (manual or via npm scripts)
npm run version:minor  # or patch, major

# 2. Update CHANGELOG.md
# Move [Unreleased] items to new version section

# 3. Test migrations on dev
npm run migrate:featured-to-components:dev

# 4. Commit version bump
git add package.json app.json CHANGELOG.md
git commit -m "chore: bump version to 2.2.0"
git tag v2.2.0
git push && git push --tags

# 5. Run migrations on prod (when ready!)
npm run migrate:featured-to-components:prod

# 6. Build and submit
npm run build:ios:submit

# 7. Monitor
npm run build:status
```

---

## Current Status

**Current Version:** 2.1.0 (check package.json)

**Pending Migrations:** See RELEASE_NOTES.md

**Next Release:** When ready, follow this process!
