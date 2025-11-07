'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Users, User, UserCheck, Building2, Home as HomeIcon, TrendingUp } from 'lucide-react';

export default function HeroSection() {
  const { national } = useAppStore();

  const totalPopulation = national?.totalPopulation || 0;
  const formattedPopulation = (totalPopulation / 1_000_000).toFixed(2);

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 mr-2 animate-pulse" />
            <span className="text-sm font-semibold bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm">
              Official Census Data
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Pakistan Population Census 2023
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Comprehensive demographic data, trends, and AI-powered projections
          </p>
          
          {totalPopulation > 0 && (
            <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 mr-2" />
                <div className="text-6xl md:text-7xl font-bold">
                  {formattedPopulation}M
                </div>
              </div>
              <div className="text-lg text-blue-100 font-medium">Total Population</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          {national && (
            <>
              <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <User className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                <div className="text-3xl font-bold mb-1">{(national.male / 1_000_000).toFixed(1)}M</div>
                <div className="text-sm text-blue-100 font-medium">Male</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <UserCheck className="h-8 w-8 mx-auto mb-3 text-pink-200" />
                <div className="text-3xl font-bold mb-1">{(national.female / 1_000_000).toFixed(1)}M</div>
                <div className="text-sm text-blue-100 font-medium">Female</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <Building2 className="h-8 w-8 mx-auto mb-3 text-cyan-200" />
                <div className="text-3xl font-bold mb-1">{((national.urban / national.totalPopulation) * 100).toFixed(1)}%</div>
                <div className="text-sm text-blue-100 font-medium">Urban</div>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <HomeIcon className="h-8 w-8 mx-auto mb-3 text-green-200" />
                <div className="text-3xl font-bold mb-1">{((national.rural / national.totalPopulation) * 100).toFixed(1)}%</div>
                <div className="text-sm text-blue-100 font-medium">Rural</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
