'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store/useAppStore';
import { PROVINCE_COLORS } from '@/lib/constants';

export default function UrbanizationTrends() {
  const { provinces, national, forecasts } = useAppStore();

  const data = national ? [national, ...provinces] : provinces;

  // Calculate urbanization rates
  const urbanizationData = data.map(p => ({
    province: p.province,
    urbanRate: p.totalPopulation > 0 ? (p.urban / p.totalPopulation) * 100 : 0,
    ruralRate: p.totalPopulation > 0 ? (p.rural / p.totalPopulation) * 100 : 0,
    urban: p.urban,
    rural: p.rural
  }));

  const urbanizationRateOption = {
    title: {
      text: 'Urbanization Rate by Province',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>Urbanization: ${param.value.toFixed(1)}%`;
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
      data: urbanizationData.map(d => d.province),
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: 'value',
      name: 'Urbanization Rate (%)',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [{
      name: 'Urbanization Rate',
      type: 'bar',
      data: urbanizationData.map((d, i) => ({
        value: d.urbanRate,
        itemStyle: { 
          color: PROVINCE_COLORS[d.province] || PROVINCE_COLORS['Pakistan'],
          borderRadius: [4, 4, 0, 0]
        }
      })),
      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => params.value.toFixed(1) + '%'
      }
    }]
  };

  // Forecast urbanization trends
  const forecastData: any[] = [];
  if (forecasts.size > 0 && national) {
    const nationalForecast = forecasts.get('Pakistan') || forecasts.get(national.province);
    if (nationalForecast) {
      const currentUrbanRate = (national.urban / national.totalPopulation) * 100;
      forecastData.push({ year: 2023, rate: currentUrbanRate, type: 'actual' });
      
      nationalForecast.forEach(f => {
        const rate = (f.urban / f.population) * 100;
        forecastData.push({ year: f.year, rate, type: 'forecast' });
      });
    }
  }

  const trendOption = {
    title: {
      text: 'Urbanization Trend Forecast',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>Urbanization: ${param.value.toFixed(1)}%`;
      }
    },
    legend: {
      data: ['Actual', 'Forecast'],
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
      data: forecastData.map(d => d.year)
    },
    yAxis: {
      type: 'value',
      name: 'Urbanization Rate (%)',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'Actual',
        type: 'line',
        data: forecastData.filter(d => d.type === 'actual').map(d => d.rate),
        itemStyle: { color: '#3B82F6' },
        lineStyle: { width: 3 }
      },
      {
        name: 'Forecast',
        type: 'line',
        data: forecastData.map(d => d.type === 'forecast' ? d.rate : null),
        itemStyle: { color: '#10B981' },
        lineStyle: { type: 'dashed', width: 2 }
      }
    ]
  };

  if (data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Loading urbanization data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <ReactECharts option={urbanizationRateOption} style={{ height: '400px' }} />
      </div>
      
      {forecastData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ReactECharts option={trendOption} style={{ height: '400px' }} />
        </div>
      )}
    </div>
  );
}
