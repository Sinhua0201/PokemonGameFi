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
import { MarketplaceListing } from '@/types/pokemon';
import { toast } from 'sonner';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

  // Debug: Log pokemon data
  useEffect(() => {
    console.log('Marketplace - Pokemon data:', pokemon);
    console.log('Marketplace - Loading:', loadingPokemon);
    console.log('Marketplace - Account:', account?.address);
  }, [pokemon, loadingPokemon, account]);

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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🏪 NFT Marketplace
            </h1>
            <p className="text-gray-300">
              Buy, sell, and trade Pokémon and Egg NFTs
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              ← Back to Home
            </button>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all
                ${activeTab === 'browse'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              Browse Listings
            </button>
            <button
              onClick={() => setActiveTab('myListings')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all relative
                ${activeTab === 'myListings'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              My Listings
              {myListings.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {myListings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('myNFTs')}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all
                ${activeTab === 'myNFTs'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              My NFTs
            </button>
          </div>

          {/* Content */}
          <div className="bg-gray-800/50 rounded-2xl p-8 backdrop-blur-sm border border-gray-700">
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
                  <h2 className="text-2xl font-bold text-white mb-2">Your Active Listings</h2>
                  <p className="text-gray-400">Manage your NFTs currently listed for sale</p>
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
                  <h2 className="text-2xl font-bold text-white mb-2">Your NFT Collection</h2>
                  <p className="text-gray-400">Select an NFT to list it for sale</p>
                </div>

                {/* Pokémon Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Pokémon ({pokemonNFTs.length})
                    {loadingPokemon && <span className="text-sm text-gray-400 ml-2">(Loading...)</span>}
                  </h3>
                  {loadingPokemon ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                      <p className="text-gray-400 mt-4">Loading your Pokémon...</p>
                    </div>
                  ) : pokemonNFTs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎮</div>
                      <p className="text-gray-400 mb-2">You don't have any Pokémon NFTs yet</p>
                      <p className="text-gray-500 text-sm mb-4">Get a starter Pokémon to begin!</p>
                      <button
                        onClick={() => router.push('/starter')}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                      >
                        Get Starter Pokémon
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {pokemonNFTs.map((poke: any) => {
                        const speciesId = poke.speciesId || poke.species_id;
                        const name = poke.name || 'Unknown';
                        const level = poke.level || 1;
                        const types = poke.types || ['normal'];
                        
                        return (
                          <div
                            key={poke.id}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border-2 border-gray-700 hover:border-purple-500 transition-all hover:scale-105"
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
                            <div className="text-center mb-3">
                              <p className="text-white font-bold text-lg mb-1">{name}</p>
                              <p className="text-gray-400 text-sm mb-2">Level {level}</p>
                              <div className="flex gap-1 justify-center">
                                {types.map((type: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs uppercase"
                                  >
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {/* List Button */}
                            <button
                              onClick={() => handleListNFT(poke, 'pokemon')}
                              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                            >
                              List for Sale
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Eggs Section */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Eggs ({eggs.length})</h3>
                  {eggs.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      You don't have any Egg NFTs yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eggs.map((egg: any) => (
                        <div
                          key={egg.id}
                          className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700 hover:border-purple-500 transition-all"
                        >
                          <div className="text-center mb-4">
                            <div className="text-6xl mb-2">🥚</div>
                            <p className="text-white font-semibold">Pokémon Egg</p>
                            <p className="text-gray-400 text-sm">
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
          <div className="mt-8 bg-blue-900/30 rounded-lg p-6 border border-blue-500">
            <h3 className="text-lg font-bold text-white mb-2">ℹ️ Marketplace Info</h3>
            <ul className="text-gray-300 space-y-2 text-sm">
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
