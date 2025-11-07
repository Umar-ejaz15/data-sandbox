'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store/useAppStore';
import { Building2, TrendingUp, Users, MapPin } from 'lucide-react';

export default function UrbanLocalities() {
  const { urbanLocalities, selectedProvince, selectedLevel } = useAppStore();

  // Filter localities based on selection
  const filteredLocalities = useMemo(() => {
    let filtered = urbanLocalities;
    
    if (selectedProvince) {
      filtered = filtered.filter(l => l.province === selectedProvince);
    }
    
    return filtered.sort((a, b) => b.population - a.population);
  }, [urbanLocalities, selectedProvince]);

  // Group by population size
  const sizeGroups = useMemo(() => {
    const groups: { [key: string]: number } = {};
    filteredLocalities.forEach(loc => {
      const size = loc.populationSize || 'Unknown';
      groups[size] = (groups[size] || 0) + 1;
    });
    return groups;
  }, [filteredLocalities]);

  // Top 20 localities
  const topLocalities = filteredLocalities.slice(0, 20);

  if (filteredLocalities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="text-center text-gray-500">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No urban locality data available</p>
        </div>
      </div>
    );
  }

  const barChartOption = {
    title: {
      text: 'Top 20 Urban Localities by Population',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const param = params[0];
        const locality = topLocalities[param.dataIndex];
        return `${param.name}<br/>Population: ${(param.value / 1_000_000).toFixed(2)}M<br/>Province: ${locality.province}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: topLocalities.map(l => l.locality),
      axisLabel: { 
        rotate: 45,
        interval: 0,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: 'Population (Millions)',
      axisLabel: {
        formatter: (value: number) => (value / 1_000_000).toFixed(1) + 'M'
      }
    },
    series: [{
      name: 'Population',
      type: 'bar',
      data: topLocalities.map(l => l.population),
      itemStyle: {
        color: (params: any) => {
          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
          return colors[params.dataIndex % colors.length];
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => (params.value / 1_000_000).toFixed(1) + 'M',
        fontSize: 9
      }
    }]
  };

  const pieChartOption = {
    title: {
      text: 'Urban Localities by Population Size',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [{
      name: 'Localities',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{c} ({d}%)'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      data: Object.entries(sizeGroups).map(([name, value]) => ({
        value,
        name
      }))
    }]
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Localities</p>
              <p className="text-3xl font-bold text-gray-800">{filteredLocalities.length}</p>
            </div>
            <Building2 className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Population</p>
              <p className="text-3xl font-bold text-gray-800">
                {(filteredLocalities.reduce((sum, l) => sum + l.population, 0) / 1_000_000).toFixed(1)}M
              </p>
            </div>
            <Users className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Growth Rate</p>
              <p className="text-3xl font-bold text-gray-800">
                {filteredLocalities.filter(l => l.growthRate).length > 0
                  ? (filteredLocalities
                      .filter(l => l.growthRate)
                      .reduce((sum, l) => sum + (l.growthRate || 0), 0) / 
                      filteredLocalities.filter(l => l.growthRate).length).toFixed(2)
                  : 'N/A'}%
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Provinces</p>
              <p className="text-3xl font-bold text-gray-800">
                {new Set(filteredLocalities.map(l => l.province)).size}
              </p>
            </div>
            <MapPin className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <ReactECharts option={barChartOption} style={{ height: '500px' }} />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <ReactECharts option={pieChartOption} style={{ height: '400px' }} />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold mb-4">Urban Localities List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Locality</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Province</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Population</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topLocalities.map((locality, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{locality.locality}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{locality.province}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{(locality.population / 1_000_000).toFixed(2)}M</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{locality.populationSize}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {locality.growthRate ? `${locality.growthRate.toFixed(2)}%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

