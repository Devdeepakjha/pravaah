'use client';

import React, { useState } from 'react';
import { Plus, Minus, LocateFixed, Layers, Check } from 'lucide-react';

export type BasemapMode = 'terrain' | 'satellite' | 'roadmap';

export interface ActiveLayers {
  riskZones: boolean;
  roadCorridors: boolean;
  infrastructure: boolean;
  fieldReports: boolean;
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-floating border text-xs font-medium transition-all ${
              showLayerMenu
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/80 hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layers</span>
          </button>

          {/* Layers Popover Menu */}
          {showLayerMenu && (
            <div className="absolute bottom-full mb-2 left-0 w-56 bg-white/98 backdrop-blur-md rounded-xl shadow-panel border border-slate-200/90 p-2 space-y-1 z-50 text-xs pointer-events-auto">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Geospatial Layers
              </div>

              <button
                onClick={() => onToggleLayer('riskZones')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Risk Zone Polygons</span>
                </div>
                {layers.riskZones && <Check className="w-3.5 h-3.5 text-slate-900" />}
              </button>

              <button
                onClick={() => onToggleLayer('roadCorridors')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-slate-700 rounded"></span>
                  <span>Roads & Corridors</span>
                </div>
                {layers.roadCorridors && <Check className="w-3.5 h-3.5 text-slate-900" />}
              </button>

              <button
                onClick={() => onToggleLayer('fieldReports')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Field Inspections</span>
                </div>
                {layers.fieldReports && <Check className="w-3.5 h-3.5 text-slate-900" />}
              </button>

              <button
                onClick={() => onToggleLayer('infrastructure')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 text-left transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                  <span>Lifeline Assets</span>
                </div>
                {layers.infrastructure && <Check className="w-3.5 h-3.5 text-slate-900" />}
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
