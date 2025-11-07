'use client';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CensusDashboard from './components/CensusDashboard';
import HeroSection from './components/HeroSection';
import DashboardNavigation from './components/DashboardNavigation';
import { fetchCensusData } from '@/lib/fetchCensusData';
import { useEffect, useState } from 'react';
import { CensusData } from '@/lib/fetchCensusData';

export default function Home() {
  const [censusData, setCensusData] = useState<CensusData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCensusData();
        setCensusData(data);
      } catch (error) {
        console.error('Failed to load census data:', error);
      }
    };
    loadData();
  }, []);

  const nationalData = censusData?.regions.find(r => r.name === 'Pakistan') || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Subtle animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      <Navbar />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <HeroSection nationalData={nationalData} />

        {/* Dashboard Navigation */}
        <DashboardNavigation />

        {/* Dashboard Content - Full Width */}
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-12">
          <CensusDashboard />
        </div>
      </main>

      <Footer />
    </div>
  );
}
