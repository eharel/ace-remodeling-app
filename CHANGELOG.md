# Changelog

All notable changes to the ACE Remodeling app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [3.0.0] - TBD

**⚠️ BREAKING CHANGES:** This release includes database migrations that must be run before deployment. See RELEASE_NOTES.md for migration scripts and instructions.

### Added

#### Project Management
- Create new projects with form-based input
- Comprehensive edit mode for project metadata (name, number, description, location)
- Project number validation with duplicate checking
- Inline editing for project fields with dropdown selectors

#### Component Management
- Add, edit, and delete project components
- Component selector with improved UX
- Component name editing and category/subcategory selection
- Custom category and subcategory options
- Delete associated media files when deleting components
- Component pills with edit indicators

#### Photo Management (CRUD)
- Upload photos from device library or Files app
- Delete photos with confirmation
- Set thumbnail/hero image for components
- Drag-to-reorder photos in edit mode
- Photo category filtering (Before, During, After, Renderings)
- Responsive photo grid with optimized performance
- Photo selection mode for bulk operations
- Edit mode for photo gallery with visual improvements

#### Document Management (CRUD)
- Upload documents (PDFs, images) to project components
- Edit/rename document names
- Delete documents (also removes files from Firebase Storage)
- Document category tabs and filtering
- Document preview for images
- Category consolidation (type → category field)

#### Authentication & Permissions
- PIN-based authentication system
- Permission-based UI rendering with `<Can>` component
- Edit mode protection requiring authentication
- Permission utilities for role-based access

#### Featured Projects
- Per-component featuring (moved from project-level)
- Featured toggle in project detail view
- Component-level featured status for showcase

#### UI/UX Improvements
- Toast notifications for user feedback
- Improved edit mode UX with Save/Cancel buttons
- Visual improvements for headers, separators, and card spacing
- Consistent empty states across Photos and Assets sections
- Success variant for ThemedButton
- Improved disabled button visibility
- Loading states for segmented controls
- Auto-width, centered toast positioning above tab bar
- Improved navbar inactive tab color contrast

#### Performance & Architecture
- Optimized FlatList rendering for photo galleries
- Refactored gallery components for better organization
- ProjectCardView DTO for consistent data transformation
- Service layer for Firestore operations
- Zod validation for data integrity
- Optimistic updates in ProjectsContext

### Changed

- Featuring system changed from project-level to component-level (breaking change)
- Document fields consolidated from `type` to `category` field
- Project data model restructured to use components array
- Gallery refactored to decouple photos from projects
- Core directory merged into shared directory
- Edit mode unified across project detail page

### Fixed

- Firestore undefined value errors in project updates
- Search suggestions crash with undefined cardViews
- Search filters crash when projects array is undefined
- Photo upload nanoid crypto error in React Native
- Showcase now only shows projects under featured component categories
- Project number validation duplicate checking
- Project update error handling and state sync
- Document category filtering fallback to doc.type
- Component name display and category tab visibility
- Photo grid modal scroll conflicts
- Screen rotation crash in photo grid

---

## [1.3.0] - 2025-11-17

### Added

- Aggregate all photos in full-home project page details

### Changed

---

## [1.2.0] - 2025-11-17

### Added

- Build version checking system with TestFlight update notifications
- App branding updated to "ACE Remodeling TX"
- Add Showcase page of highlighted projects

### Changed

- Settings version display now uses package.json for OTA compatibility

---

## [1.1.0] - 2025-11-13

### Added

- Environment awareness with separate development and production databases
- Gallery tabs for different project phases (Before, During, After)
- Expanded meeting item checklist with enhanced functionality

### Changed

### Fixed

### Removed

---

## [1.0.0] - 2025-11-XX

### Added

- Initial release of ACE Remodeling app
- Project listing and search functionality
- Project details with gallery, documents, and logs
- Photo gallery with zoom and navigation
- PDF document viewer
- Meeting checklist system
- Dark mode support
- Category-based project browsing

---

## How to Use This Changelog

### When adding changes:

1. Add items to the `[Unreleased]` section as you develop
2. Use these categories:
   - **Added**: New features
   - **Changed**: Changes to existing functionality
   - **Fixed**: Bug fixes
   - **Removed**: Removed features

### When releasing a new version:

1. Move unreleased items to a new version section with the release date
2. Update the version number in brackets
3. Keep the [Unreleased] section at the top for future changes

### Version Numbering (Semantic Versioning):

- **Major (X.0.0)**: Breaking changes or major rewrites
- **Minor (1.X.0)**: New features, backward compatible
- **Patch (1.0.X)**: Bug fixes and minor improvements
