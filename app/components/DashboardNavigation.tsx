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
  Navigation
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'predictions', label: 'Forecasts', icon: TrendingUp },
  { id: 'demographics', label: 'Demographics', icon: Users },
  { id: 'growth', label: 'Growth Trends', icon: TrendingUp },
  { id: 'urbanization', label: 'Urbanization', icon: MapPin },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'disability', label: 'Disability', icon: Activity },
  { id: 'infrastructure', label: 'Infrastructure', icon: Home }
];

export default function DashboardNavigation() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsSticky(scrollPosition > 100);

      // Update active section based on scroll position
      const sections = navItems.map(item => document.getElementById(item.id));
      const current = sections.find((section, index) => {
        if (!section) return false;
        const rect = section.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom >= 150;
      });

      if (current) {
        const sectionId = current.id;
        setActiveSection(sectionId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <div 
      className={`${
        isSticky ? 'fixed top-16 z-40 shadow-lg' : 'relative'
      } w-full bg-white/95 backdrop-blur-md border-b-2 border-gray-200 transition-all duration-300`}
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
        <nav className="flex items-center justify-between py-3 overflow-x-auto">
          <div className="flex items-center gap-1 flex-nowrap">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
                    transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

