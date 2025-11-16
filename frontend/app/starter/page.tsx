'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalletGuard } from '@/components/WalletGuard';
import { StarterSelection } from '@/components/StarterSelection';
import { usePlayerPokemon } from '@/hooks/usePlayerPokemon';
import { useMintPokemon } from '@/hooks/useMintPokemon';
import { useAllStarters } from '@/hooks/usePokemon';
import { PokemonData } from '@/lib/api';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

function StarterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPokemonId = searchParams.get('pokemon');
  const account = useCurrentAccount();
  const { pokemon: playerPokemonList, loading: checkingPokemon } = usePlayerPokemon(account?.address);
  const { data: startersData, isLoading: loadingStarters } = useAllStarters();
  const { mintPokemon, isLoading: minting } = useMintPokemon();
  const [selectedStarter, setSelectedStarter] = useState<PokemonData | null>(null);
  const [isAutoSelecting, setIsAutoSelecting] = useState(false);
  
  // Check if package ID is set
  const PACKAGE_ID = process.env.NEXT_PUBLIC_ONECHAIN_PACKAGE_ID;
  const isPackageIdSet = !!PACKAGE_ID && PACKAGE_ID !== '' && PACKAGE_ID !== '0x0';

  // Show warning if contracts not deployed
  useEffect(() => {
    if (!isPackageIdSet) {
      toast.error('Smart contracts not deployed yet. Please deploy contracts first.', {
        duration: 10000,
      });
    }
  }, [isPackageIdSet]);
  
  const hasPokemon = playerPokemonList.length > 0;
  const [hasSelectedStarter, setHasSelectedStarter] = useState(false);

  const handleSelectStarter = async (pokemon: PokemonData) => {
    if (!account?.address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!isPackageIdSet) {
      toast.error('Smart contracts not deployed. Please deploy contracts first.');
      return;
    }

    setSelectedStarter(pokemon);
    setHasSelectedStarter(true); // Mark that user has selected a starter

    try {
      // Mint the Pokémon NFT
      toast.loading('Minting your starter Pokémon...', { id: 'mint' });
      
      const result = await mintPokemon({
        speciesId: pokemon.id,
        name: pokemon.name,
        types: pokemon.types || ['normal'], // Use pokemon types or default to 'normal'
      });

      toast.success(`${pokemon.name} has been minted!`, { id: 'mint' });

      // Save player data to Firestore (Pokemon is already saved by useMintPokemon hook)
      try {
        await setDoc(
          doc(db, 'players', account.address),
          {
            walletAddress: account.address,
            starterPokemonId: pokemon.id,
            starterPokemonName: pokemon.name,
            createdAt: serverTimestamp(),
            lastActive: serverTimestamp(),
            stats: {
              totalBattles: 0,
              wins: 0,
              pokemonCaught: 1,
              eggsHatched: 0,
            },
          },
          { merge: true }
        );

        console.log('✅ Player data saved to Firestore');
      } catch (firestoreError) {
        console.error('⚠️ Failed to save player data to Firestore:', firestoreError);
      }

      // Show success message and redirect
      console.log('🎉 Minting complete! Redirecting to home page...');
      toast.success('Welcome to PokéChain Battles! Redirecting...', { duration: 2000 });
      
      // Force redirect to home page using both methods
      setTimeout(() => {
        console.log('⏰ Timeout triggered, redirecting...');
        // Use window.location for a hard redirect
        window.location.href = '/';
      }, 1500);

    } catch (error) {
      console.error('Failed to mint starter:', error);
      toast.error('Failed to mint Pokémon. Please try again.', { id: 'mint' });
      setSelectedStarter(null);
      setHasSelectedStarter(false); // Reset the flag on error
    }
  };

  // Auto-select Pokemon if coming from start-game page
  useEffect(() => {
    if (preselectedPokemonId && startersData?.starters && !selectedStarter && !isAutoSelecting) {
      const pokemon = startersData.starters.find(p => p.id === parseInt(preselectedPokemonId));
      if (pokemon) {
        setIsAutoSelecting(true);
        handleSelectStarter(pokemon);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedPokemonId, startersData]);

  // Redirect if player already has Pokémon (but not if they just selected one)
  useEffect(() => {
    if (!checkingPokemon && hasPokemon && !hasSelectedStarter) {
      toast.info('You already have a Pokémon!');
      router.push('/');
    }
  }, [hasPokemon, checkingPokemon, hasSelectedStarter, router]);

  if (checkingPokemon || loadingStarters || isAutoSelecting) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-white text-lg">
              {isAutoSelecting ? 'Minting your starter Pokémon...' : 'Loading starters...'}
            </p>
          </div>
        </div>
      </WalletGuard>
    );
  }

  if (!startersData?.starters || startersData.starters.length === 0) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="text-center">
            <p className="text-red-400 text-lg">Failed to load starter Pokémon</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </WalletGuard>
    );
  }

  return (
    <WalletGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
        <StarterSelection
          starters={startersData.starters}
          onSelect={handleSelectStarter}
          isLoading={minting}
        />
      </div>
    </WalletGuard>
  );
}

export default function StarterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <StarterPageContent />
    </Suspense>
  );
}
