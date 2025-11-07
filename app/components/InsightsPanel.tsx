'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { 
  MapPin, 
  Building2, 
  Scale, 
  TrendingUp, 
  Users, 
  Home,
  Loader2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

export default function InsightsPanel() {
  const { provinces, national, forecasts, isLoading, error } = useAppStore();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p>Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!national) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertTriangle className="h-5 w-5" />
          <p className="font-medium">No national data available. Please check the data file.</p>
        </div>
      </div>
    );
  }

  // Calculate insights
  const totalProvinces = provinces.length;
  const mostPopulousProvince = provinces.reduce((max, p) => 
    p.totalPopulation > max.totalPopulation ? p : max, provinces[0] || national
  );

  const urbanizationRate = (national.urban / national.totalPopulation) * 100;
  const genderRatio = (national.male / national.female) * 100;

  // Get forecast for 2033 (10 years)
  const forecast2033 = forecasts.get('Pakistan')?.find(f => f.year === 2033);
  const projectedGrowth = forecast2033 
    ? ((forecast2033.population - national.totalPopulation) / national.totalPopulation) * 100
    : 0;

  const insights = [
    {
      title: 'Most Populous Province',
      value: mostPopulousProvince.province,
      change: `${((mostPopulousProvince.totalPopulation / national.totalPopulation) * 100).toFixed(1)}% of total`,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Urbanization Rate',
      value: `${urbanizationRate.toFixed(1)}%`,
      change: `${(100 - urbanizationRate).toFixed(1)}% rural`,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Gender Ratio',
      value: `${genderRatio.toFixed(1)}`,
      change: 'Males per 100 females',
      icon: Scale,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      title: 'Projected Growth (2033)',
      value: `+${projectedGrowth.toFixed(1)}%`,
      change: forecast2033 ? `${((forecast2033.population - national.totalPopulation) / 1_000_000).toFixed(1)}M increase` : 'N/A',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Average Household Size',
      value: national.averageHouseholdSize.toFixed(1),
      change: 'Persons per household',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      title: 'Total Households',
      value: `${(national.households / 1_000_000).toFixed(2)}M`,
      change: 'Households nationwide',
      icon: Home,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Key Insights</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <div
              key={index}
              className={`border-2 ${insight.borderColor} ${insight.bgColor} rounded-xl p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${insight.bgColor} group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`h-6 w-6 ${insight.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{insight.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{insight.change}</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-700">{insight.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
