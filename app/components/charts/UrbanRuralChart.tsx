'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
}

export default function UrbanRuralChart({ regions }: Props) {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Urban vs Rural Population Comparison',
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        let result = `<div style="padding: 8px;"><strong>${params[0].name}</strong><br/>`;
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${(param.value).toFixed(2)}M<br/>`;
        });
        result += '</div>';
        return result;
      },
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      textStyle: { color: '#fff', fontSize: 13 }
    },
    legend: {
      data: ['Urban', 'Rural'],
      top: 35,
      textStyle: { fontSize: 14, fontWeight: '600' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: regions.map(r => r.name),
      axisLabel: { 
        rotate: 45,
        fontSize: 12,
        color: '#6b7280'
      },
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Population (Millions)',
      nameTextStyle: { color: '#6b7280', fontSize: 14 },
      axisLabel: {
        formatter: (value: number) => (value).toFixed(1) + 'M',
        color: '#6b7280'
      },
      splitLine: {
        lineStyle: { color: '#f3f4f6', type: 'dashed' }
      }
    },
    series: [
      {
        name: 'Urban',
        type: 'bar',
        stack: 'total',
        data: regions.map(r => r.demographics.urban.population / 1_000_000),
        itemStyle: { 
          color: '#3B82F6',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'inside',
          formatter: (params: any) => params.value > 5 ? params.value.toFixed(1) + 'M' : '',
          fontSize: 11,
          color: '#fff',
          fontWeight: 'bold'
        }
      },
      {
        name: 'Rural',
        type: 'bar',
        stack: 'total',
        data: regions.map(r => r.demographics.rural.population / 1_000_000),
        itemStyle: { 
          color: '#10B981',
          borderRadius: [0, 0, 4, 4]
        },
        label: {
          show: true,
          position: 'inside',
          formatter: (params: any) => params.value > 5 ? params.value.toFixed(1) + 'M' : '',
          fontSize: 11,
          color: '#fff',
          fontWeight: 'bold'
        }
      }
    ]
  };

  const totalUrban = regions.reduce((sum, r) => sum + r.demographics.urban.population, 0);
  const totalRural = regions.reduce((sum, r) => sum + r.demographics.rural.population, 0);
  const urbanPercent = ((totalUrban / (totalUrban + totalRural)) * 100).toFixed(1);
  const ruralPercent = ((totalRural / (totalUrban + totalRural)) * 100).toFixed(1);

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl shadow-xl p-8 border-2 border-cyan-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Urban vs Rural Population</h3>
        <p className="text-gray-700 mb-4">Comparative analysis of urban and rural population distribution across regions</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <div className="text-sm font-semibold text-gray-700">Urban Population</div>
            </div>
            <div className="text-3xl font-bold text-blue-600">{(totalUrban / 1_000_000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600 mt-1">{urbanPercent}% of total</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <div className="text-sm font-semibold text-gray-700">Rural Population</div>
            </div>
            <div className="text-3xl font-bold text-green-600">{(totalRural / 1_000_000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600 mt-1">{ruralPercent}% of total</div>
          </div>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
    </div>
  );
}

