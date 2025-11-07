'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
}

export default function GrowthRateChart({ regions }: Props) {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Population Growth Rate Trends (2017-2023)',
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        let result = `<div style="padding: 8px;"><strong>${params[0].name}</strong><br/>`;
        params.forEach((param: any) => {
          result += `${param.seriesName}: ${param.value.toFixed(2)}%<br/>`;
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
      data: ['Annual Growth Rate', 'Urban Growth', 'Rural Growth'],
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
      name: 'Growth Rate (%)',
      nameTextStyle: { color: '#6b7280', fontSize: 14 },
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
        name: 'Annual Growth Rate',
        type: 'line',
        data: regions.map(r => r.demographics.annual_growth_rate_2017_2023),
        smooth: true,
        itemStyle: { color: '#3B82F6' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ]
          }
        }
      },
      {
        name: 'Urban Growth',
        type: 'line',
        data: regions.map(r => {
          const urban2017 = r.demographics.urban.population / Math.pow(1 + r.demographics.annual_growth_rate_2017_2023 / 100, 6);
          const urbanGrowth = ((r.demographics.urban.population / urban2017 - 1) / 6) * 100;
          return urbanGrowth;
        }),
        smooth: true,
        itemStyle: { color: '#10B981' },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: 'Rural Growth',
        type: 'line',
        data: regions.map(r => {
          const rural2017 = r.demographics.rural.population / Math.pow(1 + r.demographics.annual_growth_rate_2017_2023 / 100, 6);
          const ruralGrowth = ((r.demographics.rural.population / rural2017 - 1) / 6) * 100;
          return ruralGrowth;
        }),
        smooth: true,
        itemStyle: { color: '#F59E0B' },
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Growth Rate Trends</h3>
        <p className="text-gray-700">Annual population growth rates across regions from 2017 to 2023</p>
      </div>
      <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
    </div>
  );
}
