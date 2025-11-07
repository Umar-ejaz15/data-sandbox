'use client';

import React, { useEffect } from 'react';
import { fetchCensusData } from '@/lib/fetchCensusData';
import { useAppStore } from '@/store/useAppStore';
import Population3DChart from '../../components/charts/Population3DChart';
import GenderDistributionChart from '../../components/charts/GenderDistributionChart';
import SearchBar from '../../components/SearchBar';
import ExportButton from '../../components/ExportButton';

export default function DemographicsPage() {
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
          <p className="text-gray-800 text-lg font-semibold">Loading demographics data...</p>
        </div>
      </div>
    );
  }

  const selectedRegionData = censusData.regions.find(r => r.name === selectedRegion) || censusData.regions[0];
  const regions = censusData.regions.filter(r => r.name !== 'Pakistan');

  const handleExportImage = () => {
    // Export functionality - can be implemented with html2canvas
    alert('Export as Image feature - Ready to implement!');
  };

  const handleExportCSV = () => {
    // Export CSV functionality
    const csv = `Region,Population,Male,Female,Transgender\n${regions.map(r => 
      `${r.name},${r.demographics.total_population},${r.demographics.male},${r.demographics.female},${r.demographics.transgender}`
    ).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demographics_data.csv';
    a.click();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Demographics & Population</h1>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg">Comprehensive population statistics and gender distribution</p>
        </div>
        <div className="flex-shrink-0">
          <ExportButton 
            onExportImage={handleExportImage}
            onExportCSV={handleExportCSV}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-gray-200">
        <label className="block text-sm font-bold text-gray-900 mb-3">Search or Select Region</label>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1 w-full">
            <SearchBar 
              regions={censusData.regions}
              onSelectRegion={(region) => setSelectedRegion(region.name)}
              selectedRegion={selectedRegionData}
            />
          </div>
          <div className="w-full sm:w-64">
            <label className="block text-sm font-bold text-gray-900 mb-2">Or Select:</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl shadow-md font-semibold text-gray-900 cursor-pointer hover:border-blue-300 transition-colors text-sm sm:text-base"
            >
              {censusData.regions.map(r => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Population3DChart regions={regions} />
        <GenderDistributionChart region={selectedRegionData} />
      </div>
    </div>
  );
}

