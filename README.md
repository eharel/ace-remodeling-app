# ACE Remodeling App

iPad-optimized portfolio app for ACE Remodeling TX. Project Managers use it during client meetings to showcase completed projects, manage project data, and demonstrate company capabilities.

**Tech Stack**: React Native + Expo, TypeScript, Firebase (Firestore + Storage), Expo Router

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (for development) or physical iPad

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run on iOS simulator
npm run dev:ios

# Run on Android (if needed)
npm run dev:android
```

### Environment

The app uses Firebase with separate dev/prod environments. Configure in `shared/config/firebase.ts`:
- Development: Uses dev Firebase project
- Production: Uses prod Firebase project (set via `EXPO_PUBLIC_FIREBASE_ENV=production`)

---

## Architecture

### Tech Stack

- **React Native** + **Expo** (~54.0)
- **TypeScript** (strict mode)
- **Expo Router** (file-based routing)
- **Firebase** (Firestore + Storage)
- **React Context** (state management)

### Key Dependencies

- `expo-router`: File-based navigation
- `expo-image`: Optimized image loading
- `firebase`: Firestore + Storage
- `zod`: Runtime validation
- `react-native-sortables`: Drag-to-reorder
- `expo-image-picker`: Photo selection
- `expo-document-picker`: Document selection

### Project Structure

```
app/                      # Expo Router screens (file-based routing)
├── (tabs)/              # Tab navigation
│   ├── index.tsx        # Home / showcase screen
│   ├── browse.tsx       # Browse projects by category
│   ├── search.tsx       # Search functionality
│   └── settings.tsx     # App settings & auth
├── project/
│   ├── [id]/            # Project detail routes
│   │   ├── index.tsx    # Project overview (edit mode)
│   │   ├── photos/      # Photo gallery (grid + viewer)
│   │   └── documents.tsx # Documents & assets
│   └── create.tsx       # Create new project
├── category/[category].tsx  # Category detail pages
└── _layout.tsx          # Root layout, theme, auth

features/                # Feature modules (UI components)
├── category/            # Category browsing
├── checklist/           # Meeting checklist
├── gallery/             # Image gallery components
├── pdf/                 # PDF viewer
├── projects/            # Project cards, lists
└── search/              # Search UI

shared/                  # Shared code (replaces former core/)
├── components/          # Reusable UI components
│   ├── themed/          # Themed components (Button, Input, etc.)
│   ├── Can.tsx          # Permission-based rendering
│   └── ui/              # UI primitives (Toast, SegmentedControl)
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # PIN auth & permissions
│   ├── ProjectsContext.tsx # Project data & CRUD operations
│   └── ThemeContext.tsx # Theme management
├── themes/              # Design system (light, dark, main)
├── types/               # TypeScript definitions
│   ├── Project.ts       # Project schema (Zod)
│   ├── ProjectComponent.ts # Component schema
│   └── ...
└── utils/               # Utilities (dates, categories, etc.)

services/                # Data access layer
├── projects/            # Firestore project operations
├── media/               # Photo/media operations
└── documents/           # Document operations

scripts/                 # Maintenance & migrations
├── uploadProjects.ts    # CSV + filesystem upload pipeline
├── migrations/          # One-off data migrations
│   ├── migrateIsFeaturedToComponents.ts
│   └── syncDocumentTypeWithCategory.ts
└── legacy/              # Archived (do not use)
```

### Data Model

**Project Structure**:
- Projects contain one or more **Components** (bathroom, kitchen, etc.)
- Each component has its own photos, documents, and logs
- Projects can also have shared assets at the project level
- Featuring is **per-component** (not per-project)

**Key Types**:
- `Project`: Top-level entity with components array
- `ProjectComponent`: Individual aspect (bathroom, kitchen, etc.)
- `MediaAsset`: Photos with category (before/during/after/renderings)
- `Document`: PDFs/images with category

See `shared/types/` for full schemas (Zod-validated).

---

## Key Scripts

### Development

```bash
npm run dev              # Start dev server
npm run dev:ios          # Run on iOS simulator
npm run dev:android      # Run on Android
npm run dev:clear        # Clear cache and start
npm run type-check       # TypeScript check
npm run lint             # ESLint
```

### Data Management

```bash
# Upload projects from CSV + filesystem
npm run upload           # Development (default)
npm run upload:dev       # Explicit dev
npm run upload:prod      # Production

# Migrations (run on dev first!)
npm run migrate:featured-to-components:dev
npm run migrate:featured-to-components:prod
npx tsx scripts/migrations/syncDocumentTypeWithCategory.ts --env=prod
```

See `scripts/README.md` for full upload pipeline documentation.

### Version Management

```bash
npm run version:patch    # 3.0.0 → 3.0.1
npm run version:minor    # 3.0.0 → 3.1.0
npm run version:major    # 3.0.0 → 4.0.0
npm run version:info     # Show current version
```

Version bumping automatically:
- Updates `package.json` version
- Syncs to `app.json` (version, runtimeVersion, iOS buildNumber)
- Increments iOS buildNumber

### Build & Deploy

```bash
# OTA Update (JavaScript-only changes)
npm run deploy:update

# Full Build (new version required)
npm run build:ios:submit # Builds and submits to App Store

# Check build status
npm run build:status
```

**Important**: See `RELEASE_PROCESS.md` for full deployment workflow, including database migrations.

---

## Development Notes

### Authentication

- PIN-based auth protects edit mode
- `<Can>` component gates sensitive UI
- Auth state managed in `AuthContext`
- PIN set in Settings (protected by existing PIN)

### State Management

- **ProjectsContext**: Centralized project data, CRUD operations, optimistic updates
- **AuthContext**: Authentication state, permissions
- **ThemeContext**: Theme switching (light/dark/main)

### Firebase

- Separate dev/prod projects
- Environment controlled via `EXPO_PUBLIC_FIREBASE_ENV`
- Firestore for project data
- Storage for photos/documents
- Real-time sync on app load

### Performance

- Photo galleries use FlatList with lazy loading
- Images cached via expo-image
- Debounced search input
- Optimistic updates for better UX

---

## Deployment

### Release Process

1. **Pre-release**: Test migrations on dev, update CHANGELOG.md
2. **Version bump**: `npm run version:minor` (or patch/major)
3. **Commit & tag**: `git commit -m "chore: bump version" && git tag v2.2.0`
4. **Run migrations on prod**: See `RELEASE_NOTES.md` for pending migrations
5. **Build & submit**: `npm run build:ios:submit`

**⚠️ Critical**: Always run migrations on dev first, then prod. See `RELEASE_PROCESS.md` for full details.

### iOS Build Numbers

- `buildNumber` in `app.json` must increment for **every** App Store submission
- Even rebuilding the same version requires incrementing buildNumber
- Apple rejects duplicate buildNumbers

### OTA Updates

- Use `npm run deploy:update` for JavaScript-only changes
- Requires `runtimeVersion` in `app.json` to match current app version
- If `runtimeVersion` changed, need full build instead

---

## Troubleshooting

### Common Issues

**Build fails**
- Check `npm run build:status` for errors
- Verify credentials, bundle identifier
- Ensure buildNumber is incremented

**Migration fails**
- Check Firebase Console for partial changes
- Review script logs
- Test fixes on dev before retrying prod

**Update not appearing**
- OTA updates take a few minutes to propagate
- Users need to close/reopen app
- Check EAS dashboard for status
- Verify `runtimeVersion` matches app version

**Type errors**
- Run `npm run type-check`
- Check `tsconfig.json` strict mode settings
- Ensure all types imported from `shared/types`

---

## Known Limitations

- **Scope**: Portfolio presentation + light editing, not full project management
- **Admin**: Bulk data operations are script-driven (no full CMS)
- **Offline**: Requires connectivity for initial load and media; limited to cached content

---

**Version**: 3.0.0  
**Last Updated**: 2026-02-06
