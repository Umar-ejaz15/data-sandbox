'use client';

import React, { useEffect, useState } from 'react';
import { fetchCensusData } from '@/lib/fetchCensusData';
import { useAppStore } from '@/store/useAppStore';
import MetricsPanel from '../../components/MetricsPanel';
import DataInsights from '../../components/DataInsights';
import ComparisonMode from '../../components/ComparisonMode';

export default function OverviewPage() {
  const { censusData, setCensusData, setLoading, setError, isLoading, error } = useAppStore();
  const [localData, setLocalData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCensusData();
        setCensusData(data);
        setLocalData(data);
      } catch (err) {
        console.error('Failed to load census data:', err);
        setError('Failed to load census data. Please check the data file.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setCensusData, setLoading, setError]);

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

  const nationalData = localData?.regions?.find((r: any) => r.name === 'Pakistan') || null;

  const regions = localData?.regions?.filter((r: any) => r.name !== 'Pakistan') || [];

  const handleCompare = (selectedRegions: any[]) => {
    // Navigate to comparison page with selected regions
    const regionNames = selectedRegions.map(r => r.name).join(',');
    if (typeof window !== 'undefined') {
      window.location.href = `/compare?regions=${encodeURIComponent(regionNames)}`;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Overview</h1>
          <p className="text-gray-700 text-lg">Key national statistics and metrics</p>
        </div>
        {regions.length > 0 && (
          <ComparisonMode regions={regions} onCompare={handleCompare} />
        )}
      </div>

      {nationalData && <MetricsPanel nationalData={nationalData} />}
      
      {nationalData && regions.length > 0 && (
        <DataInsights regions={regions} nationalData={nationalData} />
      )}
    </div>
  );
}

