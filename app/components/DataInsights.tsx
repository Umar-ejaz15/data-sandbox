'use client';

import React from 'react';
import { CensusRegion } from '@/lib/fetchCensusData';
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb } from 'lucide-react';

interface Props {
  regions: CensusRegion[];
  nationalData: CensusRegion;
}

export default function DataInsights({ regions, nationalData }: Props) {
  const insights = [];

  // Growth rate insight
  const avgGrowth = regions.reduce((sum, r) => sum + r.demographics.annual_growth_rate_2017_2023, 0) / regions.length;
  if (avgGrowth > 2.5) {
    insights.push({
      type: 'warning',
      icon: TrendingUp,
      title: 'High Population Growth',
      message: `Average growth rate of ${avgGrowth.toFixed(2)}% indicates rapid population expansion.`,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    });
  }

  // Literacy insight
  const avgLiteracy = regions.reduce((sum, r) => sum + r.education.total.literacy_rate, 0) / regions.length;
  if (avgLiteracy < 60) {
    insights.push({
      type: 'info',
      icon: AlertCircle,
      title: 'Literacy Improvement Needed',
      message: `Average literacy rate is ${avgLiteracy.toFixed(1)}%, below the national target.`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    });
  } else {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      title: 'Strong Literacy Performance',
      message: `Average literacy rate of ${avgLiteracy.toFixed(1)}% shows positive educational outcomes.`,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    });
  }

  // Urbanization insight
  const avgUrban = regions.reduce((sum, r) => sum + r.demographics.urban_proportion, 0) / regions.length;
  if (avgUrban > 50) {
    insights.push({
      type: 'info',
      icon: Lightbulb,
      title: 'High Urbanization',
      message: `${avgUrban.toFixed(1)}% average urban population indicates significant urbanization trend.`,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200'
    });
  }

  // Disability rate insight
  const disabilityRate = (nationalData.disability.total.disability / nationalData.disability.total.population) * 100;
  insights.push({
    type: 'info',
    icon: AlertCircle,
    title: 'Disability Statistics',
    message: `${disabilityRate.toFixed(2)}% of population has reported disabilities requiring attention.`,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200'
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Lightbulb className="h-6 w-6 text-yellow-500" />
        Data Insights
      </h3>
      <div className="space-y-4">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <div
              key={idx}
              className={`${insight.bg} ${insight.border} border-2 rounded-xl p-4 flex items-start gap-3`}
            >
              <Icon className={`h-5 w-5 ${insight.color} mt-0.5 shrink-0`} />
              <div className="flex-1">
                <h4 className={`font-bold ${insight.color} mb-1`}>{insight.title}</h4>
                <p className="text-gray-700 text-sm">{insight.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

