# Release Notes & Migration Checklist

This file tracks pending migrations and deployment steps for upcoming releases.

---

## Pending Production Migrations

### 1. Remove Project ID Field
**Script:** `npm run migrate:remove-id`
**Reason:** The `projectId` field was conflicting with Firestore's auto-generated document ID. Projects should use the document ID directly.

- [ ] Run on dev: `npm run migrate:remove-id --env=dev`
- [ ] Verify dev works correctly
- [ ] Run on prod: `npm run migrate:remove-id --env=prod`

### 2. Add Component IDs
**Script:** *(needs to be created or already exists)*
**Reason:** Components need unique IDs for navigation, selection, and state management. Previously components were identified by index, which is fragile.

- [ ] Verify script exists or create one
- [ ] Run on dev
- [ ] Verify dev works correctly
- [ ] Run on prod

### 3. Migrate isFeatured to Components
**Script:** `npm run migrate:featured-to-components:dev` / `npm run migrate:featured-to-components:prod`
**Reason:** Featuring is now per-component, not per-project. This allows featuring specific components (e.g., a kitchen) without featuring all components in a project.

- [ ] Run on dev: `npm run migrate:featured-to-components:dev`
- [ ] Test featuring toggle works correctly on dev
- [ ] Run on prod: `npm run migrate:featured-to-components:prod`
- [ ] Verify showcase displays correctly

### 4. Consolidate Document Fields (type → category)
**Script:** `npx tsx scripts/migrations/syncDocumentTypeWithCategory.ts`
**Reason:** Documents had both `type` and `category` fields with inconsistent data. Consolidated to use only `category` with proper display format values (e.g., "Floor Plan", "Contract").

- [x] Run on dev (completed)
- [ ] Verify dev works correctly
- [ ] Run on prod: `npx tsx scripts/migrations/syncDocumentTypeWithCategory.ts`
- [ ] Verify documents display correctly in Assets section

---

## Version History

### v2.2.0 (Upcoming)
**Changes:**
- Featured toggle for components in project detail view
- Per-component featuring (breaking change from project-level)
- `<Can>` component for permission-based rendering
- Photo CRUD operations (Add Photos, Delete, Set Thumbnail)
- Category switcher in photo grid
- Various photo grid visual improvements

**Required Migrations:**
- #3: Migrate isFeatured to Components

**Deploy Steps:**
1. Run migration on dev, test
2. Run migration on prod
3. Deploy app update via EAS

---

## How to Add New Migrations

When creating a new migration:

1. Create script in `scripts/migrations/`
2. Add npm scripts to `package.json` for dev/prod
3. Document in this file under "Pending Production Migrations"
4. After running on prod, move to "Completed Migrations" section

---

## Completed Migrations

*(Move migrations here after they've been run on production)*
