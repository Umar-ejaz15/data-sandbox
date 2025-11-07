'use client';

import React, { useEffect, useState } from 'react';
import { fetchCensusData } from '@/lib/fetchCensusData';
import { useAppStore } from '@/store/useAppStore';
import { predictMultipleRegions, PredictionData } from '@/lib/predictionModel';
import MetricsPanel from './MetricsPanel';
import Population3DChart from './charts/Population3DChart';
import GenderDistributionChart from './charts/GenderDistributionChart';
import Disability3DChart from './charts/Disability3DChart';
import Education3DChart from './charts/Education3DChart';
import Housing3DChart from './charts/Housing3DChart';
import UrbanRuralChart from './charts/UrbanRuralChart';
import DisabilityBreakdownChart from './charts/DisabilityBreakdownChart';
import StructuresChart from './charts/StructuresChart';
import PredictionChart from './charts/PredictionChart';
import LiteracyComparisonChart from './charts/LiteracyComparisonChart';
import GrowthRateChart from './charts/GrowthRateChart';
import SexRatioChart from './charts/SexRatioChart';
import HouseholdSizeChart from './charts/HouseholdSizeChart';

export default function CensusDashboard() {
  const { censusData, selectedRegion, setCensusData, setSelectedRegion, setLoading, setError, isLoading, error } = useAppStore();
  const [predictions, setPredictions] = useState<Map<string, PredictionData[]>>(new Map());
  const [showPredictions, setShowPredictions] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCensusData();
        setCensusData(data);
        
        // Generate predictions for all regions
        const preds = predictMultipleRegions(data.regions, 10);
        setPredictions(preds);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading census data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md">
          <p className="text-red-600 text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!censusData || !censusData.regions || censusData.regions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 max-w-md">
          <p className="text-yellow-600 text-lg font-semibold">No census data available. Please check the data file.</p>
        </div>
      </div>
    );
  }

  const selectedRegionData = censusData.regions.find(r => r.name === selectedRegion) || censusData.regions[0];
  const regions = censusData.regions.filter(r => r.name !== 'Pakistan');
  const nationalData = censusData.regions.find(r => r.name === 'Pakistan');

  if (!selectedRegionData || !nationalData) {
    return null;
  }

  const regionPredictions = predictions.get(selectedRegion) || [];

  return (
    <div className="space-y-10 pb-12">
      {/* Overview Section */}
      <section id="overview" className="scroll-mt-24">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Overview</h2>
          <p className="text-gray-600">Key national statistics and metrics</p>
        </div>
        <MetricsPanel nationalData={nationalData} />
      </section>

      {/* Region Selector - Moved to top for better UX */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200 w-full mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Select Region for Detailed Analysis</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-6 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-500 shadow-md font-semibold text-gray-800 cursor-pointer min-w-[300px] text-lg"
            >
              {censusData.regions.map(r => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Census Year</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {censusData.census_year}
              </p>
            </div>
            <button
              onClick={() => setShowPredictions(!showPredictions)}
              className={`px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                showPredictions 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' 
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
              }`}
            >
              {showPredictions ? '✓ Predictions On' : 'Show Predictions'}
            </button>
          </div>
        </div>
      </div>

      {/* Predictions Section */}
      {showPredictions && (
        <section id="predictions" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Population Forecasts</h2>
            <p className="text-gray-600">AI-powered 10-year predictions based on historical growth patterns</p>
          </div>
          <PredictionChart predictions={regionPredictions} regionName={selectedRegionData.name} />
        </section>
      )}

      {/* Demographics Section */}
      <section id="demographics" className="scroll-mt-24">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Demographics & Population</h2>
          <p className="text-gray-600">Comprehensive population statistics and gender distribution</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Population3DChart regions={regions} />
          <GenderDistributionChart region={selectedRegionData} />
        </div>
      </section>

      {/* Growth & Demographics Section */}
      <section id="growth" className="scroll-mt-24">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Growth Rates & Trends</h2>
          <p className="text-gray-600">Population growth trends and demographic indicators</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GrowthRateChart regions={regions} />
          <SexRatioChart regions={regions} />
        </div>
        <div className="mt-8">
          <HouseholdSizeChart regions={regions} />
        </div>
      </section>

      {/* Urbanization Section */}
      <section id="urbanization" className="scroll-mt-24">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Urbanization Trends</h2>
          <p className="text-gray-600">Analysis of urban and rural population distribution</p>
        </div>
        <UrbanRuralChart regions={regions} />
      </section>

      {/* Education Section */}
      <section id="education" className="scroll-mt-24">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Education Statistics</h2>
          <p className="text-gray-600">Student enrolment and literacy rates across different education levels</p>
        </div>
        <div className="grid grid-cols-1 gap-8">
          <Education3DChart regions={regions} />
          <LiteracyComparisonChart regions={regions} />
        </div>
      </section>

      {/* Disability Section */}
      <section id="disability" className="scroll-mt-24">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Disability & Functional Limitations</h2>
          <p className="text-gray-600">Comprehensive disability statistics and analysis</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Disability3DChart regions={regions} />
          <DisabilityBreakdownChart region={selectedRegionData} />
        </div>
      </section>

      {/* Infrastructure Section */}
      <section id="infrastructure" className="scroll-mt-24">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Housing & Infrastructure</h2>
          <p className="text-gray-600">Housing types and building structures analysis</p>
        </div>
        <div className="grid grid-cols-1 gap-8">
          <Housing3DChart regions={regions} />
          <StructuresChart regions={regions} />
        </div>
      </section>
    </div>
  );
}
