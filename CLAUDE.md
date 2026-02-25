# ACE Remodeling App - Claude Code Guide

## Stack
- **React Native / Expo** (SDK 54, expo-router v6 for file-based routing)
- **Firebase** (Firestore for data, Storage for media/documents)
- **TypeScript** throughout
- **react-native-reanimated** for animations

## Key Commands
```bash
npm run dev              # Start dev client
npm run dev:clear        # Start with cleared cache
npm run type-check       # TypeScript check (tsc --noEmit)
npm run lint             # ESLint

# EAS / Production
npm run build:ios        # Production iOS build
npm run deploy:update    # OTA update to production branch

# Scripts (run with tsx)
npm run upload:prod      # Upload projects to prod DB
npm run migrate:remove-id  # Remove legacy projectId field from components
```

## Project Structure
```
app/                    # Expo Router screens
  (tabs)/               # Tab bar: index (showcase), browse, search, settings
  project/[id]/         # Project detail, photos, documents
  category/[category]/  # Category filtered view
features/               # Feature-scoped components & hooks
  projects/             # ProjectCard, modals, ProjectMetaGrid, etc.
  gallery/              # PhotoGrid, PhotoPreview, ImageGallery
  showcase/             # FeaturedCategorySection
  category/             # CategoryScreen
shared/
  components/           # PageHeader, ThemedButton, Toast, EditButton, etc.
  components/themed/    # ThemedButton, ThemedIconButton, ThemedText, ThemedView
  components/ui/        # SegmentedControl, Toast
  contexts/             # AuthContext, ProjectsContext, ThemeContext
  themes/               # DesignTokens, light/dark themes
  types/                # Project, Component, Document, Media types
services/
  projects/             # projectsService.ts (Firestore reads)
scripts/
  migrations/           # DB migration scripts
  utilities/            # One-off scripts (findInvalidAssets, etc.)
```

## Architecture Patterns

### Data Flow
- `ProjectsContext` is the single source of truth for project data
- Optimistic updates with rollback on error for CRUD operations
- `ProjectCard` uses a `ProjectCardView` DTO (not raw `Project`) — use `toProjectCardViewsByCategory()` to transform

### Components
- Use `ThemedButton` (text buttons) not `ThemedIconButton` for primary actions visible to users
- `ThemedIconButton` is for icon-only utility actions (e.g. add in a row)
- `PageHeader` is the single header component — supports `variant="compact"` for pages with nav bars, `showBorder` for scroll separation, `layoutMode="inline"` for control bars
- `Can edit` wraps any admin-only UI
- `Toast` + `ToastType` for user feedback on all mutations

### Edit Modes
Two patterns in use:
1. **Selection mode** (Documents, Photos): "Edit" toggle → select items → action bar. No Cancel needed since nothing is mutated until an action is taken.
2. **Inline editing** (Project page): "Edit" → fields become editable → "Cancel" (revert) + "Done" (save). Cancel is important here since changes accumulate before saving.

### Styling
- Always use `DesignTokens` from `@/shared/themes` for spacing, typography, border radius
- Never use magic numbers for spacing/sizing
- Styles are created with `useMemo(() => StyleSheet.create({...}), [theme, variant])` inside components so they react to theme changes
- `theme.colors.*` for all colors — never hardcode colors (exception: `#FFFFFF` for overlay text on dark backgrounds)

### Documents
- Document `category` field (not `type`) — values: `"3D Rendering" | "Floor Plan" | "Materials" | "Permit" | "Contract" | "Invoice" | "Other"`
- Migration `syncDocumentTypeWithCategory.ts` handled consolidating `type` → `category`

## DB Migrations
Scripts live in `scripts/migrations/`. Always have `--env=dev` and `--env=prod` flags. Run against dev first, verify, then prod.

Completed migrations:
- `removeProjectIdField.ts` — removed redundant `projectId` from component subcollections
- `migrateIsFeaturedToComponents.ts` — moved `isFeatured` from project level to component level
- `syncDocumentTypeWithCategory.ts` — consolidated document `type` field into `category`

## Worktree Setup
This project uses git worktrees. The main repo is at `~/.claude-worktrees/ace-remodeling-app/`. Branch names are used as worktree folder names (e.g. `upbeat-saha`).
