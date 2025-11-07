'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </div>
    </nav>
  );
}
