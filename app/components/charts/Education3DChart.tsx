'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';
import 'echarts-gl';
import { CensusRegion } from '@/lib/fetchCensusData';

interface Props {
  regions: CensusRegion[];
}

export default function Education3DChart({ regions }: Props) {
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Education Enrolment by Level (3D)',
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
      subtext: 'Drag to rotate, scroll to zoom',
      subtextStyle: { fontSize: 12, color: '#6b7280' }
    },
    tooltip: {
      formatter: (params: any) => {
        const levels = ['Primary', 'Middle', 'Matric', 'Intermediate', 'Graduation+'];
        return `
          <div style="padding: 8px;">
            <strong>${regions[params.data[2]]?.name || 'Unknown'}</strong><br/>
            Level: ${levels[params.data[0]] || 'Unknown'}<br/>
            Enrolment: ${(params.data[1]).toFixed(2)}M
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
      name: 'Education Level',
      nameTextStyle: { color: '#6b7280', fontSize: 14 }
    },
    yAxis3D: {
      type: 'value',
      name: 'Enrolment (Millions)',
      nameTextStyle: { color: '#6b7280', fontSize: 14 }
    },
    zAxis3D: {
      type: 'value',
      name: 'Region',
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
      type: 'bar3D',
      data: regions.flatMap((r, regionIdx) => {
        const education = r.education?.total || {};
        return [
          [0, (education.enrolment_primary || 0) / 1_000_000, regionIdx],
          [1, (education.enrolment_middle || 0) / 1_000_000, regionIdx],
          [2, (education.enrolment_matric || 0) / 1_000_000, regionIdx],
          [3, (education.enrolment_intermediate || 0) / 1_000_000, regionIdx],
          [4, (education.enrolment_graduation_above || 0) / 1_000_000, regionIdx]
        ];
      }),
      shading: 'lambert',
      itemStyle: {
        color: (params: any) => {
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
          return colors[params.data[0] % colors.length];
        },
        opacity: 0.9
      }
    }]
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">3D Education Enrolment</h3>
        <p className="text-gray-700">Interactive 3D bar chart showing education enrolment by level across regions. Use mouse to rotate, zoom, and pan.</p>
      </div>
      <ReactECharts option={option} style={{ height: '700px', width: '100%' }} />
    </div>
  );
}
