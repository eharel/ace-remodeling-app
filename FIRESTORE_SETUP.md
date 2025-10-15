# Firestore Security Rules Setup

## Quick Setup for Development

To allow the seed script to work, you need to update your Firestore security rules.

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **ace-remodeling**
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update Rules for Development

Replace the existing rules with these **development-only** rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (DEVELOPMENT ONLY)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Publish Rules

1. Click **Publish** button
2. Wait for confirmation that rules are updated
3. Run `npm run seed` again

### Step 4: Verify

After running `npm run seed`, you should see:

```
🌱 Starting Firebase Database Seeding
=====================================

⏰ Started at: 10/14/2025, 2:30:45 PM
📊 Projects to seed: 4

🗑️  Clearing existing projects...
✅ Deleted 0 existing project(s)

📦 Adding 4 seed projects...
   ✓ Added: "Luxury Master Bathroom Remodel" (bathroom) - ID: abc123
   ✓ Added: "Modern Guest Bathroom Update" (bathroom) - ID: def456
   ✓ Added: "Open Concept Kitchen Transformation" (kitchen) - ID: ghi789
   ✓ Added: "Farmhouse Kitchen Refresh" (kitchen) - ID: jkl012

=====================================
📊 Seeding Summary
=====================================
✅ Projects deleted: 0
✅ Projects added: 4
❌ Errors: 0
⏱️  Duration: 1234ms

🎉 Database seeding completed successfully!
```

---

## ⚠️ IMPORTANT: Production Security Rules

**NEVER use the above rules in production!** They allow anyone to read and write your data.

### Production Rules (Example)

For production, use proper authentication and authorization:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Projects collection - read for all, write for authenticated users only
    match /projects/{projectId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Admin-only collections
    match /settings/{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Rule Testing

Firebase Console has a **Rules Playground** where you can test your rules before publishing:

1. Go to **Firestore Database** → **Rules** tab
2. Click **Rules Playground** at the top
3. Test different scenarios (authenticated/unauthenticated, different user roles)
4. Verify rules work as expected

---

## Troubleshooting

### "PERMISSION_DENIED" Error

**Cause**: Firestore security rules are blocking the operation.

**Solution**: Follow Step 2 above to update rules for development.

### Rules Not Taking Effect

**Cause**: Rules can take a few seconds to propagate.

**Solution**:

1. Wait 10-30 seconds after publishing
2. Try running `npm run seed` again
3. Check Firebase Console for any rule syntax errors

### Can't Access Firebase Console

**Cause**: You might not have the correct permissions or project access.

**Solution**:

1. Verify you're logged into the correct Google account
2. Ask the project owner to add you as an editor
3. Check that you're viewing the correct Firebase project

---

## Current Project Info

- **Project ID**: `ace-remodeling`
- **Project Name**: ACE Remodeling
- **Console URL**: https://console.firebase.google.com/project/ace-remodeling

---

## Next Steps

After setting up Firestore rules:

1. ✅ Run `npm run seed` to populate the database
2. ✅ Start your app: `npm start`
3. ✅ Navigate to Bathrooms or Kitchens tab
4. ✅ Verify projects are loading from Firebase
5. ✅ Check Firebase Console to see the data

---

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Reference](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Common Security Rules Patterns](https://firebase.google.com/docs/firestore/security/rules-conditions)
