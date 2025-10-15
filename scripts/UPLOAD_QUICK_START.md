# Firebase Storage Upload - Quick Start Guide

## Prerequisites Checklist

- [ ] Firebase Storage is enabled in your project
- [ ] `config/firebase.ts` is properly configured
- [ ] Local assets folder exists and follows naming conventions
- [ ] Firebase Storage rules allow writes (temporarily for upload)

## Step-by-Step Upload Process

### 1. Update Configuration

Edit `scripts/config/uploadConfig.ts`:

```typescript
export const LOCAL_PHOTOS_PATH =
  "/Users/eliharel/Code/Projects/ace-remodeling-assets/kitchen";
```

### 2. Set Firebase Storage Rules

Go to: **Firebase Console → Storage → Rules**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;  // ⚠️ TEMPORARY
    }
  }
}
```

Click **Publish**

### 3. Preview Upload (Dry Run)

```bash
npm run upload:dry-run
```

Review the output:

- Check project count and file count
- Verify categorization looks correct
- Look for any warnings about large files
- Confirm folder structure is detected properly

### 4. Perform Upload

```bash
npm run upload
```

Watch for:

- ✅ = Successfully uploaded
- ⏭️ = Skipped (already exists)
- ❌ = Error (will be listed at end)

### 5. Verify in Firebase

Go to: **Firebase Console → Storage → Files**

Navigate to `projects/` folder and verify:

- Projects are organized by slug (e.g., `104-luxe-revival/`)
- Photos are in `photos/` subfolders by category
- Documents are in `documents/` subfolders by category
- Download URLs work (click a file to get URL)

### 6. Secure Storage Rules

**IMPORTANT!** Go back to Storage Rules and secure:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;  // ✅ Secured!
    }
  }
}
```

Click **Publish**

### 7. Use Generated Data

Find the generated JSON at: `scripts/output/kitchen-projects.json`

This contains all the URLs and metadata you need to integrate into your Firestore seed data.

## Common Commands

```bash
# Normal upload (recommended)
npm run upload

# Preview without uploading
npm run upload:dry-run

# Upload specific project only
npm run upload -- --project 104

# Re-upload existing files (updates URLs)
npm run upload:force
```

## Folder Structure Example

Your local folder should look like:

```
/Users/you/ace-remodeling-assets/kitchen/
├── 104 - Luxe Revival - Kitchen/
│   ├── 104 - After Photos - Kitchen/
│   │   ├── IMG_001.jpg
│   │   └── IMG_002.jpg
│   ├── 104 - Before Images - Kitchen/
│   │   └── IMG_003.jpg
│   └── 104 - Plans - Kitchen/
│       └── floor-plan.pdf
├── 117 - Quiet Elegance - Kitchen/
│   ├── 117 - After Photos - Kitchen/
│   └── 117 - Before Photos - Kitchen/
└── ... (more projects)
```

## Troubleshooting

**"Folder not found"**

- Check LOCAL_PHOTOS_PATH in config matches your actual path
- Ensure folder exists and contains project subfolders

**"PERMISSION_DENIED"**

- Update Firebase Storage rules to allow writes
- Wait 10-30 seconds after publishing rules
- Try upload again

**Files in wrong categories**

- Check folder names match expected patterns
- Review category mappings in `uploadConfig.ts`
- Add custom mappings if needed

**Upload seems stuck**

- Reduce batch size: `npm run upload -- --batch-size 5`
- Check network connection
- Look for error messages in console

## Need Help?

See full documentation: `scripts/UPLOAD_README.md`

## After Upload

1. ✅ Verify files in Firebase Console
2. ✅ Secure Storage rules
3. ✅ Copy URLs from generated JSON
4. ✅ Integrate into your seed data
5. ✅ Test a few URLs in browser to confirm accessibility
6. ✅ Run `npm run seed` to update Firestore with new URLs

---

**Remember:** Always secure your Firebase Storage rules after uploading!
