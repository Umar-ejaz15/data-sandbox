'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  GraduationCap, 
  Activity, 
  Home,
  LayoutDashboard
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/overview' },
  { id: 'predictions', label: 'Forecasts', icon: TrendingUp, path: '/predictions' },
  { id: 'demographics', label: 'Demographics', icon: Users, path: '/demographics' },
  { id: 'growth', label: 'Growth Trends', icon: TrendingUp, path: '/growth' },
  { id: 'urbanization', label: 'Urbanization', icon: MapPin, path: '/urbanization' },
  { id: 'education', label: 'Education', icon: GraduationCap, path: '/education' },
  { id: 'disability', label: 'Disability', icon: Activity, path: '/disability' },
  { id: 'infrastructure', label: 'Infrastructure', icon: Home, path: '/infrastructure' },
  { id: 'compare', label: 'Compare', icon: BarChart3, path: '/compare' }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r-2 border-gray-200 h-screen sticky top-0 overflow-y-auto shadow-lg z-20">
      <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Census 2023
            </h2>
            <p className="text-xs text-gray-500 font-medium">Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.id}
              href={item.path}
                className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-xs text-gray-500 text-center">
          <p className="font-semibold text-gray-700">Pakistan Census</p>
          <p className="text-gray-600">2023 Data Dashboard</p>
        </div>
      </div>
    </aside>
  );
}

