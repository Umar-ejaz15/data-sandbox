'use client';

import React from 'react';
import { BarChart3, Home, Users, TrendingUp, LineChart } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Census 2023
            </h1>
          </div>
          <div className="hidden md:flex space-x-1">
            <a 
              href="#overview" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
            >
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Overview</span>
            </a>
            <a 
              href="#demographics" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
            >
              <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Demographics</span>
            </a>
            <a 
              href="#trends" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
            >
              <TrendingUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Trends</span>
            </a>
            <a 
              href="#projections" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
            >
              <LineChart className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Projections</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
