'use client';

import React, { useEffect, useState, useRef } from 'react';
import { fetchCensusData } from '@/lib/fetchCensusData';
import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues
const PakistanMap = dynamic(() => import('../../components/PakistanMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-semibold">Loading map...</p>
      </div>
    </div>
  )
});

export default function MapPage() {
  const [censusData, setCensusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'population' | 'literacy' | 'density' | 'growth'>('population');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCensusData();
        setCensusData(data);
      } catch (err) {
        console.error('Failed to load census data:', err);
        setError('Failed to load census data. Please check the data file.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg font-semibold">Loading census data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md">
          <p className="text-red-700 text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const regions = censusData?.regions?.filter((r: any) => r.name !== 'Pakistan') || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Interactive Map
          </h1>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
            Explore Pakistan's 2023 Census data on an interactive map
          </p>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <span className="text-sm font-semibold text-gray-700 flex items-center">View by:</span>
          {[
            { value: 'population', label: 'Population', activeClass: 'bg-blue-600 text-white shadow-lg', inactiveClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
            { value: 'literacy', label: 'Literacy Rate', activeClass: 'bg-green-600 text-white shadow-lg', inactiveClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
            { value: 'density', label: 'Population Density', activeClass: 'bg-purple-600 text-white shadow-lg', inactiveClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
            { value: 'growth', label: 'Growth Rate', activeClass: 'bg-orange-600 text-white shadow-lg', inactiveClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200' }
          ].map((metric) => (
            <button
              key={metric.value}
              onClick={() => setSelectedMetric(metric.value as any)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedMetric === metric.value
                  ? metric.activeClass
                  : metric.inactiveClass
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Component */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <PakistanMap regions={regions} selectedMetric={selectedMetric} />
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-200 shadow-sm">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Map Legend</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {regions.map((region: any) => {
            let value = 0;
            let formattedValue = '';
            let colorClass = 'bg-blue-500';
            
            switch (selectedMetric) {
              case 'population':
                value = region.demographics?.total_population || 0;
                formattedValue = `${(value / 1_000_000).toFixed(2)}M`;
                colorClass = 'bg-blue-500';
                break;
              case 'literacy':
                value = region.education?.total?.literacy_rate || 0;
                formattedValue = `${value.toFixed(1)}%`;
                colorClass = 'bg-green-500';
                break;
              case 'density':
                value = region.demographics?.density_per_sq_km || 0;
                formattedValue = `${value.toFixed(1)} per sq km`;
                colorClass = 'bg-purple-500';
                break;
              case 'growth':
                value = region.demographics?.annual_growth_rate_2017_2023 || 0;
                formattedValue = `${value.toFixed(2)}%`;
                colorClass = 'bg-orange-500';
                break;
            }

            return (
              <div key={region.name} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                <div className={`w-5 h-5 rounded shadow-sm ${colorClass}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{region.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">{formattedValue}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

