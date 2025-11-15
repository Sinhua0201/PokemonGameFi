'use client';

import { useState } from 'react';
import { useAllStarters, useRandomPokemon } from '@/hooks/usePokemon';
import { PokemonCard, PokemonSprite } from '@/components/PokemonCard';
import { PokemonData } from '@/lib/api';
import { toast } from 'sonner';

export default function TestPokemonPage() {
  const { data: startersData, isLoading: startersLoading } = useAllStarters();
  const randomPokemon = useRandomPokemon();
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);

  const handleGetRandom = async () => {
    try {
      const pokemon = await randomPokemon.mutateAsync();
      setSelectedPokemon(pokemon);
      toast.success(`Found ${pokemon.name}!`);
    } catch (error) {
      toast.error('Failed to fetch random Pokémon');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎮 Animated Pokémon Test
          </h1>
          <p className="text-xl text-gray-300">
            Testing animated GIF sprites from PokéAPI
          </p>
        </div>

        {/* Random Pokemon Section */}
        <div className="mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Random Pokémon Generator
            </h2>
            
            <div className="flex justify-center mb-6">
              <button
                onClick={handleGetRandom}
                disabled={randomPokemon.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {randomPokemon.isPending ? '🔄 Loading...' : '🎲 Get Random Pokémon'}
              </button>
            </div>

            {selectedPokemon && (
              <div className="flex justify-center">
                <div className="max-w-sm">
                  <PokemonCard pokemon={selectedPokemon} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Starter Pokemon Grid */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Starter Pokémon (Animated)
          </h2>
          
          {startersLoading ? (
            <div className="text-center text-white text-xl">
              Loading starters...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {startersData?.starters.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  onClick={() => {
                    setSelectedPokemon(pokemon);
                    toast.success(`Selected ${pokemon.name}!`);
                  }}
                  selected={selectedPokemon?.id === pokemon.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sprite Size Examples */}
        {selectedPokemon && (
          <div className="mt-12 bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">
              Sprite Sizes for {selectedPokemon.name}
            </h2>
            
            <div className="flex justify-center items-end gap-8">
              <div className="text-center">
                <PokemonSprite sprite={selectedPokemon.sprite} name={selectedPokemon.name} size="sm" />
                <p className="text-white mt-2">Small</p>
              </div>
              <div className="text-center">
                <PokemonSprite sprite={selectedPokemon.sprite} name={selectedPokemon.name} size="md" />
                <p className="text-white mt-2">Medium</p>
              </div>
              <div className="text-center">
                <PokemonSprite sprite={selectedPokemon.sprite} name={selectedPokemon.name} size="lg" />
                <p className="text-white mt-2">Large</p>
              </div>
              <div className="text-center">
                <PokemonSprite sprite={selectedPokemon.sprite} name={selectedPokemon.name} size="xl" />
                <p className="text-white mt-2">Extra Large</p>
              </div>
            </div>

            {/* Battle Sprites */}
            {selectedPokemon.back_sprite && (
              <div className="mt-8">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  Battle View
                </h3>
                <div className="flex justify-center items-center gap-12">
                  <div className="text-center">
                    <PokemonSprite sprite={selectedPokemon.back_sprite} name={`${selectedPokemon.name} (back)`} size="xl" />
                    <p className="text-white mt-2">Your Pokémon</p>
                  </div>
                  <div className="text-4xl">⚔️</div>
                  <div className="text-center">
                    <PokemonSprite sprite={selectedPokemon.sprite} name={selectedPokemon.name} size="xl" />
                    <p className="text-white mt-2">Opponent</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-12 text-center text-gray-300">
          <p className="text-sm">
            ✨ All sprites are animated GIFs from PokéAPI Generation V (Black/White)
          </p>
          <p className="text-sm mt-2">
            🎮 These sprites will be used in battles, encounters, and your collection
          </p>
        </div>
      </div>
    </div>
  );
}
