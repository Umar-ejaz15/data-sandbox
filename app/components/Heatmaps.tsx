'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store/useAppStore';

export default function Heatmaps() {
  const { provinces, districts } = useAppStore();

  // Create heatmap data from districts
  const districtData = districts.slice(0, 20).map(d => [
    d.district,
    d.province,
    d.population
  ]);

  const heatmapOption = {
    title: {
      text: 'Population Heatmap by District',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        return `${params.data[0]}<br/>${params.data[1]}<br/>Population: ${(params.data[2] / 1_000_000).toFixed(2)}M`;
      }
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: Array.from(new Set(districtData.map(d => d[1]))),
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: districtData.map(d => d[0]),
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...districtData.map(d => d[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      inRange: {
        color: ['#E3F2FD', '#1976D2', '#0D47A1']
      },
      formatter: (value: number) => (value / 1_000_000).toFixed(1) + 'M'
    },
    series: [{
      name: 'Population',
      type: 'heatmap',
      data: districtData,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  // Province comparison heatmap
  const provinceComparison = provinces.map(p => ({
    name: p.province,
    population: p.totalPopulation,
    urban: p.urban,
    rural: p.rural,
    male: p.male,
    female: p.female
  }));

  const comparisonOption = {
    title: {
      text: 'Province Comparison Matrix',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['Total', 'Urban', 'Rural', 'Male', 'Female'],
      top: '10%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: provinceComparison.map(p => p.name),
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: 'value',
      name: 'Population (Millions)',
      axisLabel: {
        formatter: (value: number) => (value / 1_000_000).toFixed(1) + 'M'
      }
    },
    series: [
      {
        name: 'Total',
        type: 'bar',
        data: provinceComparison.map(p => p.population),
        itemStyle: { color: '#6366F1' }
      },
      {
        name: 'Urban',
        type: 'bar',
        data: provinceComparison.map(p => p.urban),
        itemStyle: { color: '#3B82F6' }
      },
      {
        name: 'Rural',
        type: 'bar',
        data: provinceComparison.map(p => p.rural),
        itemStyle: { color: '#10B981' }
      },
      {
        name: 'Male',
        type: 'bar',
        data: provinceComparison.map(p => p.male),
        itemStyle: { color: '#F59E0B' }
      },
      {
        name: 'Female',
        type: 'bar',
        data: provinceComparison.map(p => p.female),
        itemStyle: { color: '#EC4899' }
      }
    ]
  };

  if (provinces.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Loading heatmap data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {districtData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ReactECharts option={heatmapOption} style={{ height: '500px' }} />
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <ReactECharts option={comparisonOption} style={{ height: '400px' }} />
      </div>
    </div>
  );
}
