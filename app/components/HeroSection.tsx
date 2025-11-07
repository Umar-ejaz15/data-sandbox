'use client';

import React from 'react';
import { CensusRegion } from '@/lib/fetchCensusData';
import { Users, TrendingUp, MapPin, Building2 } from 'lucide-react';

interface Props {
  nationalData: CensusRegion | null;
}

export default function HeroSection({ nationalData }: Props) {
  if (!nationalData) {
    return null;
  }

  const totalPop = nationalData.demographics.total_population;
  const growthRate = nationalData.demographics.annual_growth_rate_2017_2023;
  const literacyRate = nationalData.education.total.literacy_rate;
  const urbanPercent = nationalData.demographics.urban_proportion;

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-20 px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30">
              <span className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Official Census 2023 Data
              </span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
            Pakistan Census 2023
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto font-medium">
            Comprehensive demographic insights, education statistics, and infrastructure analysis
          </p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl transform hover:scale-105 transition-all duration-300">
            <Users className="h-10 w-10 mb-4 text-blue-200" />
            <div className="text-4xl font-bold mb-2">{(totalPop / 1_000_000).toFixed(1)}M</div>
            <div className="text-sm text-blue-100 font-medium">Total Population</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl transform hover:scale-105 transition-all duration-300">
            <TrendingUp className="h-10 w-10 mb-4 text-green-200" />
            <div className="text-4xl font-bold mb-2">{growthRate.toFixed(2)}%</div>
            <div className="text-sm text-blue-100 font-medium">Annual Growth Rate</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl transform hover:scale-105 transition-all duration-300">
            <MapPin className="h-10 w-10 mb-4 text-purple-200" />
            <div className="text-4xl font-bold mb-2">{literacyRate.toFixed(1)}%</div>
            <div className="text-sm text-blue-100 font-medium">Literacy Rate</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl transform hover:scale-105 transition-all duration-300">
            <Building2 className="h-10 w-10 mb-4 text-cyan-200" />
            <div className="text-4xl font-bold mb-2">{urbanPercent.toFixed(1)}%</div>
            <div className="text-sm text-blue-100 font-medium">Urban Population</div>
          </div>
        </div>
      </div>
    </div>
  );
}

