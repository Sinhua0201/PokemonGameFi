# Firebase Setup Guide

This guide will help you set up Firebase for the PokéChain Battles project.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `pokechain-battles` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click "Create project"

## Step 2: Register Web App

1. In your Firebase project, click the web icon (</>) to add a web app
2. Enter app nickname: `PokéChain Battles Frontend`
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Configure Environment Variables

Update your `.env.local` file with the Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 4: Enable Firestore Database

1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (we'll add security rules later)
4. Choose a location (select closest to your users)
5. Click "Enable"

## Step 5: Create Firestore Collections

The following collections will be created automatically when the app runs:

- `players` - Player profiles and stats
- `gameState` - Active game sessions and quests
- `battleHistory` - Battle records
- `marketplaceListings` - NFT marketplace listings
- `pokemonCache` - Cached Pokémon data from PokéAPI

## Step 6: Deploy Security Rules

1. In Firebase Console, go to "Firestore Database" → "Rules"
2. Copy the contents of `firestore.rules` file
3. Paste into the rules editor
4. Click "Publish"

Alternatively, use Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

## Step 7: Enable Authentication

1. In Firebase Console, go to "Build" → "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Anonymous" authentication (for custom token auth)
5. Click "Save"

## Step 8: Create Firestore Indexes

For optimal query performance, create these composite indexes:

### Index 1: Battle History by Player
- Collection: `battleHistory`
- Fields:
  - `playerId` (Ascending)
  - `createdAt` (Descending)

### Index 2: Marketplace Listings
- Collection: `marketplaceListings`
- Fields:
  - `status` (Ascending)
  - `nftType` (Ascending)
  - `listedAt` (Descending)

### Index 3: Marketplace by Seller
- Collection: `marketplaceListings`
- Fields:
  - `sellerAddress` (Ascending)
  - `status` (Ascending)

To create indexes:
1. Go to "Firestore Database" → "Indexes"
2. Click "Create index"
3. Add the fields as specified above
4. Click "Create"

Or wait for the app to suggest indexes when queries fail, then click the provided link.

## Step 9: Enable Firebase Storage (Optional)

For caching Pokémon sprites and assets:

1. In Firebase Console, go to "Build" → "Storage"
2. Click "Get started"
3. Start in test mode
4. Click "Done"

## Step 10: Download Service Account Key (For Backend)

The FastAPI backend needs a service account key to authenticate:

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `serviceAccountKey.json`
4. Move it to your backend directory
5. **IMPORTANT:** Add `serviceAccountKey.json` to `.gitignore`

## Verification

Test your Firebase setup:

```bash
cd frontend
npm run dev
```

Open the browser console and check for:
- No Firebase initialization errors
- Successful connection to Firestore
- Authentication working when connecting wallet

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Check that your API key is correct in `.env.local`
- Ensure the API key is enabled in Google Cloud Console

### Error: "Missing or insufficient permissions"
- Verify Firestore security rules are deployed
- Check that authentication is enabled

### Error: "Quota exceeded"
- Firebase free tier has limits
- Upgrade to Blaze plan for production use

### Indexes not created
- Wait for Firebase to suggest indexes when queries fail
- Or manually create them as specified above

## Security Best Practices

1. **Never commit** `.env.local` or `serviceAccountKey.json` to git
2. **Enable App Check** in production to prevent abuse
3. **Review security rules** regularly
4. **Monitor usage** in Firebase Console
5. **Set up billing alerts** to avoid unexpected charges

## Next Steps

After Firebase is configured:
1. Test wallet connection and authentication
2. Verify Firestore read/write operations
3. Test caching mechanism
4. Deploy security rules to production
5. Set up Firebase Hosting (optional)

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
