'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Home() {
  const router = useRouter();
  const account = useCurrentAccount();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSetupAndRedirect = async () => {
      // If no wallet connected, redirect to start-game
      if (!account?.address) {
        router.push('/start-game');
        return;
      }

      try {
        // Check if trainer profile exists
        const trainerRef = doc(db, 'trainers', account.address);
        const trainerSnap = await getDoc(trainerRef);

        if (!trainerSnap.exists()) {
          // No trainer profile, redirect to start-game
          console.log('❌ No trainer profile found, redirecting to /start-game');
          router.push('/start-game');
          return;
        }

        const trainerData = trainerSnap.data();
        
        // Check if all required fields are present
        const hasCharacter = !!trainerData.characterId;
        const hasName = !!trainerData.name;
        const hasStarter = !!trainerData.starterPokemonId;

        if (!hasCharacter || !hasName || !hasStarter) {
          // Incomplete setup, redirect to start-game
          console.log('❌ Incomplete setup, redirecting to /start-game');
          router.push('/start-game');
          return;
        }

        // Setup is complete, redirect to explore
        console.log('✅ Setup complete, redirecting to /explore');
        router.push('/explore');
      } catch (error) {
        console.error('Error checking setup:', error);
        // On error, redirect to start-game to be safe
        router.push('/start-game');
      } finally {
        setChecking(false);
      }
    };

    checkSetupAndRedirect();
  }, [account, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="text-white text-2xl">
        {checking ? 'Checking your profile...' : 'Redirecting...'}
      </div>
    </div>
  );
}
