'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Globe, ShieldAlert, Sparkles, X, MapPin, Users } from 'lucide-react';
import { RiskZone } from '@/types/riskZone';
import { searchLocations } from '@/services/riskZoneService';
import { SituationOverview } from '@/types/alert';

interface HeaderProps {
  situation: SituationOverview;
  riskZones: RiskZone[];
  onSelectZone: (zone: RiskZone) => void;
  onOpenAlerts: () => void;
  onSelectLocation?: (coords: { lat: number; lng: number }) => void;
  onOpenCitizenMode?: () => void;
}

export function Header({
  situation,
  riskZones,
  onSelectZone,
  onOpenAlerts,
  onSelectLocation,
  onOpenCitizenMode,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    zones: RiskZone[];
    landmarks: Array<{ name: string; type: string; coordinates: { lat: number; lng: number }; zoneId?: string }>;
  }>({ zones: [], landmarks: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function executeSearch() {
      if (searchQuery.trim().length > 0) {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setIsSearchOpen(true);
      } else {
        setSearchResults({ zones: [], landmarks: [] });
        setIsSearchOpen(false);
      }
    }
    executeSearch();
  }, [searchQuery]);

  // Click outside to dismiss search
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="absolute top-4 inset-x-5 z-30 flex items-center justify-between pointer-events-none">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-floating border border-slate-200/80 pointer-events-auto">
        <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-xs">
          P
        </div>
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 tracking-tight text-sm">PRAVAAH</span>
            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              XGBoost ML
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
            Disaster Intelligence System
          </span>
        </div>
      </div>

      {/* Center: Search Pill & Situation Chip */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Search Input Container */}
        <div ref={searchContainerRef} className="relative">
          <div className="flex items-center bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-floating border border-slate-200/80 w-80 md:w-96 text-xs text-slate-600 hover:border-slate-300 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length > 0 && setIsSearchOpen(true)}
              placeholder="Search village, district, corridor..."
              className="bg-transparent border-none p-0 text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-sans font-semibold text-slate-400 bg-slate-100 rounded border border-slate-200">
              /
            </kbd>
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && (searchResults.zones.length > 0 || searchResults.landmarks.length > 0) && (
            <div className="absolute top-full mt-2 inset-x-0 bg-white/98 backdrop-blur-md rounded-2xl shadow-panel border border-slate-200/90 overflow-hidden z-50 text-xs max-h-80 overflow-y-auto">
              {searchResults.zones.length > 0 && (
                <div className="p-2 border-b border-slate-100">
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Risk Zones
                  </div>
                  {searchResults.zones.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => {
                        onSelectZone(zone);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            zone.riskLevel === 'CRITICAL'
                              ? 'bg-rose-500'
                              : zone.riskLevel === 'HIGH'
                              ? 'bg-amber-500'
                              : 'bg-yellow-400'
                          }`}
                        />
                        <div>
                          <div className="font-semibold text-slate-900">{zone.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {zone.district}, {zone.state} • {zone.basin}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">
                        {zone.riskScore}%
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.landmarks.length > 0 && (
                <div className="p-2">
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Points of Interest & Corridors
                  </div>
                  {searchResults.landmarks.map((landmark, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (landmark.zoneId) {
                          const matched = riskZones.find((z) => z.id === landmark.zoneId);
                          if (matched) {
                            onSelectZone(matched);
                          } else {
                            onSelectLocation?.(landmark.coordinates);
                          }
                        } else {
                          onSelectLocation?.(landmark.coordinates);
                        }
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <div className="font-semibold text-slate-900">{landmark.name}</div>
                          <div className="text-[11px] text-slate-500">{landmark.type}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Situation Pill */}
        <button
          onClick={onOpenAlerts}
          className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-floating border border-slate-200/80 text-xs font-semibold text-slate-700 hover:bg-white hover:text-slate-900 transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-rose-600 font-semibold">{situation.criticalZonesCount} critical areas</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-600 font-normal">{situation.attentionZonesCount} require attention</span>
        </button>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-floating border border-slate-200/80 pointer-events-auto">
        {/* Citizen View Mode Button */}
        <button
          onClick={onOpenCitizenMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
          title="Plain-language Citizen & Community View"
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Citizen View</span>
        </button>

        {/* Alert Notifications */}
        <button
          onClick={onOpenAlerts}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Active Civil Defense Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Language selector */}
        <button
          className="px-2 h-8 flex items-center gap-1 rounded-lg hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          title="Interface Language"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>EN</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5"></div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">
            GK
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-xs font-semibold text-slate-900">DDMA Gangtok</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Operations</span>
          </div>
        </div>
      </div>
    </header>
  );
}
