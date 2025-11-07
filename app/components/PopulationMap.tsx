'use client';

import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Map, Users, User, UserCheck, Building2, Home as HomeIcon, Loader2 } from 'lucide-react';

export default function PopulationMap() {
  const { provinces, national, isLoading } = useAppStore();
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const data = national || provinces[0];
    if (!data) return;

    // Create a modern visual representation
    mapContainer.current.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
        <div class="flex items-center space-x-2 mb-6">
          <div class="text-3xl font-bold text-gray-800">${data.province}</div>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-lg mb-6">
          <div class="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            ${(data.totalPopulation / 1_000_000).toFixed(2)}M
          </div>
          <div class="text-gray-600 text-center font-medium">Total Population</div>
        </div>
        <div class="grid grid-cols-2 gap-4 w-full max-w-md">
          <div class="bg-white rounded-xl p-4 shadow-md text-center hover:shadow-lg transition-shadow">
            <div class="text-2xl font-bold text-blue-600 mb-1">${((data.male / data.totalPopulation) * 100).toFixed(1)}%</div>
            <div class="text-xs text-gray-600 font-medium">Male</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-md text-center hover:shadow-lg transition-shadow">
            <div class="text-2xl font-bold text-pink-600 mb-1">${((data.female / data.totalPopulation) * 100).toFixed(1)}%</div>
            <div class="text-xs text-gray-600 font-medium">Female</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-md text-center hover:shadow-lg transition-shadow">
            <div class="text-2xl font-bold text-purple-600 mb-1">${((data.urban / data.totalPopulation) * 100).toFixed(1)}%</div>
            <div class="text-xs text-gray-600 font-medium">Urban</div>
          </div>
          <div class="bg-white rounded-xl p-4 shadow-md text-center hover:shadow-lg transition-shadow">
            <div class="text-2xl font-bold text-green-600 mb-1">${((data.rural / data.totalPopulation) * 100).toFixed(1)}%</div>
            <div class="text-xs text-gray-600 font-medium">Rural</div>
          </div>
        </div>
      </div>
    `;
  }, [provinces, national]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Map className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Population Overview</h2>
        </div>
        <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading map data...</span>
          </div>
        </div>
      </div>
    );
  }

  const data = national || provinces[0];
  if (!data) {
    return (
      <div className="w-full h-full bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <Map className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Population Overview</h2>
        </div>
        <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg p-4 border border-gray-100">
      <div className="flex items-center space-x-2 mb-4">
        <Map className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Population Overview</h2>
      </div>
      <div ref={mapContainer} className="w-full h-96 rounded-xl overflow-hidden"></div>
    </div>
  );
}
