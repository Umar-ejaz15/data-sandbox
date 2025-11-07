'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
}

export default function LiteracyComparisonChart({ regions }: Props) {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Literacy Rate Comparison by Region',
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        let result = `<div style="padding: 8px;"><strong>${params[0].name}</strong><br/>`;
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${param.value.toFixed(1)}%<br/>`;
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
      data: ['Total', 'Rural', 'Urban'],
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
      name: 'Literacy Rate (%)',
      nameTextStyle: { color: '#6b7280', fontSize: 14 },
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
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
        data: regions.map(r => r.education.total.literacy_rate),
        itemStyle: { 
          color: '#3B82F6',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value.toFixed(1) + '%',
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 'bold'
        }
      },
      {
        name: 'Rural',
        type: 'bar',
        data: regions.map(r => r.education.rural.literacy_rate),
        itemStyle: { 
          color: '#10B981',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value.toFixed(1) + '%',
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 'bold'
        }
      },
      {
        name: 'Urban',
        type: 'bar',
        data: regions.map(r => r.education.urban.literacy_rate),
        itemStyle: { 
          color: '#F59E0B',
          borderRadius: [4, 4, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => params.value.toFixed(1) + '%',
          fontSize: 11,
          color: '#6b7280',
          fontWeight: 'bold'
        }
      }
    ]
  };

  const avgLiteracy = regions.reduce((sum, r) => sum + r.education.total.literacy_rate, 0) / regions.length;
  const maxLiteracy = Math.max(...regions.map(r => r.education.total.literacy_rate));
  const minLiteracy = Math.min(...regions.map(r => r.education.total.literacy_rate));

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-8 border-2 border-blue-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Literacy Rate Analysis</h3>
        <p className="text-gray-700 mb-4">Comparison of literacy rates across regions and urban/rural areas</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-sm text-gray-600 mb-1">Average Literacy</div>
            <div className="text-2xl font-bold text-blue-600">{avgLiteracy.toFixed(1)}%</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-sm text-gray-600 mb-1">Highest</div>
            <div className="text-2xl font-bold text-green-600">{maxLiteracy.toFixed(1)}%</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="text-sm text-gray-600 mb-1">Lowest</div>
            <div className="text-2xl font-bold text-red-600">{minLiteracy.toFixed(1)}%</div>
          </div>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
    </div>
  );
}

