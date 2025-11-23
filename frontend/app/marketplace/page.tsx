'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WalletGuard } from '@/components/WalletGuard';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { usePlayerPokemonNFT } from '@/hooks/usePlayerPokemonNFT';
import { usePlayerEggs } from '@/hooks/useBreeding';
import {
  useMarketplaceListings,
  useListPokemon,
  useListEgg,
  useBuyNFT,
  useCancelListing,
} from '@/hooks/useMarketplace';
import { MarketplaceGrid } from '@/components/MarketplaceGrid';
import { MarketplaceFilters } from '@/components/MarketplaceFilters';
import { ListNFTModal } from '@/components/ListNFTModal';
import { PurchaseConfirmModal } from '@/components/PurchaseConfirmModal';
import { MarketplaceListing, PokemonData } from '@/types/pokemon';
import { toast } from 'sonner';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { pokemonApi } from '@/lib/api';

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-400',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-700',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

export default function MarketplacePage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { pokemon, loading: loadingPokemon, refetch: refetchPokemon } = usePlayerPokemonNFT();
  const { eggs, isLoading: loadingEggs, refetch: refetchEggs } = usePlayerEggs();
  
  const [filters, setFilters] = useState<{
    nftType?: 'pokemon' | 'egg' | 'all';
    maxPrice?: number;
    searchTerm?: string;
  }>({});
  
  const [pokemonDataCache, setPokemonDataCache] = useState<Map<number, PokemonData>>(new Map());

  // Load Pokemon data from PokeAPI for types and other info
  useEffect(() => {
    const loadPokemonData = async () => {
      if (pokemon.length === 0) return;
      
      const dataMap = new Map<number, PokemonData>();
      const speciesIds = new Set<number>();
      
      // Collect all unique species IDs
      pokemon.forEach((poke: any) => {
        const speciesId = poke.speciesId || poke.species_id;
        if (speciesId) {
          speciesIds.add(speciesId);
        }
      });
      
      // Fetch data for each species
      for (const speciesId of speciesIds) {
        if (!pokemonDataCache.has(speciesId)) {
          try {
            const data = await pokemonApi.getPokemon(speciesId);
            dataMap.set(speciesId, data);
          } catch (error) {
            console.error(`Failed to load Pokemon ${speciesId}:`, error);
          }
        }
      }
      
      if (dataMap.size > 0) {
        setPokemonDataCache(new Map([...pokemonDataCache, ...dataMap]));
      }
    };
    
    loadPokemonData();
  }, [pokemon]);

  // Pokemon from usePlayerPokemonNFT are already in the correct format
  const pokemonNFTs = pokemon;
  
  const { listings, isLoading: loadingListings, refetch: refetchListings } = useMarketplaceListings({
    nftType: filters.nftType === 'all' ? undefined : filters.nftType,
    maxPrice: filters.maxPrice,
  });
  const { listPokemon, isLoading: listingPokemon } = useListPokemon();
  const { listEgg, isLoading: listingEgg } = useListEgg();
  const { buyNFT, isLoading: buying } = useBuyNFT();
  const { cancelListing, isLoading: cancelling } = useCancelListing();

  const [activeTab, setActiveTab] = useState<'browse' | 'myListings' | 'myNFTs'>('browse');
  const [showListModal, setShowListModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  const [selectedNFTType, setSelectedNFTType] = useState<'pokemon' | 'egg'>('pokemon');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);

  // Filter listings based on search term
  const filteredListings = listings.filter(listing => {
    if (!filters.searchTerm) return true;
    
    const searchLower = filters.searchTerm.toLowerCase();
    
    if (listing.nftType === 'pokemon' && listing.nftMetadata.species) {
      // This would need to match against Pokémon names
      // For now, just return true
      return true;
    }
    
    return true;
  });

  // Get user's active listings
  const myListings = listings.filter(
    listing => listing.sellerAddress === account?.address
  );

  const handleFilterChange = (newFilters: typeof filters) => {
    // Convert 'all' to undefined for the API
    const apiFilters = {
      ...newFilters,
      nftType: newFilters.nftType === 'all' ? undefined : newFilters.nftType,
    };
    setFilters(apiFilters);
  };

  const handleListNFT = (nft: any, type: 'pokemon' | 'egg') => {
    // Convert Pokemon data to expected format for modal
    const formattedNFT = type === 'pokemon' ? {
      data: {
        objectId: nft.id,
        content: {
          fields: {
            species_id: nft.speciesId || nft.species_id,
            name: nft.name,
            level: nft.level,
            experience: nft.experience,
            stats: {
              fields: {
                hp: nft.stats?.hp || nft.maxHp,
                attack: nft.stats?.attack || nft.attack,
                defense: nft.stats?.defense || nft.defense,
                speed: nft.stats?.speed || nft.speed,
              }
            },
            types: nft.types,
            owner: nft.owner,
          }
        }
      }
    } : nft;
    
    setSelectedNFT(formattedNFT);
    setSelectedNFTType(type);
    setShowListModal(true);
  };

  const handleListSubmit = async (nftId: string, price: number, metadata: any) => {
    try {
      toast.loading('Listing NFT...', { id: 'list' });

      if (selectedNFTType === 'pokemon') {
        await listPokemon(nftId, price, metadata);
      } else {
        await listEgg(nftId, price, metadata);
      }

      toast.success('NFT listed successfully!', { id: 'list' });

      // Update Firestore
      if (account?.address) {
        try {
          await updateDoc(doc(db, 'players', account.address), {
            lastActive: serverTimestamp(),
          });
        } catch (error) {
          console.error('Failed to update Firestore:', error);
        }
      }

      // Refresh data
      setTimeout(() => {
        refetchListings();
        refetchEggs();
        setActiveTab('myListings');
        // Pokemon will auto-refresh on next page load
      }, 2000);

    } catch (error) {
      console.error('Failed to list NFT:', error);
      toast.error('Failed to list NFT. Please try again.', { id: 'list' });
    }
  };

  const handleBuyClick = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setShowPurchaseModal(true);
  };

  const handleBuyConfirm = async () => {
    if (!selectedListing) return;

    try {
      toast.loading('Purchasing NFT...', { id: 'buy' });

      await buyNFT(selectedListing);

      toast.success('NFT purchased successfully!', { id: 'buy' });

      // Update Firestore
      if (account?.address) {
        try {
          await updateDoc(doc(db, 'players', account.address), {
            lastActive: serverTimestamp(),
          });
        } catch (error) {
          console.error('Failed to update Firestore:', error);
        }
      }

      setShowPurchaseModal(false);
      setSelectedListing(null);

      // Refresh data
      setTimeout(() => {
        refetchListings();
        // refetchPokemon removed
        refetchEggs();
      }, 2000);

    } catch (error) {
      console.error('Failed to purchase NFT:', error);
      toast.error('Failed to purchase NFT. Please try again.', { id: 'buy' });
    }
  };

  const handleCancelListing = async (listing: MarketplaceListing) => {
    try {
      toast.loading('Cancelling listing...', { id: 'cancel' });

      await cancelListing(listing);

      toast.success('Listing cancelled successfully!', { id: 'cancel' });

      // Update Firestore
      if (account?.address) {
        try {
          await updateDoc(doc(db, 'players', account.address), {
            lastActive: serverTimestamp(),
          });
        } catch (error) {
          console.error('Failed to update Firestore:', error);
        }
      }

      // Refresh data
      setTimeout(() => {
        refetchListings();
        // refetchPokemon removed
        refetchEggs();
      }, 2000);

    } catch (error) {
      console.error('Failed to cancel listing:', error);
      toast.error('Failed to cancel listing. Please try again.', { id: 'cancel' });
    }
  };

  if (loadingPokemon || loadingEggs) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4" />
            <p className="text-white text-lg">Loading marketplace...</p>
          </div>
        </div>
      </WalletGuard>
    );
  }

  return (
    <WalletGuard>
      <div className="pokemon-page">
        <div className="pokemon-container">
          {/* Header */}
          <div className="pokemon-header fade-in">
            <h1 className="pokemon-title">
              🏪 NFT Marketplace
            </h1>
            <p className="pokemon-subtitle">
              Buy, sell, and trade Pokémon and Egg NFTs
            </p>
          </div>

          {/* Tabs */}
          <div className="pokemon-tabs">
            <button
              onClick={() => setActiveTab('browse')}
              className={`pokemon-tab ${activeTab === 'browse' ? 'active' : ''}`}
            >
              🔍 Browse Listings
            </button>
            <button
              onClick={() => setActiveTab('myListings')}
              className={`pokemon-tab ${activeTab === 'myListings' ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              📋 My Listings
              {myListings.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  borderRadius: '9999px',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
                }}>
                  {myListings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('myNFTs')}
              className={`pokemon-tab ${activeTab === 'myNFTs' ? 'active' : ''}`}
            >
              🎒 My NFTs
            </button>
          </div>

          {/* Content */}
          <div className="pokemon-card fade-in">
            {activeTab === 'browse' && (
              <>
                <MarketplaceFilters onFilterChange={handleFilterChange} />
                <MarketplaceGrid
                  listings={filteredListings}
                  onBuy={handleBuyClick}
                  onCancel={handleCancelListing}
                  isLoading={loadingListings}
                />
              </>
            )}

            {activeTab === 'myListings' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Active Listings</h2>
                  <p className="text-gray-700 font-medium">Manage your NFTs currently listed for sale</p>
                </div>
                <MarketplaceGrid
                  listings={myListings}
                  onBuy={handleBuyClick}
                  onCancel={handleCancelListing}
                  isLoading={loadingListings}
                />
              </>
            )}

            {activeTab === 'myNFTs' && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your NFT Collection</h2>
                  <p className="text-gray-700 font-medium">Select an NFT to list it for sale</p>
                </div>

                {/* Pokémon Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Pokémon ({pokemonNFTs.length})
                    {loadingPokemon && <span className="text-sm text-gray-600 ml-2">(Loading...)</span>}
                  </h3>
                  {loadingPokemon ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-gray-800 font-semibold mt-4">Loading your Pokémon...</p>
                    </div>
                  ) : pokemonNFTs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎮</div>
                      <p className="text-gray-800 font-bold mb-2">You don't have any Pokémon NFTs yet</p>
                      <p className="text-gray-600 text-sm mb-4 font-medium">Get a starter Pokémon to begin!</p>
                      <button
                        onClick={() => router.push('/start-game')}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                      >
                        Get Starter Pokémon
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {pokemonNFTs.map((poke: any) => {
                        const speciesId = poke.speciesId || poke.species_id;
                        const pokemonData = pokemonDataCache.get(speciesId);
                        
                        const name = pokemonData?.name || poke.name || 'Unknown';
                        const level = poke.level || 1;
                        // Get types from PokeAPI data
                        const types = pokemonData?.types || ['normal'];
                        
                        const stats = poke.stats || {
                          hp: poke.maxHp || 0,
                          attack: poke.attack || 0,
                          defense: poke.defense || 0,
                          speed: poke.speed || 0
                        };
                        
                        return (
                          <div
                            key={poke.id}
                            className="bg-white rounded-lg p-4 border-2 border-gray-300 hover:border-purple-500 transition-all hover:scale-105 shadow-md hover:shadow-xl"
                          >
                            {/* Pokemon Image */}
                            <div className="flex justify-center mb-3">
                              <img
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${speciesId}.gif`}
                                alt={name}
                                className="w-24 h-24 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
                                }}
                              />
                            </div>
                            
                            {/* Pokemon Info */}
                            <div className="mb-3">
                              <p className="text-gray-900 font-bold text-lg mb-1 text-center">{name}</p>
                              <p className="text-gray-600 text-sm mb-2 font-semibold text-center">Level {level}</p>
                              
                              {/* Types */}
                              <div className="flex gap-1 justify-center mb-3">
                                {types.map((type: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className={`px-3 py-1 text-white rounded-full text-xs uppercase font-bold shadow-sm ${typeColors[type.toLowerCase()] || 'bg-gray-400'}`}
                                  >
                                    {type}
                                  </span>
                                ))}
                              </div>
                              
                              {/* Stats */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-red-50 rounded px-2 py-1 border border-red-200">
                                  <span className="text-red-600 font-semibold">HP:</span>{' '}
                                  <span className="text-gray-900 font-bold">{stats.hp}</span>
                                </div>
                                <div className="bg-orange-50 rounded px-2 py-1 border border-orange-200">
                                  <span className="text-orange-600 font-semibold">ATK:</span>{' '}
                                  <span className="text-gray-900 font-bold">{stats.attack}</span>
                                </div>
                                <div className="bg-blue-50 rounded px-2 py-1 border border-blue-200">
                                  <span className="text-blue-600 font-semibold">DEF:</span>{' '}
                                  <span className="text-gray-900 font-bold">{stats.defense}</span>
                                </div>
                                <div className="bg-green-50 rounded px-2 py-1 border border-green-200">
                                  <span className="text-green-600 font-semibold">SPD:</span>{' '}
                                  <span className="text-gray-900 font-bold">{stats.speed}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* List Button */}
                            <button
                              onClick={() => handleListNFT(poke, 'pokemon')}
                              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                              💰 List for Sale
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Eggs Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Eggs ({eggs.length})</h3>
                  {eggs.length === 0 ? (
                    <div className="text-center py-8 text-gray-700 font-semibold">
                      You don't have any Egg NFTs yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eggs.map((egg: any) => (
                        <div
                          key={egg.id}
                          className="bg-white rounded-lg p-4 border-2 border-gray-300 hover:border-purple-500 transition-all shadow-md hover:shadow-xl"
                        >
                          <div className="text-center mb-4">
                            <div className="text-6xl mb-2">🥚</div>
                            <p className="text-gray-900 font-bold">Pokémon Egg</p>
                            <p className="text-gray-600 text-sm font-semibold">
                              {egg.incubationSteps}/{egg.requiredSteps} steps
                            </p>
                          </div>
                          <button
                            onClick={() => handleListNFT(egg, 'egg')}
                            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                          >
                            List for Sale
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6 border-2 border-blue-400 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-2">ℹ️ Marketplace Info</h3>
            <ul className="text-gray-700 space-y-2 text-sm font-medium">
              <li>• All prices are in SUI tokens</li>
              <li>• Marketplace fee: 2.5% on all sales</li>
              <li>• Sellers receive 97.5% of the sale price</li>
              <li>• You can cancel your listings at any time</li>
              <li>• Purchased NFTs are transferred immediately to your wallet</li>
              <li>• Make sure you have enough SUI for gas fees</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ListNFTModal
        isOpen={showListModal}
        onClose={() => {
          setShowListModal(false);
          setSelectedNFT(null);
        }}
        nft={selectedNFT}
        nftType={selectedNFTType}
        onList={handleListSubmit}
        isLoading={listingPokemon || listingEgg}
      />

      <PurchaseConfirmModal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
        onConfirm={handleBuyConfirm}
        isLoading={buying}
      />
    </WalletGuard>
  );
}
