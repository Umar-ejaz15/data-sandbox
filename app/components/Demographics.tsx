'use client';

import React, { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store/useAppStore';
import { PROVINCE_COLORS } from '@/lib/constants';

export default function Demographics() {
  const { provinces, national, districts, selectedLevel, selectedProvince, isLoading } = useAppStore();

  // Determine which data to show based on selected level
  let data: any[] = [];
  
  if (selectedLevel === 'national') {
    data = national ? [national] : [];
  } else if (selectedLevel === 'province') {
    if (selectedProvince) {
      data = provinces.filter(p => p.province === selectedProvince);
    } else {
      data = national ? [national, ...provinces] : provinces;
    }
  } else if (selectedLevel === 'district') {
    const filteredDistricts = selectedProvince 
      ? districts.filter(d => d.province === selectedProvince)
      : districts;
    
    // Convert districts to display format
    data = filteredDistricts.map(d => ({
      province: d.district,
      totalPopulation: d.population,
      male: d.male,
      female: d.female,
      urban: d.urban,
      rural: d.rural,
      households: d.households || 0,
      averageHouseholdSize: d.averageHouseholdSize || 0
    })).slice(0, 20); // Limit to top 20 for performance
  } else {
    data = national ? [national, ...provinces] : provinces;
  }

  console.log('Demographics component - data points:', data.length, 'level:', selectedLevel);

  const getTitle = () => {
    if (selectedLevel === 'national') return 'National Population';
    if (selectedLevel === 'district') return selectedProvince 
      ? `Population by District - ${selectedProvince}`
      : 'Population by District';
    return selectedProvince 
      ? `Population - ${selectedProvince}`
      : 'Population by Province';
  };

  const barChartOption = {
    title: {
      text: getTitle(),
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const param = params[0];
        const value = (param.value / 1_000_000).toFixed(2);
        return `${param.name}<br/>${value} Million`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(p => p.province),
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: 'value',
      name: 'Population (Millions)',
      axisLabel: {
        formatter: (value: number) => (value / 1_000_000).toFixed(1) + 'M'
      }
    },
    series: [{
      name: 'Population',
      type: 'bar',
      data: data.map((p, i) => ({
        value: p.totalPopulation,
        itemStyle: { color: PROVINCE_COLORS[p.province] || PROVINCE_COLORS['Pakistan'] }
      })),
      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => (params.value / 1_000_000).toFixed(1) + 'M'
      }
    }]
  };

  const genderPieOption = {
    title: {
      text: 'Gender Distribution',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: 'Gender',
      type: 'pie',
      radius: '50%',
      data: national ? [
        { value: national.male, name: 'Male' },
        { value: national.female, name: 'Female' }
      ] : data.map(p => ({
        value: p.male + p.female,
        name: p.province
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  const urbanRuralOption = {
    title: {
      text: 'Urban vs Rural Population',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['Urban', 'Rural'],
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
      data: data.map(p => p.province),
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
        name: 'Urban',
        type: 'bar',
        stack: 'total',
        data: data.map(p => p.urban),
        itemStyle: { color: '#3B82F6' }
      },
      {
        name: 'Rural',
        type: 'bar',
        stack: 'total',
        data: data.map(p => p.rural),
        itemStyle: { color: '#10B981' }
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Loading demographic data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-red-500">No data available. Please check the data file.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <ReactECharts option={barChartOption} style={{ height: '400px' }} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ReactECharts option={genderPieOption} style={{ height: '400px' }} />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ReactECharts option={urbanRuralOption} style={{ height: '400px' }} />
        </div>
      </div>
    </div>
  );
}
