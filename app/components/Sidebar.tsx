'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  GraduationCap, 
  Activity, 
  Home,
  LayoutDashboard,
  X
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

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const sidebarContent = (
    <>
      <div className="p-4 sm:p-6 border-b-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 sm:p-2.5 rounded-xl shadow-lg">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Census 2023
              </h2>
              <p className="text-xs text-gray-500 font-medium hidden sm:block">Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      <nav className="p-3 sm:p-4 space-y-2 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.id}
              href={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }
              `}
            >
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 sm:p-4 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-xs text-gray-500 text-center">
          <p className="font-semibold text-gray-700">Pakistan Census</p>
          <p className="text-gray-600 hidden sm:block">2023 Data Dashboard</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 bg-white border-r-2 border-gray-200 h-screen sticky top-0 overflow-y-auto shadow-lg z-20 flex-col">
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={`
          lg:hidden fixed left-0 top-0 h-full w-64 bg-white border-r-2 border-gray-200 shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

