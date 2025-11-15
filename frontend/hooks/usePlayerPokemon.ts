/**
 * Hook to fetch player's Pokémon from Firestore
 */
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PlayerPokemon {
  id: string;
  species_id: number;
  name: string;
  level: number;
  experience: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite: string;
  owner: string;
  types: string[];
}

export function usePlayerPokemon(walletAddress: string | undefined) {
  const [pokemon, setPokemon] = useState<PlayerPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setPokemon([]);
      setLoading(false);
      return;
    }

    const fetchPokemon = async () => {
      try {
        setLoading(true);
        
        // Query Firestore for player's Pokémon
        const pokemonCollection = collection(db, 'pokemon');
        const q = query(pokemonCollection, where('owner', '==', walletAddress));
        const querySnapshot = await getDocs(q);
        
        const pokemonList: PlayerPokemon[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          pokemonList.push({
            id: doc.id,
            species_id: data.species_id || data.speciesId,
            name: data.name,
            level: data.level || 5,
            experience: data.experience || 0,
            maxHp: data.stats?.hp || data.maxHp || 35,
            currentHp: data.stats?.hp || data.currentHp || 35,
            attack: data.stats?.attack || data.attack || 50,
            defense: data.stats?.defense || data.defense || 50,
            speed: data.stats?.speed || data.speed || 50,
            sprite: data.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.species_id || data.speciesId}.png`,
            owner: data.owner,
            types: data.types || ['normal'],
          });
        });
        
        setPokemon(pokemonList);
        setError(null);
      } catch (err) {
        console.error('Error fetching player Pokémon:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [walletAddress]);

  return { pokemon, loading, error };
}
