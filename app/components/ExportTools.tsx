'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Download, FileJson, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function ExportTools() {
  const { provinces, national, forecasts } = useAppStore();
  const [exported, setExported] = useState<string | null>(null);

  const exportToJSON = () => {
    const data = {
      national,
      provinces,
      forecasts: Object.fromEntries(forecasts),
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `census_2023_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExported('json');
    setTimeout(() => setExported(null), 2000);
  };

  const exportToCSV = () => {
    if (!national) return;
    
    const rows = [
      ['Province', 'Total Population', 'Male', 'Female', 'Urban', 'Rural', 'Households', 'Avg Household Size'],
      [
        national.province,
        national.totalPopulation,
        national.male,
        national.female,
        national.urban,
        national.rural,
        national.households,
        national.averageHouseholdSize.toFixed(2)
      ],
      ...provinces.map(p => [
        p.province,
        p.totalPopulation,
        p.male,
        p.female,
        p.urban,
        p.rural,
        p.households,
        p.averageHouseholdSize.toFixed(2)
      ])
    ];

    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `census_2023_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExported('csv');
    setTimeout(() => setExported(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center space-x-2 mb-4">
        <Download className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Export Data</h2>
      </div>
      <p className="text-gray-600 mb-6 text-sm">Download census data in your preferred format</p>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={exportToJSON}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exported === 'json' ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>Exported!</span>
            </>
          ) : (
            <>
              <FileJson className="h-5 w-5" />
              <span>Export JSON</span>
            </>
          )}
        </button>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exported === 'csv' ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>Exported!</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-5 w-5" />
              <span>Export CSV</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
