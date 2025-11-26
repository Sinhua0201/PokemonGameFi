'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { CharacterPreview } from '@/components/CharacterPreview';
import { PageGuide } from '@/components/PageGuide';
import { LoadingProgress } from '@/components/LoadingProgress';
import { FriendlyError } from '@/components/FriendlyError';
import { SuccessModal } from '@/components/SuccessModal';
import { useMintPokemon } from '@/hooks/useMintPokemon';
import { toast } from 'sonner';
import { WalletConnect } from '@/components/WalletConnect';
import '@/styles/start-game.css';

const CHARACTERS = [
  { id: 1, name: 'Character 1', image: '/character1/shaded.png' },
  { id: 2, name: 'Character 2', image: '/character2/shaded.png' },
  { id: 3, name: 'Character 3', image: '/character3/shaded.png' },
  { id: 4, name: 'Character 4', image: '/character4/shaded.png' },
  { id: 5, name: 'Character 5', image: '/character5/shaded.png' },
  { id: 6, name: 'Character 6', image: '/character6/shaded.png' },
];

const STARTER_POKEMON = [
  { id: 1, name: 'Bulbasaur', types: ['grass', 'poison'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' },
  { id: 4, name: 'Charmander', types: ['fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' },
  { id: 7, name: 'Squirtle', types: ['water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png' },
  { id: 25, name: 'Pikachu', types: ['electric'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png' },
  { id: 133, name: 'Eevee', types: ['normal'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png' },
  { id: 152, name: 'Chikorita', types: ['grass'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/152.png' },
  { id: 155, name: 'Cyndaquil', types: ['fire'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/155.png' },
  { id: 158, name: 'Totodile', types: ['water'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/158.png' },
  { id: 175, name: 'Togepi', types: ['fairy'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/175.png' },
];

type Step = 'wallet' | 'character' | 'name' | 'pokemon';

export default function StartGamePage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { mintPokemon, isLoading: minting } = useMintPokemon();
  const [step, setStep] = useState<Step>('wallet');
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [trainerName, setTrainerName] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [mintingSteps, setMintingSteps] = useState<{label: string; completed: boolean}[]>([]);

  // Check if package ID is set
  const PACKAGE_ID = process.env.NEXT_PUBLIC_ONECHAIN_PACKAGE_ID;
  const isPackageIdSet = !!PACKAGE_ID && PACKAGE_ID !== '' && PACKAGE_ID !== '0x0';

  // Show warning if contracts not deployed
  useEffect(() => {
    if (!isPackageIdSet && account?.address) {
      toast.error('Smart contracts not deployed yet. Please deploy contracts first.', {
        duration: 10000,
      });
    }
  }, [isPackageIdSet, account]);

  // 检查用户是否已经完成设置
  useEffect(() => {
    const checkExistingSetup = async () => {
      if (!account?.address) return;

      try {
        const trainerRef = doc(db, 'trainers', account.address);
        const trainerSnap = await getDoc(trainerRef);

        if (trainerSnap.exists()) {
          const trainerData = trainerSnap.data();
          const hasCharacter = !!trainerData.characterId;
          const hasName = !!trainerData.name;
          const hasStarter = !!trainerData.starterPokemonId;

          if (hasCharacter && hasName && hasStarter) {
            // Setup already complete, redirect to explore
            toast.info('You already have a Pokémon!');
            router.push('/explore');
          }
        }
      } catch (error) {
        console.error('Error checking existing setup:', error);
      }
    };

    checkExistingSetup();
  }, [account, router]);

  // 自动进入下一步
  useEffect(() => {
    if (account && step === 'wallet') {
      setStep('character');
    }
  }, [account, step]);

  const handleCharacterSelect = (characterId: number) => {
    setSelectedCharacter(characterId);
    setStep('name');
  };

  const handleNameSubmit = () => {
    if (trainerName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    setStep('pokemon');
  };

  const handlePokemonSelect = async (pokemonId: number) => {
    if (!account?.address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isPackageIdSet) {
      setError('Smart contracts not deployed yet');
      return;
    }

    setSelectedPokemon(pokemonId);
    setError('');

    const pokemon = STARTER_POKEMON.find(p => p.id === pokemonId);
    if (!pokemon) {
      setError('Pokémon not found');
      return;
    }

    // Initialize steps
    setMintingSteps([
      { label: 'Creating trainer profile', completed: false },
      { label: 'Minting Pokémon NFT', completed: false },
      { label: 'Saving game data', completed: false },
      { label: 'Completing setup', completed: false },
    ]);

    try {
      // 步骤 1: 保存训练师信息
      const trainerData = {
        address: account.address,
        name: trainerName,
        characterId: selectedCharacter,
        starterPokemonId: pokemonId,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'trainers', account.address), trainerData);
      setMintingSteps(prev => prev.map((s, i) => i === 0 ? { ...s, completed: true } : s));

      // 步骤 2: 铸造宝可梦 NFT
      await mintPokemon({
        speciesId: pokemon.id,
        name: pokemon.name,
        types: pokemon.types,
      });
      setMintingSteps(prev => prev.map((s, i) => i === 1 ? { ...s, completed: true } : s));

      // 步骤 3: 保存玩家数据
      await setDoc(
        doc(db, 'players', account.address),
        {
          walletAddress: account.address,
          starterPokemonId: pokemon.id,
          starterPokemonName: pokemon.name,
          trainerName: trainerName,
          characterId: selectedCharacter,
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
      setMintingSteps(prev => prev.map((s, i) => i === 2 ? { ...s, completed: true } : s));

      // 步骤 4: 完成
      setMintingSteps(prev => prev.map((s, i) => i === 3 ? { ...s, completed: true } : s));
      
      // 显示成功模态框
      setShowSuccess(true);

    } catch (err: any) {
      console.error('Failed to complete setup:', err);
      setError(err.message || err.toString());
      setSelectedPokemon(null);
      setMintingSteps([]);
    }
  };

  return (
    <div className="start-game-container">
      {/* 错误提示 */}
      {error && (
        <FriendlyError
          error={error}
          onRetry={() => {
            setError('');
            if (selectedPokemon) {
              const pokemon = STARTER_POKEMON.find(p => p.id === selectedPokemon);
              if (pokemon) handlePokemonSelect(pokemon.id);
            }
          }}
          onDismiss={() => setError('')}
        />
      )}

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
          title="🎉 Welcome to PokéChain!"
          message={`You successfully obtained ${STARTER_POKEMON.find(p => p.id === selectedPokemon)?.name}!`}
          details={[
            { label: 'Trainer', value: trainerName },
            { label: 'Starter Pokémon', value: STARTER_POKEMON.find(p => p.id === selectedPokemon)?.name || '' },
            { label: 'Level', value: '5' },
          ]}
          primaryAction={{
            label: 'Start Adventure',
            href: '/explore'
          }}
        />
      )}

      {/* Minting Progress */}
      {minting && mintingSteps.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <LoadingProgress
            message="Setting up your game..."
            submessage="This may take 10-30 seconds, please don't close the page"
            steps={mintingSteps}
          />
        </div>
      )}

      <div className="max-w-4xl w-full">
        {/* Step 1: Connect Wallet */}
        {step === 'wallet' && (
          <div className="wallet-guard-content">
            <div className="pokeball-icon">
              <div className="pokeball-top"></div>
              <div className="pokeball-middle"></div>
              <div className="pokeball-bottom"></div>
              <div className="pokeball-center"></div>
            </div>

            <h1 className="wallet-guard-title">
              PokéChain Battles
            </h1>

            <p className="wallet-guard-subtitle">
              Connect your wallet to start your adventure
            </p>

            <div className="wallet-connect-wrapper">
              <WalletConnect />
            </div>

            <div className="wallet-guard-footer">
              <p>Don't have OneWallet?</p>
              <a
                href="https://chromewebstore.google.com/detail/onewallet/gclmcgmpkgblaglfokkaclneihpnbkli"
                target="_blank"
                rel="noopener noreferrer"
                className="download-link"
              >
                Download OneWallet Extension →
              </a>
            </div>
          </div>
        )}

        {/* Step 2: Select Character */}
        {step === 'character' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            {/* Progress Indicator */}
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-300">Step 2/4</p>
              <div className="flex gap-2 justify-center mt-2">
                <div className="w-12 h-1 bg-green-500 rounded" />
                <div className="w-12 h-1 bg-blue-500 rounded" />
                <div className="w-12 h-1 bg-gray-400 rounded" />
                <div className="w-12 h-1 bg-gray-400 rounded" />
              </div>
            </div>

            <PageGuide
              title="Choose Your Character"
              description="Select a character to represent you"
              tips={[
                'Click on any character to select',
                'Continue to the next step after selection'
              ]}
              storageKey="character-selection"
            />

            <h2 className="text-3xl font-bold text-white mb-4 text-center">Choose Your Character</h2>
            <p className="text-gray-300 text-center mb-6">Click on a character to select!</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleCharacterSelect(char.id)}
                  className={`relative rounded-xl overflow-hidden transition-all hover:scale-105 bg-white/5 p-3 ${
                    selectedCharacter === char.id
                      ? 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50'
                      : 'ring-2 ring-white/20 hover:ring-white/40'
                  }`}
                >
                  <CharacterPreview 
                    characterId={char.id} 
                    isSelected={selectedCharacter === char.id}
                  />
                  <div className="mt-2 bg-black/60 p-2 rounded-lg">
                    <p className="text-white font-semibold text-center">{char.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Enter Name */}
        {step === 'name' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">What's Your Name?</h2>
            <input
              type="text"
              value={trainerName}
              onChange={(e) => setTrainerName(e.target.value)}
              placeholder="Enter your trainer name"
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border-2 border-white/30 focus:border-yellow-400 focus:outline-none mb-6"
              maxLength={20}
            />
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('character')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNameSubmit}
                disabled={trainerName.trim().length < 2}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Select Starter Pokemon */}
        {step === 'pokemon' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4 text-center">Choose Your Starter Pokémon</h2>
            <p className="text-gray-200 text-center mb-8">This will be your first companion on your journey!</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {STARTER_POKEMON.map((pokemon) => (
                <button
                  key={pokemon.id}
                  onClick={() => handlePokemonSelect(pokemon.id)}
                  disabled={minting}
                  className={`relative bg-white/20 rounded-xl p-4 border-4 transition-all hover:scale-105 ${
                    selectedPokemon === pokemon.id
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
                      : 'border-white/20 hover:border-white/40'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="relative w-full aspect-square mb-2">
                    <Image
                      src={pokemon.image}
                      alt={pokemon.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white text-center">{pokemon.name}</h3>
                  <div className="flex gap-1 justify-center mt-1 flex-wrap">
                    {pokemon.types.map(type => (
                      <span key={type} className="text-xs px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded-full font-semibold capitalize">
                        {type}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            {minting && (
              <div className="text-center mt-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-2" />
                <p className="text-yellow-400 text-lg">Minting your Pokémon NFT...</p>
                <p className="text-gray-300 text-sm mt-1">This may take a few seconds</p>
              </div>
            )}
            <button
              onClick={() => setStep('name')}
              disabled={minting}
              className="mt-6 mx-auto block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
