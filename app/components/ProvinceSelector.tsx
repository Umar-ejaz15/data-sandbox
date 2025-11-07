'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ChevronDown } from 'lucide-react';

export default function ProvinceSelector() {
  const { provinces, selectedProvince, setSelectedProvince, selectedLevel } = useAppStore();

  if (selectedLevel !== 'province' && selectedLevel !== 'district') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Province
      </label>
      <select
        value={selectedProvince || ''}
        onChange={(e) => setSelectedProvince(e.target.value || null)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
      >
        <option value="">All Provinces</option>
        {provinces.map((province) => (
          <option key={province.province} value={province.province}>
            {province.province}
          </option>
        ))}
      </select>
    </div>
  );
}

