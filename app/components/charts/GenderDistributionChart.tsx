'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  region: CensusRegion;
}

export default function GenderDistributionChart({ region }: Props) {
  const total = region.demographics.male + region.demographics.female + region.demographics.transgender;
  const malePercent = ((region.demographics.male / total) * 100).toFixed(1);
  const femalePercent = ((region.demographics.female / total) * 100).toFixed(1);
  const transPercent = ((region.demographics.transgender / total) * 100).toFixed(2);

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Gender Distribution',
      subtext: region.name,
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
      subtextStyle: { fontSize: 16, color: '#6b7280' }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const value = params.value;
        const percent = params.percent;
        return `
          <div style="padding: 8px;">
            <strong>${params.name}</strong><br/>
            Population: ${(value / 1_000_000).toFixed(2)}M<br/>
            Percentage: ${percent}%
          </div>
        `;
      },
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      textStyle: { color: '#fff', fontSize: 13 }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: { fontSize: 14, fontWeight: '600', color: '#374151' },
      itemGap: 20
    },
    series: [{
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 3
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 13,
        fontWeight: 'bold'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 10
      },
      data: [
        { value: region.demographics.male, name: 'Male', itemStyle: { color: '#3B82F6' } },
        { value: region.demographics.female, name: 'Female', itemStyle: { color: '#EC4899' } },
        { value: region.demographics.transgender, name: 'Transgender', itemStyle: { color: '#8B5CF6' } }
      ]
    }]
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Gender Distribution</h3>
        <p className="text-gray-700 text-sm sm:text-base mb-3 sm:mb-4">Breakdown of population by gender in {region.name}</p>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-700 mb-1">Male</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{malePercent}%</div>
            <div className="text-xs text-gray-600">{(region.demographics.male / 1_000_000).toFixed(2)}M</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-700 mb-1">Female</div>
            <div className="text-xl sm:text-2xl font-bold text-pink-600">{femalePercent}%</div>
            <div className="text-xs text-gray-600">{(region.demographics.female / 1_000_000).toFixed(2)}M</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-700 mb-1">Transgender</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{transPercent}%</div>
            <div className="text-xs text-gray-600">{(region.demographics.transgender / 1_000).toFixed(0)}K</div>
          </div>
        </div>
      </div>
      <div className="h-[400px] sm:h-[500px] lg:h-[600px] w-full">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
