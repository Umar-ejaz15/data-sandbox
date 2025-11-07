'use client';

import React, { useState } from 'react';
import { X, Plus, BarChart3 } from 'lucide-react';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
  onCompare: (selectedRegions: CensusRegion[]) => void;
}

export default function ComparisonMode({ regions, onCompare }: Props) {
  const [selectedRegions, setSelectedRegions] = useState<CensusRegion[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addRegion = (region: CensusRegion) => {
    if (selectedRegions.length < 3 && !selectedRegions.find(r => r.name === region.name)) {
      setSelectedRegions([...selectedRegions, region]);
    }
  };

  const removeRegion = (regionName: string) => {
    setSelectedRegions(selectedRegions.filter(r => r.name !== regionName));
  };

  const handleCompare = () => {
    if (selectedRegions.length >= 2) {
      onCompare(selectedRegions);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-sm sm:text-base"
      >
        <BarChart3 className="h-4 w-4 flex-shrink-0" />
        <span className="hidden sm:inline">Compare Regions</span>
        <span className="sm:hidden">Compare</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Compare Regions (Max 3)</h3>
            
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {selectedRegions.map((region) => (
                <div key={region.name} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                  <span className="font-semibold text-gray-900">{region.name}</span>
                  <button
                    onClick={() => removeRegion(region.name)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto border-t-2 border-gray-200 pt-4">
              {regions
                .filter(r => !selectedRegions.find(sr => sr.name === r.name))
                .map((region) => (
                  <button
                    key={region.name}
                    onClick={() => addRegion(region)}
                    disabled={selectedRegions.length >= 3}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-semibold text-gray-900">{region.name}</div>
                    <div className="text-xs text-gray-600">
                      {(region.demographics.total_population / 1_000_000).toFixed(1)}M
                    </div>
                  </button>
                ))}
            </div>

            <button
              onClick={handleCompare}
              disabled={selectedRegions.length < 2}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              Compare {selectedRegions.length} Region{selectedRegions.length !== 1 ? 's' : ''}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

