'use client';

import React from 'react';
import { BarChart3, Database, TrendingUp, Download, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-bold">About</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Pakistan Population Census 2023 visualization and analysis platform.
              Data sourced from official census reports with AI-powered forecasting.
            </p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-6 w-6 text-green-400" />
              <h3 className="text-lg font-bold">Data Sources</h3>
            </div>
            <ul className="text-gray-400 text-sm space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Pakistan Bureau of Statistics</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Census 2023 Reports</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Table 1 Data</span>
              </li>
            </ul>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              <h3 className="text-lg font-bold">Features</h3>
            </div>
            <ul className="text-gray-400 text-sm space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Interactive Visualizations</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>AI Population Projections</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Trend Analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Data Export</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 Pakistan Census 2023 Dashboard. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
