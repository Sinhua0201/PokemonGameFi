'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Hook to check if user has completed initial setup
 * Redirects to /start-game if not completed
 */
export function useRequireSetup() {
  const router = useRouter();
  const pathname = usePathname();
  const account = useCurrentAccount();
  const [isChecking, setIsChecking] = useState(true);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);

  useEffect(() => {
    const checkSetup = async () => {
      // Skip check if on start-game page or no account
      if (pathname === '/start-game' || !account?.address) {
        setIsChecking(false);
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

        // Setup is complete
        console.log('✅ Setup complete');
        setHasCompletedSetup(true);
      } catch (error) {
        console.error('Error checking setup:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkSetup();
  }, [account, pathname, router]);

  return { isChecking, hasCompletedSetup };
}
