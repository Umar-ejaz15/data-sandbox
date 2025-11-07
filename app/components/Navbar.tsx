'use client';

import React from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { fetchCensusData } from '@/lib/fetchCensusData';

export default function Navbar() {
  const { setCensusData, setLoading, setError } = useAppStore();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setLoading(true);
      const data = await fetchCensusData();
      setCensusData(data);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  return (
           <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b-2 border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
                     <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                       Pakistan Census 2023
                     </h1>
                     <p className="text-xs text-gray-500">Interactive Data Dashboard</p>
            </div>
          </div>
                 <div className="flex items-center gap-3">
                   <button
                     onClick={handleRefresh}
                     disabled={isRefreshing}
                     className="p-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                     title="Refresh Data"
                   >
                     <RefreshCw className={`h-5 w-5 text-gray-700 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                   </button>
                 </div>
        </div>
      </div>
    </nav>
  );
}
