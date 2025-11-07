'use client';

import React, { useEffect } from 'react';
import { fetchCensusData } from '@/lib/fetchCensusData';
import { useAppStore } from '@/store/useAppStore';
import Disability3DChart from '../../components/charts/Disability3DChart';
import DisabilityBreakdownChart from '../../components/charts/DisabilityBreakdownChart';
import SearchBar from '../../components/SearchBar';

export default function DisabilityPage() {
  const { censusData, selectedRegion, setCensusData, setSelectedRegion, setLoading, setError, isLoading } = useAppStore();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchCensusData();
        setCensusData(data);
      } catch (err) {
        setError('Failed to load census data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setCensusData, setLoading, setError]);

  if (isLoading || !censusData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg font-semibold">Loading disability data...</p>
        </div>
      </div>
    );
  }

  const selectedRegionData = censusData.regions.find(r => r.name === selectedRegion) || censusData.regions[0];
  const regions = censusData.regions.filter(r => r.name !== 'Pakistan');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Disability & Functional Limitations</h1>
        <p className="text-gray-700 text-lg">Comprehensive disability statistics and analysis</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
        <label className="block text-sm font-bold text-gray-900 mb-2">Search or Select Region</label>
        <div className="flex gap-4">
          <div className="flex-1">
            <SearchBar 
              regions={censusData.regions}
              onSelectRegion={(region) => setSelectedRegion(region.name)}
              selectedRegion={selectedRegionData}
            />
          </div>
          <div className="w-64">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl shadow-md font-semibold text-gray-900 cursor-pointer"
            >
              {censusData.regions.map(r => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Disability3DChart regions={regions} />
        <DisabilityBreakdownChart region={selectedRegionData} />
      </div>
    </div>
  );
}

