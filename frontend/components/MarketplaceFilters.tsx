'use client';

import { useState } from 'react';

interface MarketplaceFiltersProps {
  onFilterChange: (filters: {
    nftType?: 'pokemon' | 'egg' | 'all';
    maxPrice?: number;
    searchTerm?: string;
  }) => void;
}

export function MarketplaceFilters({ onFilterChange }: MarketplaceFiltersProps) {
  const [nftType, setNftType] = useState<'pokemon' | 'egg' | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleNftTypeChange = (type: 'pokemon' | 'egg' | 'all') => {
    setNftType(type);
    onFilterChange({
      nftType: type === 'all' ? undefined : type,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      searchTerm: searchTerm || undefined,
    });
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value);
    onFilterChange({
      nftType: nftType === 'all' ? undefined : nftType,
      maxPrice: value ? parseFloat(value) : undefined,
      searchTerm: searchTerm || undefined,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFilterChange({
      nftType: nftType === 'all' ? undefined : nftType,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      searchTerm: value || undefined,
    });
  };

  const handleClearFilters = () => {
    setNftType('all');
    setMaxPrice('');
    setSearchTerm('');
    onFilterChange({});
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Filters</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* NFT Type Filter */}
        <div>
          <label className="block text-white font-semibold mb-2 text-sm">
            NFT Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleNftTypeChange('all')}
              className={`
                flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all
                ${nftType === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              All
            </button>
            <button
              onClick={() => handleNftTypeChange('pokemon')}
              className={`
                flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all
                ${nftType === 'pokemon'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              Pokémon
            </button>
            <button
              onClick={() => handleNftTypeChange('egg')}
              className={`
                flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all
                ${nftType === 'egg'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              Eggs
            </button>
          </div>
        </div>

        {/* Max Price Filter */}
        <div>
          <label className="block text-white font-semibold mb-2 text-sm">
            Max Price (SUI)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={maxPrice}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            placeholder="Any price"
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border-2 border-gray-700 focus:border-purple-500 focus:outline-none text-sm"
          />
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-white font-semibold mb-2 text-sm">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border-2 border-gray-700 focus:border-purple-500 focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {(nftType !== 'all' || maxPrice || searchTerm) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-400">Active filters:</span>
          {nftType !== 'all' && (
            <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-xs">
              {nftType === 'pokemon' ? 'Pokémon' : 'Eggs'}
            </span>
          )}
          {maxPrice && (
            <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-xs">
              Max: {maxPrice} SUI
            </span>
          )}
          {searchTerm && (
            <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-xs">
              "{searchTerm}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}
