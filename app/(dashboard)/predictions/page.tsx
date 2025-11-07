'use client';

import React, { useEffect, useState } from 'react';
import { fetchCensusData } from '@/lib/fetchCensusData';
import { useAppStore } from '@/store/useAppStore';
import { predictMultipleRegions, PredictionData } from '@/lib/predictionModel';
import PredictionChart from '../../components/charts/PredictionChart';
import SearchBar from '../../components/SearchBar';
import ExportButton from '../../components/ExportButton';

export default function PredictionsPage() {
  const { censusData, selectedRegion, setCensusData, setSelectedRegion, setLoading, setError, isLoading, error } = useAppStore();
  const [predictions, setPredictions] = useState<Map<string, PredictionData[]>>(new Map());
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCensusData();
        setCensusData(data);
        // Show training message
        setIsTraining(true);
        // Use async TensorFlow.js predictions
        const preds = await predictMultipleRegions(data.regions, 10);
        setPredictions(preds);
      } catch (err) {
        console.error('Failed to load census data:', err);
        setError('Failed to load census data.');
      } finally {
        setLoading(false);
        setIsTraining(false);
      }
    };
    loadData();
  }, [setCensusData, setLoading, setError]);

  if (isLoading || isTraining) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg font-semibold">
            {isTraining ? 'Training TensorFlow.js models...' : 'Loading predictions...'}
          </p>
          {isTraining && (
            <p className="text-gray-600 text-sm mt-2">This may take a few moments on first load</p>
          )}
        </div>
      </div>
    );
  }

  if (error || !censusData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md">
          <p className="text-red-700 text-lg font-semibold">Error loading data</p>
        </div>
      </div>
    );
  }

  const selectedRegionData = censusData.regions.find(r => r.name === selectedRegion) || censusData.regions[0];
  const regionPredictions = predictions.get(selectedRegion) || [];

  const handleExportCSV = () => {
    const csv = `Year,Total Population,Urban,Rural,Literacy Rate\n${regionPredictions.map(p => 
      `${p.year},${p.total_population},${p.urban},${p.rural},${p.literacy_rate}`
    ).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions_${selectedRegionData.name}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Population Forecasts</h1>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg">TensorFlow.js neural network-powered 10-year predictions trained on historical census data</p>
        </div>
        <div className="flex-shrink-0">
          <ExportButton 
            onExportCSV={handleExportCSV}
            title="Export Data"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-gray-200">
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-2">Select Region</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <SearchBar 
                regions={censusData.regions}
                onSelectRegion={(region) => setSelectedRegion(region.name)}
                selectedRegion={selectedRegionData}
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 shadow-md font-semibold text-gray-900 cursor-pointer text-sm sm:text-base"
              >
                {censusData.regions.map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <PredictionChart predictions={regionPredictions} regionName={selectedRegionData.name} />
      </div>
    </div>
  );
}

