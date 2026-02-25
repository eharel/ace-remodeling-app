# Changelog

All notable changes to the ACE Remodeling app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [3.1.0] - 2026-02-24

### Added

- Photo upload from "All Photos" tab: phase picker (Before / In Progress / After) appears before source picker so photos are always categorized on upload
- Edit mode affordances on project page: Photos and Documents sections now show "Edit >" label in edit mode and open directly in edit mode when tapped — no double-tap required

### Changed

- Browse page now surfaces custom project categories in a collapsible "Other categories" section rather than mixing them with core categories

---

## [3.0.0] - 2026-02-06

### Added

- Full project CRUD: create, edit, and delete projects from the app
- Component management: add, reorder, and remove project components
- Photo management: upload, reorder, delete, and set thumbnails per phase
- Document (asset) management: upload, categorize, edit, and delete
- Admin edit mode on project pages with inline field editing
- "Design / Development" as a core project category with proper icon and browse support

---

## [1.3.0] - 2025-11-17

### Added

- Aggregate all photos in full-home project page details

---

## [1.2.0] - 2025-11-17

### Added

- Build version checking system with TestFlight update notifications
- App branding updated to "ACE Remodeling TX"
- Showcase page of highlighted projects

### Changed

- Settings version display now uses package.json for OTA compatibility

---

## [1.1.0] - 2025-11-13

### Added

- Environment awareness with separate development and production databases
- Gallery tabs for different project phases (Before, During, After)
- Expanded meeting item checklist with enhanced functionality

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
