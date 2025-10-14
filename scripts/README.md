# Database Seeding Scripts

This directory contains scripts for managing the Firestore database during development.

## Overview

The seeding system allows you to quickly populate your Firestore database with sample project data. This is useful for:

- **Development**: Test features with realistic data
- **Testing**: Ensure consistent test data across environments
- **Demos**: Showcase the app with professional-looking projects
- **Onboarding**: Help new developers get started quickly

## Quick Start

### Prerequisites

1. Ensure Firebase is configured in `config/firebase.ts`
2. Install dependencies: `npm install`

### Running the Seed Script

```bash
npm run seed
```

This command will:

1. ⚠️ **DELETE all existing projects** in the database
2. Add fresh seed data from `data/seedData.ts`
3. Display a detailed summary of the operation

### Expected Output

```
🌱 Starting Firebase Database Seeding
=====================================

⏰ Started at: 10/14/2025, 2:30:45 PM
📊 Projects to seed: 4

🗑️  Clearing existing projects...
✅ Deleted 4 existing project(s)

📦 Adding 4 seed projects...
   ✓ Added: "Luxury Master Bathroom Remodel" (bathroom) - ID: abc123
   ✓ Added: "Modern Guest Bathroom Update" (bathroom) - ID: def456
   ✓ Added: "Open Concept Kitchen Transformation" (kitchen) - ID: ghi789
   ✓ Added: "Farmhouse Kitchen Refresh" (kitchen) - ID: jkl012

=====================================
📊 Seeding Summary
=====================================
✅ Projects deleted: 4
✅ Projects added: 4
❌ Errors: 0
⏱️  Duration: 1234ms

🎉 Database seeding completed successfully!
```

## Adding New Projects

### Step 1: Edit Seed Data

Open `data/seedData.ts` and add a new project to the `seedProjects` array:

```typescript
{
  name: "Your Project Name",
  category: "bathroom", // or "kitchen", "outdoor", etc.
  briefDescription: "Short one-line description",
  longDescription: "Detailed multi-paragraph description...",
  thumbnail: "https://images.unsplash.com/photo-xxxxx?w=800&h=600&fit=crop",

  // PM information
  pms: [{ name: "Project Manager Name" }],

  // Empty arrays for media (can be populated later)
  pictures: [],
  documents: [],
  logs: [],

  // Location and client details
  location: "Austin, TX - Neighborhood",
  clientInfo: {
    name: "Client Name",
    address: "123 Street Name, Austin, TX 78701",
    phone: "(512) 555-0123",
    email: "client@email.com",
  },

  // Project timeline (ISO date strings)
  projectDates: {
    startDate: "2024-01-15T09:00:00.000Z",
    completionDate: "2024-03-10T17:00:00.000Z",
    estimatedCompletion: "2024-03-15T17:00:00.000Z",
  },

  status: "completed", // or "in-progress", "planning", "on-hold"

  // Metadata (ISO date strings)
  createdAt: "2024-01-10T14:30:00.000Z",
  updatedAt: "2024-03-10T17:00:00.000Z",

  // Additional details
  tags: ["tag1", "tag2", "tag3"],
  estimatedCost: 50000,
  actualCost: 48500,
}
```

### Step 2: Run the Seed Script

```bash
npm run seed
```

### Tips for Good Seed Data

- **Use real Unsplash URLs** for thumbnails (search unsplash.com for relevant images)
- **Write realistic descriptions** that showcase actual renovation work
- **Include variety** in project types, sizes, and costs
- **Use ISO date strings** for all dates (format: `YYYY-MM-DDTHH:MM:SS.000Z`)
- **Add relevant tags** to help with filtering and search
- **Include complete client info** for testing contact features
- **Vary the PMs** to test multi-PM scenarios

### Finding Good Images

1. Go to [Unsplash](https://unsplash.com)
2. Search for relevant terms: "modern bathroom", "kitchen remodel", etc.
3. Right-click on an image → Copy Image Address
4. Append `?w=800&h=600&fit=crop` to the URL for consistent sizing

Example: `https://images.unsplash.com/photo-1234567890?w=800&h=600&fit=crop`

## File Structure

```
scripts/
├── README.md           # This file
└── seedFirebase.ts     # Main seeding script

data/
└── seedData.ts         # Seed project data
```

## Script Architecture

### `seedFirebase.ts`

The main seeding script with the following functions:

- **`validateProject()`** - Validates project data structure before insertion
- **`clearProjects()`** - Deletes all existing projects from Firestore
- **`addSeedProjects()`** - Adds seed projects to Firestore
- **`main()`** - Orchestrates the seeding process

### `seedData.ts`

Contains the `seedProjects` array with sample project data. Each project:

- Matches the `Project` interface (minus the auto-generated `id`)
- Includes all required fields
- Uses TypeScript for type safety
- Is well-documented with inline comments

## Troubleshooting

### Error: "Firebase not initialized"

**Problem**: Firebase configuration is missing or incorrect.

**Solution**:

1. Check that `config/firebase.ts` exists and is properly configured
2. Verify your Firebase credentials are correct
3. Ensure you're connected to the internet

### Error: "Permission denied"

**Problem**: Firestore security rules are blocking the operation.

**Solution**:

1. Go to Firebase Console → Firestore Database → Rules
2. For development, temporarily set rules to allow all:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
3. ⚠️ **Never use these rules in production!**

### Error: "Module not found: tsx"

**Problem**: The `tsx` package is not installed.

**Solution**:

```bash
npm install
```

### Script runs but no data appears in app

**Problem**: The app might be caching old data or not refetching.

**Solution**:

1. Refresh the app (shake device → Reload)
2. Check Firebase Console to verify data was added
3. Check the `ProjectsContext` is fetching correctly

### Validation errors

**Problem**: Seed data doesn't match the `Project` interface.

**Solution**:

1. Read the error message carefully - it tells you which field is invalid
2. Check `types/Project.ts` for the correct interface structure
3. Ensure all required fields are present
4. Verify date strings are in ISO format
5. Confirm arrays are actually arrays (not null/undefined)

## ⚠️ Important Warnings

### Development Only

**This script is for DEVELOPMENT ONLY.** It will:

- Delete ALL existing projects in your database
- Cannot be undone
- Should NEVER be run in production

### Data Loss

Running `npm run seed` will permanently delete all projects in your Firestore database. Make sure you:

- Are connected to the correct Firebase project (development, not production)
- Have backups if needed
- Understand the data will be replaced

### Security Rules

For the seed script to work, your Firestore security rules must allow write access. In development, this is fine. In production, always use proper authentication and authorization rules.

## Advanced Usage

### Seeding Specific Categories

To seed only certain project types, edit `data/seedData.ts` and comment out unwanted projects:

```typescript
export const seedProjects: Omit<Project, "id">[] = [
  // Bathroom projects
  {
    /* ... */
  },

  // Kitchen projects (commented out for now)
  // { /* ... */ },
];
```

### Adding Media to Projects

The seed data currently uses empty arrays for `pictures`, `documents`, and `logs`. To add media:

1. Upload images to a hosting service (Unsplash, Firebase Storage, etc.)
2. Add picture objects to the `pictures` array:
   ```typescript
   pictures: [
     {
       id: "pic-1",
       url: "https://...",
       thumbnailUrl: "https://...",
       altText: "Description",
       type: "before",
       description: "Original condition",
       order: 1,
       createdAt: "2024-01-15T00:00:00.000Z",
     },
   ],
   ```

### Running in CI/CD

To run the seed script in a CI/CD pipeline:

```bash
# Set Firebase credentials as environment variables
export FIREBASE_API_KEY="..."
export FIREBASE_PROJECT_ID="..."

# Run the seed script
npm run seed
```

## Support

If you encounter issues not covered here:

1. Check the console output for detailed error messages
2. Verify your Firebase configuration
3. Ensure all dependencies are installed
4. Check Firestore security rules
5. Review the `Project` interface in `types/Project.ts`

## Future Enhancements

Potential improvements to the seeding system:

- [ ] Add option to seed without clearing existing data
- [ ] Support for seeding other collections (users, settings, etc.)
- [ ] Import data from CSV/JSON files
- [ ] Seed data generators for testing (faker.js)
- [ ] Environment-specific seed data (dev vs staging)
- [ ] Incremental seeding (add new projects without clearing)
