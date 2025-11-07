'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Globe, MapPin, Building2, Database } from 'lucide-react';

export default function LevelSelector() {
  const { selectedLevel, setSelectedLevel, selectedTable, setSelectedTable, provinces } = useAppStore();

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Table Type Selector */}
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Table:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedTable('table_1')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTable === 'table_1'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Table-1
            </button>
            <button
              onClick={() => setSelectedTable('table_2')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTable === 'table_2'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Table-2
            </button>
          </div>
        </div>

        {/* Level Selector */}
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Level:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedLevel('national')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                selectedLevel === 'national'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>National</span>
            </button>
            <button
              onClick={() => setSelectedLevel('province')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                selectedLevel === 'province'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Province</span>
            </button>
            <button
              onClick={() => setSelectedLevel('district')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1 ${
                selectedLevel === 'district'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>District</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

