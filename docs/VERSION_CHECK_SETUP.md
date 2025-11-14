# Version Check System - Firestore Setup

This document explains how to set up and maintain the Firestore document that controls the minimum required build number for the app.

## Overview

The version check system uses a Firestore document at `config/appVersion` to determine if users need to update their app. When a user's current build number is below the `minimumBuildNumber` value, they will see:
- A badge on the Settings tab
- A non-dismissible banner in the Settings screen prompting them to update via TestFlight

## Document Structure

**Path:** `config/appVersion`

**Fields:**
```typescript
{
  minimumBuildNumber: number  // The minimum build number required to use the app
}
```

## Initial Setup

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ace-remodeling**
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Data** tab

### Step 2: Create the Config Collection

1. If the `config` collection doesn't exist, you'll need to create it:
   - Click **Start collection** (if Firestore is empty)
   - Or click the **+** button next to your database name
2. Collection ID: `config`
3. Click **Next**

### Step 3: Create the appVersion Document

1. Document ID: `appVersion`
2. Click **Next**

### Step 4: Add the Field

1. **Field name:** `minimumBuildNumber`
2. **Field type:** Select `number` (not string!)
3. **Field value:** Enter your current deployed build number
   - Check `app.json` → `expo.ios.buildNumber` for the current value
   - Example: If your current build is `8`, enter `8`
4. Click **Save**

### Example Document

After setup, your document should look like this:

```
Collection: config
Document ID: appVersion
Fields:
  minimumBuildNumber: 8 (number)
```

## Development vs Production

### Separate Databases

If you're using separate Firestore databases for development and production:

**Development Database:**
- Set `minimumBuildNumber` to match your current dev build
- Can be more lenient for testing purposes

**Production Database:**
- Set `minimumBuildNumber` to match your current production build
- Should always reflect the minimum build that's actually deployed to TestFlight/App Store

### Finding Your Current Build Number

**In Code:**
- Check `app.json` → `expo.ios.buildNumber`
- Current value: `8` (as of this writing)

**In Firebase Console:**
- The build number is embedded in the app binary
- Users see it in Settings → App Version

## When to Update minimumBuildNumber

### Workflow for Deploying New Builds

1. **Before Creating a New Build:**
   - Update `app.json` with new build number (or use `npm run version:patch` which auto-increments)
   - Note the new build number

2. **After Creating and Deploying Build:**
   - Once the new build is successfully deployed to TestFlight
   - Update Firestore `config/appVersion.minimumBuildNumber` to the new build number
   - This ensures users on older builds will be prompted to update

3. **Example Scenario:**
   ```
   Current production build: 8
   minimumBuildNumber in Firestore: 8
   
   → Create build 9
   → Deploy build 9 to TestFlight
   → Update minimumBuildNumber to 9
   → Users on build 8 will now see update prompt
   ```

### Important Notes

- **Don't update before deploying:** Only update `minimumBuildNumber` AFTER the new build is successfully deployed
- **Don't skip builds:** If you deploy build 10, update to 10 (not 9 or 11)
- **Test first:** Test the update prompt in development before updating production

## Updating the Value

### Method 1: Firebase Console (Recommended)

1. Go to Firebase Console → Firestore Database → Data tab
2. Navigate to `config` collection
3. Click on `appVersion` document
4. Click the edit icon (pencil) next to `minimumBuildNumber`
5. Enter the new build number
6. Click **Update**

### Method 2: Firebase CLI (Advanced)

```bash
# Set minimumBuildNumber to 9
firebase firestore:set config/appVersion \
  --data '{"minimumBuildNumber": 9}' \
  --project ace-remodeling
```

## Troubleshooting

### Users Not Seeing Update Prompt

**Check 1: Document Exists**
- Verify `config/appVersion` document exists in Firestore
- Check that you're looking at the correct database (dev vs prod)

**Check 2: Field Type**
- Ensure `minimumBuildNumber` is type `number`, not `string`
- String values like `"8"` won't work correctly

**Check 3: Build Number**
- Verify the user's current build is actually below the minimum
- Check `app.json` → `expo.ios.buildNumber` to see what build they're on

**Check 4: Firestore Rules**
- Ensure your Firestore security rules allow reading from `config/appVersion`
- Example rule:
  ```javascript
  match /config/{document} {
    allow read: if true;  // Or your specific auth rules
  }
  ```

### Update Prompt Appears When It Shouldn't

**Check 1: Build Number Mismatch**
- The `minimumBuildNumber` might be set too high
- Lower it to match the currently deployed build

**Check 2: Multiple Databases**
- Verify you're checking the correct database (dev vs prod)
- The app might be pointing to a different Firebase project

### Console Errors

**Error: "Version config document does not exist"**
- The `config/appVersion` document hasn't been created yet
- Follow the Initial Setup steps above

**Error: "minimumBuildNumber is not a number"**
- The field type is incorrect (likely set as string)
- Delete the field and recreate it as type `number`

**Error: "Error fetching version config from Firestore"**
- Network connectivity issue
- Firestore security rules blocking access
- Check Firebase Console for any service issues

## Testing

### Test in Development

1. Set `minimumBuildNumber` to a value higher than your current dev build
2. Reload the app
3. You should see:
   - Badge on Settings tab
   - Banner in Settings screen
4. Tap "Update Now" to verify TestFlight link works

### Test in Production

1. Create a test build with a specific build number
2. Deploy to TestFlight
3. Install that build on a test device
4. Set `minimumBuildNumber` to a higher value
5. Open the app and verify update prompt appears

## Security Rules

Ensure your Firestore security rules allow reading the version config:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow reading version config (public read)
    match /config/appVersion {
      allow read: if true;
      // Only allow writes from admin/authenticated users
      allow write: if request.auth != null;
    }
  }
}
```

## Quick Reference

**Document Path:** `config/appVersion`  
**Field Name:** `minimumBuildNumber`  
**Field Type:** `number`  
**Current Production Build:** Check `app.json` → `expo.ios.buildNumber`  
**TestFlight URL:** `https://testflight.apple.com/join/6755127370`

## Related Files

- `shared/utils/versionUtils.ts` - Version checking utilities
- `shared/hooks/useVersionCheck.ts` - React hook for version checking
- `features/settings/components/UpdateBanner.tsx` - Update banner component
- `app/(tabs)/settings.tsx` - Settings screen integration
- `app/(tabs)/_layout.tsx` - Tab badge integration

