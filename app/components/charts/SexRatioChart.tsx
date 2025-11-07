'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
}

export default function SexRatioChart({ regions }: Props) {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Sex Ratio (Males per 100 Females)',
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const param = params[0];
        return `
          <div style="padding: 8px;">
            <strong>${param.name}</strong><br/>
            Sex Ratio: ${param.value.toFixed(2)}<br/>
            (${param.value > 100 ? 'More males' : 'More females'})
          </div>
        `;
      },
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      textStyle: { color: '#fff', fontSize: 13 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
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
      name: 'Sex Ratio',
      nameTextStyle: { color: '#6b7280', fontSize: 14 },
      axisLabel: {
        formatter: '{value}',
        color: '#6b7280'
      },
      splitLine: {
        lineStyle: { color: '#f3f4f6', type: 'dashed' }
      },
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      }
    },
    series: [{
      type: 'bar',
      data: regions.map(r => r.demographics.sex_ratio),
      itemStyle: {
        color: (params: any) => {
          if (params.value > 105) return '#EF4444'; // High ratio (red)
          if (params.value > 100) return '#F59E0B'; // Above average (orange)
          if (params.value > 95) return '#10B981';  // Balanced (green)
          return '#3B82F6'; // Low ratio (blue)
        },
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
    }]
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Sex Ratio Analysis</h3>
        <p className="text-gray-700">Ratio of males to females (per 100 females) across different regions</p>
      </div>
      <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
    </div>
  );
}
