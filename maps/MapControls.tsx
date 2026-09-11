'use client';

import React, { useState } from 'react';
import { Plus, Minus, LocateFixed, Layers, Check } from 'lucide-react';

export type BasemapMode = 'terrain' | 'satellite' | 'roadmap';

export interface ActiveLayers {
  riskZones: boolean;
  roadCorridors: boolean;
  infrastructure: boolean;
  fieldReports: boolean;
  safeRoutes?: boolean;
}

interface MapControlsProps {
  basemap: BasemapMode;
  onBasemapChange: (mode: BasemapMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  layers: ActiveLayers;
  onToggleLayer: (layerKey: keyof ActiveLayers) => void;
}

export function MapControls({
  basemap,
  onBasemapChange,
  onZoomIn,
  onZoomOut,
  onRecenter,
  layers,
  onToggleLayer,
}: MapControlsProps) {
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  return (
    <>
      {/* Bottom-Left Controls Row: Basemap Switcher & Layer Menu */}
      <div className="flex items-center gap-2.5 pointer-events-auto select-none">
        {/* Basemap Switcher */}
        <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-floating border border-slate-200/80 text-xs font-medium">
          <button
            onClick={() => onBasemapChange('terrain')}
            className={`px-3 py-1 rounded-lg transition-all ${
              basemap === 'terrain'
                ? 'bg-slate-900 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Terrain
          </button>
          <button
            onClick={() => onBasemapChange('satellite')}
            className={`px-3 py-1 rounded-lg transition-all ${
              basemap === 'satellite'
                ? 'bg-slate-900 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => onBasemapChange('roadmap')}
            className={`px-3 py-1 rounded-lg transition-all ${
              basemap === 'roadmap'
                ? 'bg-slate-900 text-white font-semibold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            GIS Default
          </button>
        </div>

        {/* Layers Dropdown Button */}
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-floating border text-xs font-medium transition-all cursor-pointer ${
              showLayerMenu
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/80 hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Map Layers</span>
          </button>

          {/* Layers Popover Menu with Explanatory Descriptions */}
          {showLayerMenu && (
            <div className="absolute bottom-full mb-2 left-0 w-72 bg-white/98 backdrop-blur-md rounded-2xl shadow-panel border border-slate-200/90 p-3 space-y-2 z-50 text-xs pointer-events-auto animate-in fade-in duration-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  Map Layers
                </span>
                <span className="text-[10px] text-slate-400 font-medium">What am I seeing?</span>
              </div>

              {/* 1. Landslide Risk */}
              <button
                onClick={() => onToggleLayer('riskZones')}
                className="w-full flex items-start justify-between p-2 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-200"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-slate-950">Landslide Risk</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      AI-estimated slope failure risk by monitored area.
                    </div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  layers.riskZones ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'
                }`}>
                  {layers.riskZones && <Check className="w-3 h-3" />}
                </div>
              </button>

              {/* 2. Field Reports */}
              <button
                onClick={() => onToggleLayer('fieldReports')}
                className="w-full flex items-start justify-between p-2 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-200"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-slate-950">Field Reports</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      Geo-tagged ground observations submitted by field teams.
                    </div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  layers.fieldReports ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'
                }`}>
                  {layers.fieldReports && <Check className="w-3 h-3" />}
                </div>
              </button>

              {/* 3. Road Status */}
              <button
                onClick={() => onToggleLayer('roadCorridors')}
                className="w-full flex items-start justify-between p-2 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-200"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-3 h-1.5 bg-slate-700 rounded shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-slate-950">Road Status</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      Known blockages and operational corridors.
                    </div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  layers.roadCorridors ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'
                }`}>
                  {layers.roadCorridors && <Check className="w-3 h-3" />}
                </div>
              </button>

              {/* 4. Critical Infrastructure */}
              <button
                onClick={() => onToggleLayer('infrastructure')}
                className="w-full flex items-start justify-between p-2 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-200"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-slate-950">Critical Infrastructure</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      Hospitals, bridges and other lifelines near risk zones.
                    </div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  layers.infrastructure ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'
                }`}>
                  {layers.infrastructure && <Check className="w-3 h-3" />}
                </div>
              </button>

              {/* 5. Safe Routes */}
              <button
                onClick={() => onToggleLayer('safeRoutes')}
                className="w-full flex items-start justify-between p-2 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group border border-transparent hover:border-slate-200"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-3 h-1.5 bg-emerald-500 rounded shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-slate-950">Safe Routes</div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      Available alternate routes when a corridor is blocked.
                    </div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                  layers.safeRoutes !== false ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'
                }`}>
                  {layers.safeRoutes !== false && <Check className="w-3 h-3" />}
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Navigation/Zoom Controls (positioned left of drawer) */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-xl shadow-floating border border-slate-200/80 overflow-hidden">
          <button
            onClick={onZoomIn}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-b border-slate-100 transition-colors"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomOut}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onRecenter}
          className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-xl shadow-floating border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Re-center View to East Sikkim / Teesta Basin"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
