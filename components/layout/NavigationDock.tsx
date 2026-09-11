'use client';

import React from 'react';
import {
  Map as MapIcon,
  ShieldAlert,
  Camera,
  CloudRain,
  Sliders,
  BarChart3,
  Settings,
} from 'lucide-react';

export type NavigationTab = 
  | 'map' 
  | 'alerts' 
  | 'field-reports' 
  | 'forecast' 
  | 'scenarios' 
  | 'analytics' 
  | 'settings';

interface NavigationDockProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  unreadAlertsCount?: number;
}

export function NavigationDock({
  activeTab,
  onTabChange,
  unreadAlertsCount = 3,
}: NavigationDockProps) {
  const items = [
    {
      id: 'map' as NavigationTab,
      label: 'Live GIS Map',
      icon: MapIcon,
    },
    {
      id: 'alerts' as NavigationTab,
      label: 'Alerts',
      icon: ShieldAlert,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
    },
    {
      id: 'field-reports' as NavigationTab,
      label: 'Field Reports',
      icon: Camera,
    },
    {
      id: 'forecast' as NavigationTab,
      label: 'Rainfall Forecast',
      icon: CloudRain,
    },
    {
      id: 'scenarios' as NavigationTab,
      label: 'Scenario Simulation',
      icon: Sliders,
    },
    {
      id: 'analytics' as NavigationTab,
      label: 'Analytics & Trends',
      icon: BarChart3,
    },
  ];

  return (
    <nav className="absolute top-24 left-5 z-20 flex flex-col items-center bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-floating border border-slate-200/80 gap-1.5 select-none pointer-events-auto">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`relative group w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={item.label}
          >
            <Icon className="w-5 h-5" />

            {item.badge !== undefined && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}

            {/* Micro Tooltip */}
            <span className="absolute left-14 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md z-50">
              {item.label}
            </span>
          </button>
        );
      })}

      <div className="w-6 h-px bg-slate-200 my-1"></div>

      {/* Settings */}
      <button
        onClick={() => onTabChange('settings')}
        className={`relative group w-11 h-11 flex items-center justify-center rounded-xl transition-all ${
          activeTab === 'settings'
            ? 'bg-slate-900 text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
        title="Settings & API Configuration"
      >
        <Settings className="w-4 h-4" />
        <span className="absolute left-14 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-md z-50">
          Settings & Keys
        </span>
      </button>
    </nav>
  );
}
