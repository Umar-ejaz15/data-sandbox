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
    visualMap: {
      max: Math.max(...regions.map(r => r.housing.total.households), 1),
      inRange: {
        color: ['#E3F2FD', '#1976D2', '#0D47A1']
      },
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 30
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
      type: 'surface',
      data: regions.flatMap((r, i) => [
        [0, i, r.housing.total.pakka / 1_000_000],
        [1, i, r.housing.total.semi_pakka / 1_000_000],
        [2, i, r.housing.total.kacha / 1_000_000]
      ]),
      itemStyle: {
        opacity: 0.85
      }
    }]
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Housing Infrastructure (3D Surface)</h3>
        <p className="text-gray-600">Three-dimensional surface chart showing housing type distribution across regions.</p>
      </div>
      <ReactECharts option={option} style={{ height: '700px', width: '100%' }} />
    </div>
  );
}

