'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
  onSelectRegion: (region: CensusRegion) => void;
  selectedRegion?: CensusRegion;
}

export default function SearchBar({ regions, onSelectRegion, selectedRegion }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search regions..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-full pl-10 pr-10 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900 placeholder-gray-400 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && searchQuery && filteredRegions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 max-h-64 overflow-y-auto">
          {filteredRegions.map((region) => (
            <button
              key={region.name}
              onClick={() => {
                onSelectRegion(region);
                setSearchQuery('');
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                selectedRegion?.name === region.name ? 'bg-blue-100' : ''
              }`}
            >
              <div className="font-semibold text-gray-900">{region.name}</div>
              <div className="text-sm text-gray-600">
                {(region.demographics.total_population / 1_000_000).toFixed(1)}M population
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

