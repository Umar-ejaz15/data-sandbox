'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store/useAppStore';
import { PROVINCE_COLORS } from '@/lib/constants';

export default function TrendPredictions() {
  const { provinces, national, forecasts } = useAppStore();

  // Build trend data for all provinces
  const trendData: any = {};
  
  if (national) {
    const nationalForecast = forecasts.get('Pakistan') || forecasts.get(national.province);
    if (nationalForecast) {
      trendData['Pakistan'] = [
        { year: 2023, population: national.totalPopulation, type: 'actual' },
        ...nationalForecast.map(f => ({ year: f.year, population: f.population, type: 'forecast' }))
      ];
    }
  }

  provinces.forEach(prov => {
    const provForecast = forecasts.get(prov.province);
    if (provForecast) {
      trendData[prov.province] = [
        { year: 2023, population: prov.totalPopulation, type: 'actual' },
        ...provForecast.map(f => ({ year: f.year, population: f.population, type: 'forecast' }))
      ];
    }
  });

  const allProvinces = national ? ['Pakistan', ...provinces.map(p => p.province)] : provinces.map(p => p.province);
  const years = trendData['Pakistan']?.map((d: any) => d.year) || [];

  const lineChartOption = {
    title: {
      text: 'Population Growth Projections (2023-2033)',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param: any) => {
          result += `${param.marker} ${param.seriesName}: ${(param.value / 1_000_000).toFixed(2)}M<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: allProvinces,
      top: '10%',
      type: 'scroll'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: years
    },
    yAxis: {
      type: 'value',
      name: 'Population (Millions)',
      axisLabel: {
        formatter: (value: number) => (value / 1_000_000).toFixed(1) + 'M'
      }
    },
    series: allProvinces.map(prov => {
      const data = trendData[prov] || [];
      const actualData = data.filter((d: any) => d.type === 'actual').map((d: any) => d.population);
      const forecastData = data.map((d: any) => d.type === 'forecast' ? d.population : null);
      
      return [
        {
          name: prov + ' (Actual)',
          type: 'line',
          data: actualData,
          itemStyle: { color: PROVINCE_COLORS[prov] || PROVINCE_COLORS['Pakistan'] },
          lineStyle: { width: 3 }
        },
        {
          name: prov + ' (Forecast)',
          type: 'line',
          data: forecastData,
          itemStyle: { color: PROVINCE_COLORS[prov] || PROVINCE_COLORS['Pakistan'] },
          lineStyle: { type: 'dashed', width: 2 }
        }
      ];
    }).flat()
  };

  // Forecast comparison for 2033
  const forecast2033 = allProvinces.map(prov => {
    const data = trendData[prov];
    if (!data) return null;
    const forecast = data.find((d: any) => d.year === 2033);
    return forecast ? { province: prov, population: forecast.population } : null;
  }).filter(Boolean);

  const forecastComparisonOption = {
    title: {
      text: 'Projected Population in 2033',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const param = params[0];
        return `${param.name}<br/>${(param.value / 1_000_000).toFixed(2)} Million`;
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
      data: forecast2033.map((f: any) => f.province),
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
      name: 'Projected Population',
      type: 'bar',
      data: forecast2033.map((f: any, i: number) => ({
        value: f.population,
        itemStyle: { 
          color: PROVINCE_COLORS[f.province] || PROVINCE_COLORS['Pakistan'],
          borderRadius: [4, 4, 0, 0]
        }
      })),
      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => (params.value / 1_000_000).toFixed(1) + 'M'
      }
    }]
  };

  if (Object.keys(trendData).length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Loading trend predictions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <ReactECharts option={lineChartOption} style={{ height: '500px' }} />
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <ReactECharts option={forecastComparisonOption} style={{ height: '400px' }} />
      </div>
    </div>
  );
}

