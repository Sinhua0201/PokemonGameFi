/**
 * React hooks for Pokémon data fetching
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { pokemonApi, PokemonData } from '@/lib/api';

/**
 * Fetch Pokémon by ID
 */
export function usePokemon(id: number) {
  return useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => pokemonApi.getPokemon(id),
    staleTime: 1000 * 60 * 60, // 1 hour (Pokémon data doesn't change)
    enabled: id > 0,
  });
}

/**
 * Fetch random Pokémon
 */
export function useRandomPokemon(rarity?: string) {
  return useMutation({
    mutationFn: () => pokemonApi.getRandomPokemon(rarity),
  });
}

/**
 * Fetch random starter Pokémon
 */
export function useRandomStarter() {
  return useMutation({
    mutationFn: () => pokemonApi.getRandomStarter(),
  });
}

/**
 * Fetch all starter Pokémon
 */
export function useAllStarters() {
  return useQuery({
    queryKey: ['starters'],
    queryFn: () => pokemonApi.getAllStarters(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Get multiple Pokémon by IDs
 */
export function useMultiplePokemon(ids: number[]) {
  return useQuery({
    queryKey: ['pokemon', 'multiple', ids],
    queryFn: async () => {
      const promises = ids.map(id => pokemonApi.getPokemon(id));
      return Promise.all(promises);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: ids.length > 0,
  });
}
