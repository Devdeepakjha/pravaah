'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { RiskZone } from '@/types/riskZone';
import { RoadCorridor } from '@/types/roadStatus';
import { FieldReport } from '@/types/fieldReport';
import { Infrastructure } from '@/types/infrastructure';
import { BasemapMode, ActiveLayers } from './MapControls';

const DynamicMap = dynamic(() => import('./GoogleMapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
        <span className="text-xs font-medium tracking-wide">Initializing GIS Map Engine...</span>
      </div>
    </div>
  ),
});

export interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  basemap: BasemapMode;
  layers: ActiveLayers;
  riskZones: RiskZone[];
  roadCorridors: RoadCorridor[];
  fieldReports: FieldReport[];
  infrastructure: Infrastructure[];
  selectedZone: RiskZone | null;
  onSelectZone: (zone: RiskZone) => void;
  onSelectBlockade?: (corridor: RoadCorridor) => void;
  onSelectFieldReport?: (report: FieldReport) => void;
  onMapClick?: () => void;
  onZoomInRef?: (fn: () => void) => void;
  onZoomOutRef?: (fn: () => void) => void;
  onRecenterRef?: (fn: () => void) => void;
  mapRefCallback?: (mapInstance: any) => void;
}

export function Map(props: MapProps) {
  return <DynamicMap {...props} />;
}
