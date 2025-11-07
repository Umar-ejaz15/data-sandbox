'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
}

export default function HouseholdSizeChart({ regions }: Props) {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Average Household Size by Region',
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        let result = `<div style="padding: 8px;"><strong>${params[0].name}</strong><br/>`;
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${param.value.toFixed(2)} persons<br/>`;
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
      data: ['Total', 'Urban', 'Rural'],
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
      name: 'Persons per Household',
      nameTextStyle: { color: '#6b7280', fontSize: 14 },
      axisLabel: {
        formatter: '{value}',
        color: '#6b7280'
      },
      splitLine: {
        lineStyle: { color: '#f3f4f6', type: 'dashed' }
      }
    },
    series: [
      {
        name: 'Total',
        type: 'bar',
        data: regions.map(r => r.demographics.avg_household_size),
        itemStyle: { 
          color: '#3B82F6',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value.toFixed(2),
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 'bold'
        }
      },
      {
        name: 'Urban',
        type: 'bar',
        data: regions.map(r => r.demographics.urban.avg_household_size),
        itemStyle: { 
          color: '#10B981',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value.toFixed(2),
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 'bold'
        }
      },
      {
        name: 'Rural',
        type: 'bar',
        data: regions.map(r => r.demographics.rural.avg_household_size),
        itemStyle: { 
          color: '#F59E0B',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value.toFixed(2),
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 'bold'
        }
      }
    ]
  };

  const avgSize = regions.reduce((sum, r) => sum + r.demographics.avg_household_size, 0) / regions.length;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-xl p-8 border-2 border-orange-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Household Size Analysis</h3>
        <p className="text-gray-700 mb-4">Average number of persons per household across regions</p>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="text-sm text-gray-600 mb-1">National Average Household Size</div>
          <div className="text-3xl font-bold text-orange-600">{avgSize.toFixed(2)} persons</div>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
    </div>
  );
}

