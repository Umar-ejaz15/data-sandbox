'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
}

function StructuresChart({ regions }: Props) {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Structure Types by Region',
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
      data: ['Residential', 'Economic', 'Residential+Economic', 'High Rise'],
      top: 35,
      textStyle: { fontSize: 14, fontWeight: '600', color: '#1f2937' }
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
      name: 'Structures (Millions)',
      nameTextStyle: { color: '#6b7280', fontSize: 14 },
      axisLabel: {
        formatter: (value: number) => value.toFixed(1) + 'M',
        color: '#6b7280'
      },
      splitLine: {
        lineStyle: { color: '#f3f4f6', type: 'dashed' }
      }
    },
    series: [
      {
        name: 'Residential',
        type: 'bar',
        data: regions.map(r => r.structures.total.residential / 1_000_000),
        itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value > 1 ? params.value.toFixed(1) + 'M' : '',
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 'bold'
        }
      },
      {
        name: 'Economic',
        type: 'bar',
        data: regions.map(r => r.structures.total.economic / 1_000_000),
        itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value > 1 ? params.value.toFixed(1) + 'M' : '',
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 'bold'
        }
      },
      {
        name: 'Residential+Economic',
        type: 'bar',
        data: regions.map(r => r.structures.total.residential_economic / 1_000_000),
        itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value > 1 ? params.value.toFixed(1) + 'M' : '',
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 'bold'
        }
      },
      {
        name: 'High Rise',
        type: 'bar',
        data: regions.map(r => r.structures.total.high_rise / 1_000_000),
        itemStyle: { color: '#EF4444', borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value > 1 ? params.value.toFixed(1) + 'M' : '',
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 'bold'
        }
      }
    ]
  };

  const totalResidential = regions.reduce((sum, r) => sum + r.structures.total.residential, 0);
  const totalEconomic = regions.reduce((sum, r) => sum + r.structures.total.economic, 0);
  const totalResEcon = regions.reduce((sum, r) => sum + r.structures.total.residential_economic, 0);
  const totalHighRise = regions.reduce((sum, r) => sum + r.structures.total.high_rise, 0);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Structure Types Analysis</h3>
        <p className="text-gray-700 text-sm sm:text-base mb-3 sm:mb-4">Distribution of different structure types across regions</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-700 mb-1">Residential</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{(totalResidential / 1_000_000).toFixed(1)}M</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-700 mb-1">Economic</div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{(totalEconomic / 1_000_000).toFixed(1)}M</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-700 mb-1">Residential+Economic</div>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{(totalResEcon / 1_000_000).toFixed(1)}M</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 shadow-md border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-700 mb-1">High Rise</div>
            <div className="text-xl sm:text-2xl font-bold text-red-600">{(totalHighRise / 1_000_000).toFixed(1)}M</div>
          </div>
        </div>
      </div>
      <div className="h-[400px] sm:h-[500px] lg:h-[600px] w-full">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}

export default StructuresChart;

