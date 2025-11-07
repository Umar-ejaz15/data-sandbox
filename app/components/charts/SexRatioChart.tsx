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
      },
      markLine: {
        data: [
          { yAxis: 100, name: 'Equal Ratio', lineStyle: { color: '#6b7280', type: 'dashed', width: 2 } }
        ],
        label: {
          formatter: 'Equal Ratio (100)',
          position: 'end'
        }
      }
    }]
  };

  const avgRatio = regions.reduce((sum, r) => sum + r.demographics.sex_ratio, 0) / regions.length;

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl shadow-xl p-8 border-2 border-pink-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Sex Ratio Analysis</h3>
        <p className="text-gray-700 mb-4">Number of males per 100 females across different regions</p>
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">National Average</div>
              <div className="text-3xl font-bold text-pink-600">{avgRatio.toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Interpretation</div>
              <div className="text-lg font-semibold text-gray-800">
                {avgRatio > 100 ? `${(avgRatio - 100).toFixed(2)}% more males` : `${(100 - avgRatio).toFixed(2)}% more females`}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
    </div>
  );
}

