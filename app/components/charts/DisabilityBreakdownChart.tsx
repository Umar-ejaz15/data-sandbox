'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import { CensusRegion } from '@/lib/fetchCensusData';
import { Eye, Ear, Footprints, MessageSquare, Brain, Heart, Activity } from 'lucide-react';

interface Props {
  region: CensusRegion;
}

const disabilityIcons = {
  'Seeing': Eye,
  'Hearing': Ear,
  'Walking/Climbing': Footprints,
  'Communication': MessageSquare,
  'Memorization': Brain,
  'Self Care': Heart
};

export default function DisabilityBreakdownChart({ region }: Props) {
  const disabilityData = [
    { name: 'Seeing', value: region.disability.total.seeing, color: '#3B82F6' },
    { name: 'Hearing', value: region.disability.total.hearing, color: '#10B981' },
    { name: 'Walking/Climbing', value: region.disability.total.walking_climbing, color: '#F59E0B' },
    { name: 'Communication', value: region.disability.total.communication, color: '#EF4444' },
    { name: 'Memorization', value: region.disability.total.memorization_focus, color: '#8B5CF6' },
    { name: 'Self Care', value: region.disability.total.self_care, color: '#EC4899' }
  ];

  const totalDisability = disabilityData.reduce((sum, d) => sum + d.value, 0);
  const disabilityRate = ((totalDisability / region.disability.total.population) * 100).toFixed(2);

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Disability Types Breakdown',
      subtext: region.name,
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
      subtextStyle: { fontSize: 16, color: '#6b7280' }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const percent = params.percent;
        return `
          <div style="padding: 8px;">
            <strong>${params.name}</strong><br/>
            Count: ${(params.value / 1_000_000).toFixed(2)}M<br/>
            Percentage: ${percent}%
          </div>
        `;
      },
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      textStyle: { color: '#fff', fontSize: 13 }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: { fontSize: 13, fontWeight: '600', color: '#374151' },
      itemGap: 15
    },
    series: [{
      type: 'pie',
      radius: ['40%', '75%'],
      center: ['60%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 3
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 13,
        fontWeight: 'bold'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 10
      },
      data: disabilityData.map(d => ({
        value: d.value,
        name: d.name,
        itemStyle: { color: d.color }
      }))
    }]
  };

  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl shadow-xl p-8 border-2 border-rose-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Disability Analysis</h3>
        <p className="text-gray-700 mb-4">Detailed breakdown of different disability types in {region.name}</p>
        <div className="bg-white rounded-lg p-4 shadow-md mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Disability Rate</div>
              <div className="text-3xl font-bold text-red-600">{disabilityRate}%</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Total Cases</div>
              <div className="text-2xl font-bold text-gray-800">{(totalDisability / 1_000_000).toFixed(2)}M</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {disabilityData.map((item, idx) => {
            const Icon = disabilityIcons[item.name as keyof typeof disabilityIcons] || Activity;
            const percent = ((item.value / totalDisability) * 100).toFixed(1);
            return (
              <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" style={{ color: item.color }} />
                  <div className="text-xs font-semibold text-gray-700 truncate">{item.name}</div>
                </div>
                <div className="text-lg font-bold" style={{ color: item.color }}>
                  {(item.value / 1_000_000).toFixed(2)}M
                </div>
                <div className="text-xs text-gray-500">{percent}%</div>
              </div>
            );
          })}
        </div>
      </div>
      <ReactECharts option={option} style={{ height: '600px', width: '100%' }} />
    </div>
  );
}

