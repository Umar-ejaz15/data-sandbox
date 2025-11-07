'use client';

import React, { useEffect } from 'react';
import { fetchCensusData } from '@/lib/fetchCensusData';
import { useAppStore } from '@/store/useAppStore';
import GrowthRateChart from '../../components/charts/GrowthRateChart';
import SexRatioChart from '../../components/charts/SexRatioChart';
import HouseholdSizeChart from '../../components/charts/HouseholdSizeChart';

export default function GrowthPage() {
  const { censusData, setCensusData, setLoading, setError, isLoading } = useAppStore();

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
          <p className="text-gray-800 text-lg font-semibold">Loading growth data...</p>
        </div>
      </div>
    );
  }

  const regions = censusData.regions.filter(r => r.name !== 'Pakistan');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Growth Rates & Trends</h1>
        <p className="text-gray-700 text-lg">Population growth trends and demographic indicators</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GrowthRateChart regions={regions} />
        <SexRatioChart regions={regions} />
      </div>
      <HouseholdSizeChart regions={regions} />
    </div>
  );
}

