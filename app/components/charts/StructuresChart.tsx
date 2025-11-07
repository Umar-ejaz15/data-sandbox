'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
}

export default function StructuresChart({ regions }: Props) {
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
        itemStyle: { 
          color: '#3B82F6',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value > 0.5 ? params.value.toFixed(1) + 'M' : '',
          fontSize: 10,
          color: '#6b7280'
        }
      },
      {
        name: 'Economic',
        type: 'bar',
        data: regions.map(r => r.structures.total.economic / 1_000_000),
        itemStyle: { 
          color: '#10B981',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value > 0.5 ? params.value.toFixed(1) + 'M' : '',
          fontSize: 10,
          color: '#6b7280'
        }
      },
      {
        name: 'Residential+Economic',
        type: 'bar',
        data: regions.map(r => r.structures.total.residential_economic / 1_000_000),
        itemStyle: { 
          color: '#F59E0B',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value > 0.5 ? params.value.toFixed(1) + 'M' : '',
          fontSize: 10,
          color: '#6b7280'
        }
      },
      {
        name: 'High Rise',
        type: 'bar',
        data: regions.map(r => r.structures.total.high_rise / 1_000_000),
        itemStyle: { 
          color: '#EF4444',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value > 0.01 ? params.value.toFixed(2) + 'M' : '',
          fontSize: 10,
          color: '#6b7280'
        }
      }
    ]
  };

  const totalStructures = regions.reduce((sum, r) => sum + r.structures.total.all_structures, 0);
  const totalResidential = regions.reduce((sum, r) => sum + r.structures.total.residential, 0);
  const totalHighRise = regions.reduce((sum, r) => sum + r.structures.total.high_rise, 0);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-xl p-8 border-2 border-indigo-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Building Structures Analysis</h3>
        <p className="text-gray-700 mb-4">Comprehensive breakdown of structure types across all regions</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-sm text-gray-600 mb-1">Total Structures</div>
            <div className="text-2xl font-bold text-indigo-600">{(totalStructures / 1_000_000).toFixed(1)}M</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-sm text-gray-600 mb-1">Residential</div>
            <div className="text-2xl font-bold text-blue-600">{(totalResidential / 1_000_000).toFixed(1)}M</div>
            <div className="text-xs text-gray-500 mt-1">{((totalResidential / totalStructures) * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-sm text-gray-600 mb-1">High Rise</div>
            <div className="text-2xl font-bold text-red-600">{(totalHighRise / 1_000).toFixed(0)}K</div>
            <div className="text-xs text-gray-500 mt-1">{((totalHighRise / totalStructures) * 100).toFixed(2)}%</div>
          </div>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
    </div>
  );
}

