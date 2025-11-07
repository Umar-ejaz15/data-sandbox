'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import 'echarts-gl';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
}

export default function Housing3DChart({ regions }: Props) {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Housing Types Distribution (3D Surface)',
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
      subtext: 'Drag to rotate, scroll to zoom',
      subtextStyle: { fontSize: 12, color: '#6b7280' }
    },
    tooltip: {
      formatter: (params: any) => {
        const types = ['Pakka', 'Semi-Pakka', 'Kacha'];
        return `
          <div style="padding: 8px;">
            <strong>${regions[params.data[1]]?.name || 'Unknown'}</strong><br/>
            Type: ${types[params.data[0]] || 'Unknown'}<br/>
            Households: ${(params.data[2]).toFixed(2)}M
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
      data: ['Pakka', 'Semi-Pakka', 'Kacha'],
      name: 'Housing Type',
      nameTextStyle: { color: '#6b7280', fontSize: 14 }
    },
    yAxis3D: {
      type: 'category',
      data: regions.map(r => r.name),
      name: 'Region',
      nameTextStyle: { color: '#6b7280', fontSize: 14 }
    },
    zAxis3D: {
      type: 'value',
      name: 'Households (Millions)',
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
      type: 'surface',
      data: regions.flatMap((r, regionIdx) => [
        [0, regionIdx, r.housing.total.pakka / 1_000_000],
        [1, regionIdx, r.housing.total.semi_pakka / 1_000_000],
        [2, regionIdx, r.housing.total.kacha / 1_000_000]
      ]),
      itemStyle: {
        color: (params: any) => {
          const colors = ['#3B82F6', '#10B981', '#F59E0B'];
          return colors[params.data[0] % colors.length];
        },
        opacity: 0.8
      }
    }]
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">3D Housing Infrastructure</h3>
        <p className="text-gray-700">Interactive 3D surface chart showing housing types distribution. Use mouse to rotate, zoom, and pan.</p>
      </div>
      <ReactECharts option={option} style={{ height: '700px', width: '100%' }} />
    </div>
  );
}
