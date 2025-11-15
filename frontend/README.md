# PokéChain Battles - Frontend

Next.js 14 frontend for PokéChain Battles GameFi application.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Data Fetching:** React Query
- **Blockchain:** @mysten/dapp-kit, @mysten/sui.js
- **Database:** Firebase (Firestore, Auth, Storage)
- **Notifications:** Sonner

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── providers.tsx      # Client-side providers
│   ├── starter/           # Starter Pokémon page
│   ├── encounter/         # Wild encounter page
│   ├── battle/            # Battle page
│   ├── breeding/          # Breeding & incubation page
│   ├── marketplace/       # NFT marketplace page
│   └── profile/           # Player profile page
├── components/            # Reusable React components
│   ├── WalletConnect.tsx  # Wallet connection button
│   └── WalletGuard.tsx    # Protected route wrapper
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   └── auth.ts            # Authentication helpers
├── hooks/                 # Custom React hooks
├── store/                 # Zustand state stores
│   └── walletStore.ts     # Wallet state management
├── types/                 # TypeScript type definitions
│   └── pokemon.ts         # Pokémon-related types
├── config/                # Configuration files
│   └── constants.ts       # App constants
└── .env.local            # Environment variables
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OneChain Configuration
NEXT_PUBLIC_ONECHAIN_PACKAGE_ID=
NEXT_PUBLIC_ONECHAIN_NETWORK=testnet

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features

### Wallet Integration
- OneWallet connection via @mysten/dapp-kit
- Automatic Firebase Auth linking
- Wallet state management with Zustand

### NFT Management
- Query Pokémon and Egg NFTs from blockchain
- Mint new NFTs through smart contracts
- Update NFT attributes (level, XP, stats)

### Game Features
- Starter Pokémon selection
- Wild Pokémon encounters and capture
- Turn-based battle system
- Egg breeding and incubation
- NFT marketplace trading
- Player profile and collection

## Development Guidelines

### Component Structure
- Use `'use client'` directive for client components
- Server components by default for better performance
- Separate business logic into custom hooks

### State Management
- Zustand for global state (wallet, game session)
- React Query for server state (API data)
- Local state for component-specific data

### Styling
- TailwindCSS utility classes
- Responsive design (mobile-first)
- Dark theme by default

### Type Safety
- Strict TypeScript configuration
- Type definitions in `/types` directory
- Proper typing for all props and state

## Building for Production

```bash
npm run build
npm start
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or use the Vercel GitHub integration for automatic deployments.

## Troubleshooting

### OneWallet Not Detected
- Ensure OneWallet extension is installed
- Check browser compatibility (Chrome, Brave, Edge)
- Refresh the page after installing

### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firebase project configuration
- Ensure Firestore security rules allow access

### API Connection Failed
- Confirm backend is running on correct port
- Check CORS configuration in FastAPI
- Verify API_URL in environment variables

## Next Steps

1. Complete Firebase project setup
2. Deploy smart contracts to OneChain testnet
3. Configure backend API endpoints
4. Test wallet connection flow
5. Implement remaining game features

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [OneChain Developer Docs](https://onechain.io/docs)
- [@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
