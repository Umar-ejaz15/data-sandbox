'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getTransformedPopulationData } from '@/lib/fetchData';
import { forecastMultipleProvinces } from '@/lib/aiForecast';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PopulationMap from './components/PopulationMap';
import Demographics from './components/Demographics';
import UrbanizationTrends from './components/UrbanizationTrends';
import Heatmaps from './components/Heatmaps';
import TrendPredictions from './components/TrendPredictions';
import InsightsPanel from './components/InsightsPanel';
import ExportTools from './components/ExportTools';
import Footer from './components/Footer';
import LevelSelector from './components/LevelSelector';
import ProvinceSelector from './components/ProvinceSelector';
import UrbanLocalities from './components/UrbanLocalities';
import { Database, BarChart3, Building2, TrendingUp, HomeIcon } from 'lucide-react';

export default function Home() {
  const { 
    setData, 
    setForecasts, 
    setLoading, 
    setError, 
    error: storeError, 
    isLoading,
    selectedTable,
    selectedLevel,
    selectedProvince,
    districts
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'demographics' | 'trends' | 'projections' | 'urban'>('overview');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load population data
        const populationData = await getTransformedPopulationData();
        console.log('Setting data in store:', populationData);
        setData(populationData);

        // Generate forecasts
        const allProvinces = populationData.national 
          ? [populationData.national, ...populationData.provinces]
          : populationData.provinces;
        
        if (allProvinces.length > 0) {
          const forecasts = forecastMultipleProvinces(allProvinces, 10);
          setForecasts(forecasts);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load population data. Please ensure the data file exists.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setData, setForecasts, setLoading, setError]);

  // Filter districts based on selected province
  const filteredDistricts = selectedProvince 
    ? districts.filter(d => d.province === selectedProvince)
    : districts;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Level and Table Selectors */}
        <LevelSelector />
        {selectedLevel !== 'national' && <ProvinceSelector />}

        {/* Error Display */}
        {storeError && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl shadow-sm">
            <p className="text-red-600 font-medium"><strong>Error:</strong> {storeError}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm">
            <p className="text-blue-600 font-medium">Loading population data...</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-2 border border-gray-200">
          <nav className="flex space-x-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Database },
              { id: 'demographics', label: 'Demographics', icon: BarChart3 },
              { id: 'trends', label: 'Urbanization Trends', icon: TrendingUp },
              { id: 'projections', label: 'Projections', icon: TrendingUp },
              ...(selectedTable === 'table_2' ? [{ id: 'urban', label: 'Urban Localities', icon: Building2 }] : [])
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {selectedTable === 'table_1' && (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8" id="overview">
                <InsightsPanel />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <PopulationMap />
                  <ExportTools />
                </div>
                {selectedLevel === 'district' && filteredDistricts.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-2xl font-bold mb-4">Districts ({filteredDistricts.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredDistricts.slice(0, 12).map((district, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h3 className="font-semibold text-gray-800 mb-2">{district.district}</h3>
                          <p className="text-2xl font-bold text-blue-600 mb-1">
                            {(district.population / 1_000_000).toFixed(2)}M
                          </p>
                          <p className="text-sm text-gray-600">{district.province}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'demographics' && (
              <div className="space-y-8" id="demographics">
                <Demographics />
                <Heatmaps />
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-8" id="trends">
                <UrbanizationTrends />
              </div>
            )}

            {activeTab === 'projections' && (
              <div className="space-y-8" id="projections">
                <TrendPredictions />
              </div>
            )}
          </>
        )}

        {selectedTable === 'table_2' && (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8" id="overview">
                <UrbanLocalities />
              </div>
            )}

            {activeTab === 'urban' && (
              <div className="space-y-8" id="urban">
                <UrbanLocalities />
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
