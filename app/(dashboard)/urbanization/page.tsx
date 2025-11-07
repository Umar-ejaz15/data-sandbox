'use client';

import React, { useEffect } from 'react';
import { fetchCensusData } from '@/lib/fetchCensusData';
import { useAppStore } from '@/store/useAppStore';
import UrbanRuralChart from '../../components/charts/UrbanRuralChart';

export default function UrbanizationPage() {
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
          <p className="text-gray-800 text-lg font-semibold">Loading urbanization data...</p>
        </div>
      </div>
    );
  }

  const regions = censusData.regions.filter(r => r.name !== 'Pakistan');

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Urbanization Trends</h1>
        <p className="text-gray-700 text-sm sm:text-base lg:text-lg">Analysis of urban and rural population distribution</p>
      </div>
      <UrbanRuralChart regions={regions} />
    </div>
  );
}

