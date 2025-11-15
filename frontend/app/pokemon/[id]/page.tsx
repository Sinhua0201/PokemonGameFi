/**
 * Static Pokémon Detail Page with ISR
 * Uses Incremental Static Regeneration for optimal performance
 */

import Image from 'next/image';
import { notFound } from 'next/navigation';

interface PokemonData {
  id: number;
  name: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
  sprite: string;
  rarity: string;
}

// Generate static params for first 151 Pokémon
export async function generateStaticParams() {
  // Generate paths for Generation 1 Pokémon
  return Array.from({ length: 151 }, (_, i) => ({
    id: String(i + 1),
  }));
}

// Fetch Pokémon data with ISR
async function getPokemonData(id: string): Promise<PokemonData | null> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/pokemon/${id}`, {
      next: { revalidate: 86400 }, // Revalidate every 24 hours
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching Pokémon:', error);
    return null;
  }
}

export default async function PokemonPage({ params }: { params: { id: string } }) {
  const pokemon = await getPokemonData(params.id);

  if (!pokemon) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold capitalize text-gray-900 dark:text-white">
                {pokemon.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">#{pokemon.id.toString().padStart(3, '0')}</p>
            </div>
            <div className="flex gap-2">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className="px-4 py-2 rounded-full text-white font-semibold capitalize"
                  style={{
                    backgroundColor: getTypeColor(type),
                  }}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Sprite */}
          <div className="flex justify-center mb-8">
            <div className="relative w-64 h-64">
              <Image
                src={pokemon.sprite}
                alt={pokemon.name}
                fill
                className="object-contain pixelated"
                priority
                sizes="(max-width: 768px) 100vw, 256px"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Base Stats</h2>
            {Object.entries(pokemon.stats).map(([stat, value]) => (
              <div key={stat} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                    {stat}
                  </span>
                  <span className="text-gray-900 dark:text-white font-bold">{value}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((value / 150) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Rarity */}
          <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
            <p className="text-center">
              <span className="text-gray-700 dark:text-gray-300">Rarity: </span>
              <span className="font-bold capitalize text-orange-600 dark:text-orange-400">
                {pokemon.rarity}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for type colors
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };
  return colors[type.toLowerCase()] || '#777';
}

// Metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }) {
  const pokemon = await getPokemonData(params.id);

  if (!pokemon) {
    return {
      title: 'Pokémon Not Found',
    };
  }

  return {
    title: `${pokemon.name} - PokéChain Battles`,
    description: `View ${pokemon.name}'s stats, types, and rarity in PokéChain Battles.`,
  };
}
