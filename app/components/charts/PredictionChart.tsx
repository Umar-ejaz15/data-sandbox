'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { PredictionData } from '@/lib/predictionModel';

interface Props {
  predictions: PredictionData[];
  regionName: string;
}

export default function PredictionChart({ predictions, regionName }: Props) {
  if (predictions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
        <p className="text-gray-700 text-center">No prediction data available</p>
      </div>
    );
  }

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Population & Literacy Predictions (2024-2033)',
      subtext: regionName,
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
      subtextStyle: { fontSize: 16, color: '#6b7280' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        let result = `<div style="padding: 8px;"><strong>Year ${params[0].axisValue}</strong><br/>`;
        params.forEach((param: any) => {
          if (param.seriesName === 'Literacy Rate') {
            result += `${param.seriesName}: ${param.value.toFixed(1)}%<br/>`;
          } else {
            result += `${param.seriesName}: ${(param.value / 1_000_000).toFixed(2)}M<br/>`;
          }
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
      data: ['Total Population', 'Urban', 'Rural', 'Literacy Rate'],
      top: 40,
      textStyle: { fontSize: 14, fontWeight: '600', color: '#1f2937' }
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: predictions.map(p => p.year.toString()),
      axisLabel: { color: '#6b7280', fontSize: 12 },
      axisLine: {
        lineStyle: { color: '#e5e7eb' }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Population (Millions)',
        position: 'left',
        nameTextStyle: { color: '#6b7280', fontSize: 14 },
        axisLabel: {
          formatter: (value: number) => (value / 1_000_000).toFixed(1) + 'M',
          color: '#6b7280'
        },
        splitLine: {
          lineStyle: { color: '#f3f4f6', type: 'dashed' }
        }
      },
      {
        type: 'value',
        name: 'Literacy Rate (%)',
        position: 'right',
        nameTextStyle: { color: '#6b7280', fontSize: 14 },
        axisLabel: {
          formatter: '{value}%',
          color: '#6b7280'
        },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Total Population',
        type: 'line',
        data: predictions.map(p => p.total_population),
        smooth: true,
        itemStyle: { color: '#3B82F6' },
        lineStyle: { width: 4 },
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
        name: 'Urban',
        type: 'line',
        data: predictions.map(p => p.urban),
        smooth: true,
        itemStyle: { color: '#10B981' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: 'Rural',
        type: 'line',
        data: predictions.map(p => p.rural),
        smooth: true,
        itemStyle: { color: '#F59E0B' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: 'Literacy Rate',
        type: 'line',
        yAxisIndex: 1,
        data: predictions.map(p => p.literacy_rate),
        smooth: true,
        itemStyle: { color: '#8B5CF6' },
        lineStyle: { width: 3, type: 'dashed' },
        symbol: 'diamond',
        symbolSize: 8
      }
    ]
  };

  const latestPrediction = predictions[predictions.length - 1];
  const currentYear = predictions[0].year;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">10-Year Population Forecast</h3>
        <p className="text-gray-700 mb-4">AI-powered predictions based on historical growth patterns for {regionName}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 shadow-md border border-gray-200">
            <div className="text-sm text-gray-700 mb-1">Predicted Population ({latestPrediction.year})</div>
            <div className="text-2xl font-bold text-blue-600">{(latestPrediction.total_population / 1_000_000).toFixed(1)}M</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 shadow-md border border-gray-200">
            <div className="text-sm text-gray-700 mb-1">Predicted Urban ({latestPrediction.year})</div>
            <div className="text-2xl font-bold text-green-600">{(latestPrediction.urban / 1_000_000).toFixed(1)}M</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 shadow-md border border-gray-200">
            <div className="text-sm text-gray-700 mb-1">Predicted Rural ({latestPrediction.year})</div>
            <div className="text-2xl font-bold text-orange-600">{(latestPrediction.rural / 1_000_000).toFixed(1)}M</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 shadow-md border border-gray-200">
            <div className="text-sm text-gray-700 mb-1">Predicted Literacy ({latestPrediction.year})</div>
            <div className="text-2xl font-bold text-purple-600">{latestPrediction.literacy_rate.toFixed(1)}%</div>
          </div>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
    </div>
  );
}
