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
      type: 'value',
      name: 'Region Index',
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
      boxDepth: 80,
      viewControl: {
        projection: 'perspective',
        autoRotate: false,
        rotateSensitivity: 1,
        zoomSensitivity: 1,
        panSensitivity: 1,
        distance: 200
      },
      light: {
        main: { intensity: 1.2, shadow: true },
        ambient: { intensity: 0.3 }
      }
    },
    series: [{
      type: 'scatter3D',
      data: regions.flatMap((r, regionIdx) => [
        [regionIdx, r.disability.total.seeing / 1_000_000, 0],
        [regionIdx, r.disability.total.hearing / 1_000_000, 1],
        [regionIdx, r.disability.total.walking_climbing / 1_000_000, 2],
        [regionIdx, r.disability.total.communication / 1_000_000, 3],
        [regionIdx, r.disability.total.memorization_focus / 1_000_000, 4],
        [regionIdx, r.disability.total.self_care / 1_000_000, 5]
      ]),
      symbolSize: 20,
      itemStyle: {
        color: (params: any) => {
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
          return colors[params.data[2] % colors.length];
        },
        opacity: 0.8
      }
    }]
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">3D Disability Analysis</h3>
        <p className="text-gray-700">Interactive 3D scatter plot showing disability types across regions. Use mouse to rotate, zoom, and pan.</p>
      </div>
      <ReactECharts option={option} style={{ height: '700px', width: '100%' }} />
    </div>
  );
}
