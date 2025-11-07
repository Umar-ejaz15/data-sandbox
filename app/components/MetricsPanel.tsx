'use client';

import React from 'react';
import { Users, GraduationCap, Home, Building2, Activity, TrendingUp } from 'lucide-react';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  nationalData: CensusRegion;
}

export default function MetricsPanel({ nationalData }: Props) {
  const metrics = [
    {
      title: 'Total Population',
      value: (nationalData.demographics.total_population / 1_000_000).toFixed(1) + 'M',
      change: `+${nationalData.demographics.annual_growth_rate_2017_2023.toFixed(2)}% growth`,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Literacy Rate',
      value: nationalData.education.total.literacy_rate.toFixed(1) + '%',
      change: `${nationalData.education.total.literate_10_plus.toLocaleString()} literate`,
      icon: GraduationCap,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Urban Proportion',
      value: nationalData.demographics.urban_proportion.toFixed(1) + '%',
      change: `${(nationalData.demographics.urban.population / 1_000_000).toFixed(1)}M urban`,
      icon: Building2,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Total Households',
      value: (nationalData.housing.total.households / 1_000_000).toFixed(1) + 'M',
      change: `Avg size: ${nationalData.demographics.avg_household_size.toFixed(1)}`,
      icon: Home,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Disability Rate',
      value: ((nationalData.disability.total.disability / nationalData.disability.total.population) * 100).toFixed(2) + '%',
      change: `${(nationalData.disability.total.disability / 1_000_000).toFixed(2)}M cases`,
      icon: Activity,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      gradient: 'from-red-500 to-red-600'
    },
    {
      title: 'Growth Rate',
      value: nationalData.demographics.annual_growth_rate_2017_2023.toFixed(2) + '%',
      change: `Annual (2017-2023)`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <div className="mb-6 sm:mb-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Key National Metrics</h2>
        <p className="text-gray-700 text-sm sm:text-base">Overview of Pakistan's 2023 Census statistics</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div 
              key={idx} 
              className={`${metric.bg} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 ${metric.border} relative overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide truncate">{metric.title}</p>
                  <p className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold ${metric.color} mb-1 sm:mb-2`}>{metric.value}</p>
                  <p className="text-xs sm:text-sm text-gray-700 truncate">{metric.change}</p>
                </div>
                <div className={`bg-gradient-to-br ${metric.gradient} rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-md flex-shrink-0 ml-2`}>
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              <div className={`absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br ${metric.gradient} opacity-10 rounded-tl-full`}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

