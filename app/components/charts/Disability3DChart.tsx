'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import 'echarts-gl';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
}

export default function Disability3DChart({ regions }: Props) {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Disability Types by Region (3D Scatter)',
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
      subtext: 'Drag to rotate, scroll to zoom',
      subtextStyle: { fontSize: 12, color: '#6b7280' }
    },
    tooltip: {
      formatter: (params: any) => {
        const types = ['Seeing', 'Hearing', 'Walking/Climbing', 'Communication', 'Memorization', 'Self Care'];
        return `
          <div style="padding: 8px;">
            <strong>${regions[params.data[0]]?.name || 'Unknown'}</strong><br/>
            Type: ${types[params.data[2]] || 'Unknown'}<br/>
            Count: ${(params.data[1]).toFixed(2)}M
          </div>
        `;
      },
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      borderColor: '#3B82F6',
      borderWidth: 2,
      textStyle: { color: '#fff', fontSize: 13 }
    },
    xAxis3D: {
      type: 'category',
      data: regions.map(r => r.name),
      name: 'Region',
      nameTextStyle: { color: '#6b7280', fontSize: 14 }
    },
    yAxis3D: {
      type: 'value',
      name: 'Count (Millions)',
      nameTextStyle: { color: '#6b7280', fontSize: 14 }
    },
    zAxis3D: {
      type: 'value',
      name: 'Disability Type',
      nameTextStyle: { color: '#6b7280', fontSize: 14 }
    },
    grid3D: {
      boxWidth: 200,
      boxDepth: 100,
      viewControl: {
        projection: 'perspective',
        autoRotate: false,
        rotateSensitivity: 1,
        zoomSensitivity: 1,
        panSensitivity: 1,
        distance: 200
      }
    },
    series: [{
      type: 'scatter3D',
      data: regions.flatMap((r, i) => [
        [i, r.disability.total.seeing / 1_000_000, 0, 'Seeing'],
        [i, r.disability.total.hearing / 1_000_000, 1, 'Hearing'],
        [i, r.disability.total.walking_climbing / 1_000_000, 2, 'Walking/Climbing'],
        [i, r.disability.total.communication / 1_000_000, 3, 'Communication'],
        [i, r.disability.total.memorization_focus / 1_000_000, 4, 'Memorization'],
        [i, r.disability.total.self_care / 1_000_000, 5, 'Self Care']
      ]),
      symbolSize: 25,
      itemStyle: {
        color: '#3B82F6',
        opacity: 0.8
      }
    }]
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Disability Analysis (3D)</h3>
        <p className="text-gray-600">Three-dimensional scatter plot showing different disability types across regions.</p>
      </div>
      <ReactECharts option={option} style={{ height: '700px', width: '100%' }} />
    </div>
  );
}

