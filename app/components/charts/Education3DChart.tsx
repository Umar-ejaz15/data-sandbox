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
      type: 'category',
      data: ['Primary', 'Middle', 'Matric', 'Intermediate', 'Graduation+'],
      name: 'Education Level',
      nameTextStyle: { color: '#6b7280', fontSize: 14 }
    },
    yAxis3D: {
      type: 'value',
      name: 'Enrolment (Millions)',
      nameTextStyle: { color: '#6b7280', fontSize: 14 }
    },
    zAxis3D: {
      type: 'category',
      data: regions.map(r => r.name),
      name: 'Region',
      nameTextStyle: { color: '#6b7280', fontSize: 14 }
    },
    grid3D: {
      boxWidth: 150,
      boxDepth: 80,
      viewControl: {
        projection: 'perspective',
        autoRotate: false,
        rotateSensitivity: 1,
        zoomSensitivity: 1,
        panSensitivity: 1,
        distance: 200
      }
    },
    series: regions.map((r, regionIdx) => ({
      type: 'bar3D',
      name: r.name,
      data: [
        [0, r.education.total.enrolment_primary / 1_000_000, regionIdx],
        [1, r.education.total.enrolment_middle / 1_000_000, regionIdx],
        [2, r.education.total.enrolment_matric / 1_000_000, regionIdx],
        [3, r.education.total.enrolment_intermediate / 1_000_000, regionIdx],
        [4, r.education.total.enrolment_graduation_above / 1_000_000, regionIdx]
      ],
      shading: 'lambert',
      itemStyle: {
        color: (params: any) => {
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
          return colors[params.dataIndex % colors.length];
        }
      }
    }))
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-100">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Education Enrolment Analysis (3D)</h3>
        <p className="text-gray-600">Multi-dimensional view of student enrolment across different education levels and regions.</p>
      </div>
      <ReactECharts option={option} style={{ height: '700px', width: '100%' }} />
    </div>
  );
}

