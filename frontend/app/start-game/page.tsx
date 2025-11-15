'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount, ConnectButton } from '@mysten/dapp-kit';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { CharacterPreview } from '@/components/CharacterPreview';

const CHARACTERS = [
  { id: 1, name: 'Character 1', image: '/character1/shaded.png' },
  { id: 2, name: 'Character 2', image: '/character2/shaded.png' },
  { id: 3, name: 'Character 3', image: '/character3/shaded.png' },
  { id: 4, name: 'Character 4', image: '/character4/shaded.png' },
  { id: 5, name: 'Character 5', image: '/character5/shaded.png' },
  { id: 6, name: 'Character 6', image: '/character6/shaded.png' },
];

const STARTER_POKEMON = [
  { id: 1, name: 'Bulbasaur', type: 'Grass', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png' },
  { id: 4, name: 'Charmander', type: 'Fire', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png' },
  { id: 7, name: 'Squirtle', type: 'Water', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png' },
];

type Step = 'wallet' | 'character' | 'name' | 'pokemon';

export default function StartGamePage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const [step, setStep] = useState<Step>('wallet');
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [trainerName, setTrainerName] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 检查用户是否已经创建过角色
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (account?.address) {
        const profileRef = doc(db, 'trainers', account.address);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          // 用户已经有角色了，直接跳转到首页
          router.push('/');
        }
      }
    };

    checkExistingProfile();
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
    setSelectedPokemon(pokemonId);
    setLoading(true);
    setError('');

    try {
      if (!account?.address) throw new Error('No wallet connected');

      // 保存训练师信息到 Firestore
      const trainerData = {
        address: account.address,
        name: trainerName,
        characterId: selectedCharacter,
        starterPokemonId: pokemonId,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'trainers', account.address), trainerData);

      // 跳转到选择初始 Pokemon 的铸造页面
      router.push(`/starter?pokemon=${pokemonId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Step 1: Connect Wallet */}
        {step === 'wallet' && (
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-8">Welcome to PokeChain</h1>
            <p className="text-xl text-gray-200 mb-12">Connect your wallet to start your adventure</p>
            <div className="flex justify-center">
              <ConnectButton className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-8 rounded-lg text-xl transition-colors" />
            </div>
          </div>
        )}

        {/* Step 2: Select Character */}
        {step === 'character' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STARTER_POKEMON.map((pokemon) => (
                <button
                  key={pokemon.id}
                  onClick={() => handlePokemonSelect(pokemon.id)}
                  disabled={loading}
                  className={`relative bg-white/20 rounded-xl p-6 border-4 transition-all hover:scale-105 ${
                    selectedPokemon === pokemon.id
                      ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
                      : 'border-white/20 hover:border-white/40'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="relative w-full aspect-square mb-4">
                    <Image
                      src={pokemon.image}
                      alt={pokemon.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white text-center">{pokemon.name}</h3>
                  <p className="text-yellow-400 text-center font-semibold">{pokemon.type} Type</p>
                </button>
              ))}
            </div>
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            {loading && (
              <p className="text-yellow-400 text-center mt-4">Creating your profile...</p>
            )}
            <button
              onClick={() => setStep('name')}
              disabled={loading}
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
