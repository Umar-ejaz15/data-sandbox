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

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Literacy Rate Analysis</h3>
        <p className="text-gray-700 text-sm sm:text-base">Comparison of literacy rates across different regions and areas</p>
      </div>
      <div className="h-[400px] sm:h-[500px] lg:h-[600px] w-full">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
