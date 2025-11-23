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
    <div className="bg-white rounded-lg p-6 mb-8 border-2 border-gray-300 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-purple-600 hover:text-purple-700 transition-colors font-semibold"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* NFT Type Filter */}
        <div>
          <label className="block text-gray-900 font-bold mb-2 text-sm">
            NFT Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleNftTypeChange('all')}
              className={`
                flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-all
                ${nftType === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
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
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
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
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }
              `}
            >
              Eggs
            </button>
          </div>
        </div>

        {/* Max Price Filter */}
        <div>
          <label className="block text-gray-900 font-bold mb-2 text-sm">
            Max Price (SUI)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={maxPrice}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            placeholder="Any price"
            className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm font-medium"
          />
        </div>

        {/* Search Filter */}
        <div>
          <label className="block text-gray-900 font-bold mb-2 text-sm">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:outline-none text-sm font-medium"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {(nftType !== 'all' || maxPrice || searchTerm) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-700 font-semibold">Active filters:</span>
          {nftType !== 'all' && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
              {nftType === 'pokemon' ? 'Pokémon' : 'Eggs'}
            </span>
          )}
          {maxPrice && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
              Max: {maxPrice} SUI
            </span>
          )}
          {searchTerm && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
              "{searchTerm}"
            </span>
          )}
        </div>
      )}
    </div>
  );
}
