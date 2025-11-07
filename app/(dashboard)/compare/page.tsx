'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchCensusData } from '@/lib/fetchCensusData';
import { useAppStore } from '@/store/useAppStore';
import { CensusRegion } from '@/lib/fetchCensusData';
import { Users, TrendingUp, MapPin, GraduationCap, Activity, Home, BarChart3, ArrowLeft } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import Link from 'next/link';

function CompareContent() {
  const searchParams = useSearchParams();
  const { censusData, setCensusData, setLoading, setError, isLoading } = useAppStore();
  const [regions, setRegions] = useState<CensusRegion[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchCensusData();
        setCensusData(data);
        
        // Get region names from URL params
        const regionNames = searchParams.get('regions')?.split(',') || [];
        if (regionNames.length > 0) {
          const selectedRegions = data.regions.filter(r => regionNames.includes(r.name));
          setRegions(selectedRegions);
        }
      } catch (err) {
        setError('Failed to load census data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setCensusData, setLoading, setError, searchParams]);

  if (isLoading || !censusData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg font-semibold">Loading comparison data...</p>
        </div>
      </div>
    );
  }

  if (regions.length < 2) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/overview" className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Region Comparison</h1>
            <p className="text-gray-700 text-lg">Compare statistics across multiple regions</p>
          </div>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 sm:p-8 text-center">
          <p className="text-yellow-800 text-base sm:text-lg font-semibold">
            Please select at least 2 regions to compare from the Overview page.
          </p>
          <Link href="/overview" className="mt-4 inline-block px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base">
            Go to Overview
          </Link>
        </div>
      </div>
    );
  }

  // Comparison charts data
  const populationData = {
    categories: regions.map(r => r.name),
    values: regions.map(r => r.demographics.total_population / 1_000_000)
  };

  const growthRateData = regions.map(r => ({
    name: r.name,
    value: r.demographics.annual_growth_rate_2017_2023
  }));

  const literacyData = regions.map(r => ({
    name: r.name,
    urban: r.education.urban.literacy_rate,
    rural: r.education.rural.literacy_rate
  }));

  const urbanRuralData = regions.map(r => ({
    name: r.name,
    urban: (r.demographics.urban.population / r.demographics.total_population) * 100,
    rural: (r.demographics.rural.population / r.demographics.total_population) * 100
  }));

  const colors = { text: '#1f2937', axisLabel: '#6b7280', line: '#e5e7eb' };

  // Population comparison chart
  const populationOption = {
    backgroundColor: 'transparent',
    title: {
      text: 'Population Comparison',
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: colors.text }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value.toFixed(1)}M`;
      }
    },
    xAxis: {
      type: 'category',
      data: populationData.categories,
      axisLabel: { rotate: 45, fontSize: 12, color: colors.axisLabel },
      axisLine: { lineStyle: { color: colors.line } }
    },
    yAxis: {
      type: 'value',
      name: 'Population (Millions)',
      nameTextStyle: { color: colors.axisLabel },
      axisLabel: { formatter: (value: number) => value.toFixed(1) + 'M', color: colors.axisLabel },
      splitLine: { lineStyle: { color: colors.line, type: 'dashed' } }
    },
    series: [{
      name: 'Population',
      type: 'bar',
      data: populationData.values,
      itemStyle: {
        color: new Array(regions.length).fill(null).map((_, i) => {
          const colors = ['#3B82F6', '#10B981', '#F59E0B'];
          return colors[i % colors.length];
        })
      },
      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => params.value.toFixed(1) + 'M'
      }
    }]
  };

  // Growth rate comparison
  const growthOption = {
    backgroundColor: 'transparent',
    title: {
      text: 'Growth Rate Comparison',
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: colors.text }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}: ${params.value}%`,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: growthRateData.map(r => ({
        value: r.value,
        name: r.name,
        itemStyle: {
          color: growthRateData.indexOf(r) === 0 ? '#3B82F6' : 
                 growthRateData.indexOf(r) === 1 ? '#10B981' : '#F59E0B'
        }
      })),
      label: {
        formatter: '{b}: {c}%'
      }
    }]
  };

  // Literacy comparison
  const literacyOption = {
    backgroundColor: 'transparent',
    title: {
      text: 'Literacy Rate Comparison',
      left: 'center',
      textStyle: { fontSize: 22, fontWeight: 'bold', color: colors.text }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['Urban', 'Rural'],
      top: 35,
      textStyle: { color: colors.text }
    },
    xAxis: {
      type: 'category',
      data: literacyData.map(d => d.name),
      axisLabel: { rotate: 45, color: colors.axisLabel },
      axisLine: { lineStyle: { color: colors.line } }
    },
    yAxis: {
      type: 'value',
      name: 'Literacy Rate (%)',
      nameTextStyle: { color: colors.axisLabel },
      max: 100,
      axisLabel: { color: colors.axisLabel },
      splitLine: { lineStyle: { color: colors.line, type: 'dashed' } }
    },
    series: [
      {
        name: 'Urban',
        type: 'bar',
        data: literacyData.map(d => d.urban),
        itemStyle: { color: '#3B82F6' }
      },
      {
        name: 'Rural',
        type: 'bar',
        data: literacyData.map(d => d.rural),
        itemStyle: { color: '#10B981' }
      }
    ]
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Link href="/overview" className="self-start p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Region Comparison</h1>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg break-words">
            Comparing {regions.map(r => r.name).join(', ')}
          </p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {regions.map((region, idx) => (
          <div key={region.name} className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 truncate">{region.name}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Population</span>
                </div>
                <span className="font-bold text-gray-900">
                  {(region.demographics.total_population / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">Growth Rate</span>
                </div>
                <span className="font-bold text-gray-900">
                  {region.demographics.annual_growth_rate_2017_2023.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-700">Literacy</span>
                </div>
                <span className="font-bold text-gray-900">
                  {region.education.total.literacy_rate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-gray-700">Urban</span>
                </div>
                <span className="font-bold text-gray-900">
                  {region.demographics.urban_proportion.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
          <div className="h-[300px] sm:h-[400px] w-full">
            <ReactECharts option={populationOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
          <div className="h-[300px] sm:h-[400px] w-full">
            <ReactECharts option={growthOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200 lg:col-span-2">
          <div className="h-[300px] sm:h-[400px] w-full">
            <ReactECharts option={literacyOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200 overflow-x-auto">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Detailed Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-3 sm:p-4 text-gray-900 font-bold text-sm sm:text-base">Metric</th>
                {regions.map(r => (
                  <th key={r.name} className="text-right p-3 sm:p-4 text-gray-900 font-bold text-sm sm:text-base">{r.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-3 sm:p-4 text-gray-700 text-sm sm:text-base">Total Population</td>
                {regions.map(r => (
                  <td key={r.name} className="text-right p-3 sm:p-4 font-semibold text-gray-900 text-sm sm:text-base">
                    {(r.demographics.total_population / 1_000_000).toFixed(1)}M
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-3 sm:p-4 text-gray-700 text-sm sm:text-base">Male Population</td>
                {regions.map(r => (
                  <td key={r.name} className="text-right p-3 sm:p-4 font-semibold text-gray-900 text-sm sm:text-base">
                    {(r.demographics.male / 1_000_000).toFixed(1)}M
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-3 sm:p-4 text-gray-700 text-sm sm:text-base">Female Population</td>
                {regions.map(r => (
                  <td key={r.name} className="text-right p-3 sm:p-4 font-semibold text-gray-900 text-sm sm:text-base">
                    {(r.demographics.female / 1_000_000).toFixed(1)}M
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-3 sm:p-4 text-gray-700 text-sm sm:text-base">Sex Ratio</td>
                {regions.map(r => (
                  <td key={r.name} className="text-right p-3 sm:p-4 font-semibold text-gray-900 text-sm sm:text-base">
                    {r.demographics.sex_ratio.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-3 sm:p-4 text-gray-700 text-sm sm:text-base">Growth Rate (%)</td>
                {regions.map(r => (
                  <td key={r.name} className="text-right p-3 sm:p-4 font-semibold text-gray-900 text-sm sm:text-base">
                    {r.demographics.annual_growth_rate_2017_2023.toFixed(2)}%
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-3 sm:p-4 text-gray-700 text-sm sm:text-base">Literacy Rate (%)</td>
                {regions.map(r => (
                  <td key={r.name} className="text-right p-3 sm:p-4 font-semibold text-gray-900 text-sm sm:text-base">
                    {r.education.total.literacy_rate.toFixed(1)}%
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-3 sm:p-4 text-gray-700 text-sm sm:text-base">Urban Population (%)</td>
                {regions.map(r => (
                  <td key={r.name} className="text-right p-3 sm:p-4 font-semibold text-gray-900 text-sm sm:text-base">
                    {r.demographics.urban_proportion.toFixed(1)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 sm:p-4 text-gray-700 text-sm sm:text-base">Household Size</td>
                {regions.map(r => (
                  <td key={r.name} className="text-right p-3 sm:p-4 font-semibold text-gray-900 text-sm sm:text-base">
                    {r.demographics.avg_household_size.toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg font-semibold">Loading comparison...</p>
        </div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}

