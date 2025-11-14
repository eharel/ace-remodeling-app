# Version Release Workflow

This document outlines the process for releasing new versions of the ACE Remodeling app.

## Quick Reference

```bash
# 1. Update version numbers
npm run version:bump

# 2. Build and submit to App Store
npm run build:ios:submit

# 3. Check build status
npm run build:status
```

---

## When to Release a New Version

### OTA Update (No new build needed)
Use `eas update` for JavaScript-only changes:
- UI tweaks
- Bug fixes in JavaScript code
- Content updates
- Minor styling changes

```bash
npm run deploy:update
```

### Full Build (New version required)
Create a new build when you have:
- New native dependencies
- Changes to app.json or native configuration
- Significant feature additions (minor/major version bump)
- Changes to permissions or entitlements

```bash
npm run build:ios:submit
```

---

## Release Checklist

### Before Every Release

- [ ] All features tested on device
- [ ] No console errors or warnings
- [ ] Update CHANGELOG.md (move [Unreleased] items to new version)
- [ ] Commit all changes
- [ ] Bump version numbers (see below)
- [ ] Update App Store release notes from CHANGELOG

### Version Bumping

**Manual Process:**

1. **Decide on version number** (Semantic Versioning):
   - **Patch** (1.0.X): Bug fixes, minor tweaks
   - **Minor** (1.X.0): New features, backward compatible (← most common)
   - **Major** (X.0.0): Breaking changes, major redesign

2. **Update these files:**

   `package.json`:
   ```json
   "version": "1.1.0"
   ```

   `app.json`:
   ```json
   "version": "1.1.0",
   "runtimeVersion": "1.1.0",
   "ios": {
     "buildNumber": "2"  // Must increment for every iOS build
   }
   ```

3. **Commit the version bump:**
   ```bash
   git add package.json app.json CHANGELOG.md
   git commit -m "chore: bump version to 1.1.0"
   git tag v1.1.0
   git push && git push --tags
   ```

4. **Build and submit:**
   ```bash
   npm run build:ios:submit
   ```

---

## iOS Build Number Rules

- **buildNumber** must increment for EVERY build submitted to App Store
- Even if you rebuild the same version, increment buildNumber
- Apple rejects builds with duplicate buildNumbers

Example progression:
- v1.0.0 (buildNumber: 1)
- v1.1.0 (buildNumber: 2)
- v1.1.1 (buildNumber: 3)
- v1.2.0 (buildNumber: 4)

---

## Automated Version Script (Optional)

You can add these npm scripts to `package.json` for easier version management:

```json
"scripts": {
  "version:patch": "npm version patch && npm run version:sync",
  "version:minor": "npm version minor && npm run version:sync",
  "version:major": "npm version major && npm run version:sync",
  "version:sync": "node scripts/sync-version.js",
  "version:bump": "echo 'Current version:' && grep '\"version\":' package.json && echo '\nRun: npm run version:patch, version:minor, or version:major'"
}
```

This would require creating a `scripts/sync-version.js` file to sync the version from package.json to app.json.

---

## Post-Release

After successful submission:

1. **Monitor build status:**
   ```bash
   npm run build:status
   ```

2. **Update CHANGELOG.md** with actual release date

3. **Create GitHub release** (optional):
   - Tag: `v1.1.0`
   - Title: `v1.1.0 - [Feature Name]`
   - Description: Copy from CHANGELOG

4. **Test the production build** once approved by Apple

---

## Troubleshooting

### Build failed?
- Check `npm run build:status` for errors
- Common issues:
  - Missing credentials
  - Invalid bundle identifier
  - Duplicate buildNumber

### Update not appearing?
- OTA updates can take a few minutes to propagate
- Users need to close and reopen the app
- Check EAS dashboard for update status

### Version mismatch errors?
- Ensure `runtimeVersion` matches `version` in app.json
- Clear build cache: `npm run prebuild:clean`

