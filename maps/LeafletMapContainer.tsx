'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RiskZone } from '@/types/riskZone';
import { RoadCorridor } from '@/types/roadStatus';
import { FieldReport } from '@/types/fieldReport';
import { Infrastructure } from '@/types/infrastructure';
import { BasemapMode, ActiveLayers } from './MapControls';
import { RISK_COLORS } from '@/lib/colors';

interface LeafletMapContainerProps {
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
  mapRefCallback?: (mapInstance: L.Map | null) => void;
  activeRoutePlan?: any;
}

export default function LeafletMapContainer({
  center,
  zoom,
  basemap,
  layers,
  riskZones,
  roadCorridors,
  fieldReports,
  infrastructure,
  selectedZone,
  onSelectZone,
  onSelectBlockade,
  onSelectFieldReport,
  onMapClick,
  mapRefCallback,
  activeRoutePlan,
}: LeafletMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapInstanceRef.current) return;

    // Strict East Sikkim initial center
    const initialLat = center.lat || 27.2600;
    const initialLng = center.lng || 88.5400;
    const initialZoom = zoom || 11;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
      renderer: L.canvas ? L.canvas() : L.svg(),
    });

    // Handle map click: only deselect if truly clicking the background canvas
    map.on('click', (e: L.LeafletMouseEvent) => {
      const origTarget = e.originalEvent?.target as HTMLElement;
      if (origTarget && (origTarget.closest('.leaflet-interactive') || origTarget.tagName === 'path')) {
        return;
      }
      onMapClick?.();
    });

    mapInstanceRef.current = map;
    mapRefCallback?.(map);

    const featureGroup = L.featureGroup().addTo(map);
    featureGroupRef.current = featureGroup;

    // Fix: invalidateSize ensures tiles and coordinates are not shifted to Nepal/Bihar
    const fixLayout = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.setView([initialLat, initialLng], initialZoom, { animate: false });
      }
    };

    requestAnimationFrame(fixLayout);
    const t1 = setTimeout(fixLayout, 100);
    const t2 = setTimeout(fixLayout, 350);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
      mapRefCallback?.(null);
    };
  }, []);

  // Update Center / Zoom when props change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.invalidateSize();
    mapInstanceRef.current.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center.lat, center.lng, zoom]);

  // Update Basemap Tiles
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    let maxZoom = 19;
    let attribution = 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS';

    if (basemap === 'terrain') {
      // High-resolution world topographic relief & contours (reliable GIS standard)
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
      attribution = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, USGS';
    } else if (basemap === 'satellite') {
      // High-resolution world satellite imagery
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN';
    } else {
      // Clean, zero-watermark Street GIS basemap
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
    }

    const tileLayer = L.tileLayer(url, {
      maxZoom,
      attribution,
      subdomains: 'abc',
    }).addTo(mapInstanceRef.current);

    // Auto-fallback to OpenStreetMap if tile server experiences network failure
    tileLayer.on('tileerror', () => {
      if (tileLayerRef.current && mapInstanceRef.current) {
        tileLayerRef.current.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
      }
    });

    tileLayerRef.current = tileLayer;
  }, [basemap]);

  // Render Polygons, Corridors, and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = featureGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. RISK ZONE POLYGONS
    if (layers.riskZones) {
      riskZones.forEach((zone) => {
        const isSelected = selectedZone?.id === zone.id;
        const colorMeta = RISK_COLORS[zone.riskLevel];
        const latLngs = zone.polygon.map((p) => [p.lat, p.lng] as [number, number]);

        const polygon = L.polygon(latLngs, {
          color: isSelected ? '#0F172A' : colorMeta.strokeHex,
          weight: isSelected ? 3.5 : 2,
          opacity: isSelected ? 1 : 0.85,
          fillColor: colorMeta.fillHex,
          fillOpacity: isSelected ? 0.4 : colorMeta.fillOpacity,
          interactive: true,
          className: 'cursor-pointer transition-all',
        });

        // Use L.DomEvent.stop to prevent map click from immediately deselecting
        polygon.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stop(e);
          onSelectZone(zone);
        });

        polygon.bindTooltip(
          `<div class="font-sans px-2.5 py-1 text-xs font-semibold text-slate-900 leading-tight">
            <span class="inline-block w-2 h-2 rounded-full ${colorMeta.dotClass} mr-1.5"></span>
            ${zone.name} • ${zone.riskScore}% ${zone.riskLevel}
          </div>`,
          { sticky: true, className: 'pravaah-map-tooltip' }
        );

        polygon.addTo(group);
      });
    }

    // 2. ROAD CORRIDORS & BLOCKADES
    if (layers.roadCorridors) {
      roadCorridors.forEach((corridor) => {
        const coords = corridor.path.map((p) => [p.lat, p.lng] as [number, number]);

        if (corridor.isBypass) {
          // Bypass dashed line
          const polyline = L.polyline(coords, {
            color: '#10B981',
            weight: 3.5,
            dashArray: '6, 6',
            opacity: 0.9,
            interactive: true,
          });
          polyline.bindTooltip(
            `<div class="font-sans px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Bypass: ${corridor.name}</div>`,
            { sticky: true, className: 'pravaah-map-tooltip' }
          );
          polyline.addTo(group);
        } else {
          // Main corridor
          const polyline = L.polyline(coords, {
            color: '#64748B',
            weight: 4,
            opacity: 0.75,
            interactive: true,
          });
          polyline.bindTooltip(
            `<div class="font-sans px-2 py-0.5 text-[11px] font-semibold text-slate-800">${corridor.name}</div>`,
            { sticky: true, className: 'pravaah-map-tooltip' }
          );
          polyline.addTo(group);
        }

        // Highlight Blockade if present (NH-10 Km 44)
        if (corridor.blockade) {
          const blockadeSite = [27.2345, 88.4980] as [number, number];

          const blockadeIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="relative cursor-pointer select-none">
                <div class="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-rose-200 hover:scale-105 transition-transform">
                  <span class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                  </span>
                  <span class="text-xs font-bold text-slate-900">${corridor.code} ${corridor.blockade.chainageKm} Blocked</span>
                  <span class="text-[11px] text-slate-500 font-medium">${corridor.blockade.debrisFlowLengthMeters}m debris</span>
                </div>
              </div>
            `,
            iconSize: [210, 36],
            iconAnchor: [105, 18],
          });

          const blockadeMarker = L.marker(blockadeSite, { icon: blockadeIcon, interactive: true });
          blockadeMarker.on('click', (e: L.LeafletMouseEvent) => {
            L.DomEvent.stop(e);
            onSelectBlockade?.(corridor);
            const eastSikkim = riskZones.find((z) => z.id === 'zone-east-sikkim');
            if (eastSikkim) onSelectZone(eastSikkim);
          });
          blockadeMarker.addTo(group);
        }
      });
    }

    // 3. FIELD REPORT MARKERS
    if (layers.fieldReports) {
      fieldReports.forEach((report) => {
        const reportIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="cursor-pointer select-none hover:scale-105 transition-transform">
              <div class="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-slate-200 text-xs font-medium text-slate-700">
                <span class="w-2 h-2 rounded-full ${report.urgency === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'}"></span>
                <span>${report.title.split(' ')[0]} ${report.incidentType}</span>
              </div>
            </div>
          `,
          iconSize: [160, 30],
          iconAnchor: [80, 15],
        });

        const marker = L.marker([report.coordinates.lat, report.coordinates.lng], {
          icon: reportIcon,
          interactive: true,
        });

        marker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stop(e);
          onSelectFieldReport?.(report);
          const matchedZone = riskZones.find(
            (z) => z.district.toLowerCase() === report.district.toLowerCase()
          );
          if (matchedZone) onSelectZone(matchedZone);
        });
        marker.addTo(group);
      });
    }

    // 4. INFRASTRUCTURE ASSETS
    if (layers.infrastructure) {
      infrastructure.forEach((infra) => {
        const infraIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="cursor-pointer select-none hover:scale-105 transition-transform">
              <div class="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-xs border border-sky-200 text-[11px] font-medium text-slate-700">
                <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                <span class="truncate max-w-[130px]">${infra.name}</span>
              </div>
            </div>
          `,
          iconSize: [140, 24],
          iconAnchor: [70, 12],
        });

        const marker = L.marker([infra.coordinates.lat, infra.coordinates.lng], {
          icon: infraIcon,
          interactive: true,
        });

        marker.bindTooltip(
          `<div class="font-sans p-1 text-xs">
            <div class="font-bold text-slate-900">${infra.name}</div>
            <div class="text-slate-500 text-[11px]">${infra.notes}</div>
          </div>`,
          { sticky: true, className: 'pravaah-map-tooltip' }
        );
        marker.addTo(group);
      });
    }

    // 5. ACTIVE ROUTE / DETOUR OVERLAYS
    if (activeRoutePlan) {
      // 5a. Primary blocked path (dashed rose/red line)
      if (activeRoutePlan.primaryRoute?.path && activeRoutePlan.primaryRoute.path.length > 1) {
        const primCoords = activeRoutePlan.primaryRoute.path.map((p: any) => [p.lat, p.lng] as [number, number]);
        const primLine = L.polyline(primCoords, {
          color: '#EF4444',
          weight: 4.5,
          dashArray: '6, 8',
          opacity: 0.85,
          interactive: true,
        });
        primLine.bindTooltip(
          `<div class="font-sans px-2 py-1 text-xs">
            <div class="font-bold text-rose-700">${activeRoutePlan.primaryRoute.name || 'Primary Corridor'} (IMPASSABLE)</div>
            <div class="text-slate-600 text-[11px]">${activeRoutePlan.primaryRoute.distanceKm} km · Blocked at Km 44</div>
          </div>`,
          { sticky: true, className: 'pravaah-map-tooltip' }
        );
        primLine.addTo(group);
      }

      // 5b. Alternative detour path (solid emerald green line with outer glow)
      if (activeRoutePlan.alternativeRoute?.path && activeRoutePlan.alternativeRoute.path.length > 1) {
        const altCoords = activeRoutePlan.alternativeRoute.path.map((p: any) => [p.lat, p.lng] as [number, number]);

        // Glow
        const glowLine = L.polyline(altCoords, {
          color: '#10B981',
          weight: 9,
          opacity: 0.35,
          interactive: false,
        });
        glowLine.addTo(group);

        // Solid core
        const detourLine = L.polyline(altCoords, {
          color: '#059669',
          weight: 5,
          opacity: 0.95,
          interactive: true,
        });
        detourLine.bindTooltip(
          `<div class="font-sans px-2 py-1 text-xs">
            <div class="font-bold text-emerald-700">${activeRoutePlan.alternativeRoute.name || 'Safe Detour Corridor'}</div>
            <div class="text-slate-600 text-[11px]">${activeRoutePlan.alternativeRoute.distanceKm} km · Active Safe Bypass (+${activeRoutePlan.alternativeRoute.distanceDeltaKm || 43} km)</div>
          </div>`,
          { sticky: true, className: 'pravaah-map-tooltip' }
        );
        detourLine.addTo(group);

        // Waypoint markers along detour
        activeRoutePlan.alternativeRoute.path.forEach((pt: any, idx: number) => {
          if (idx === 0 || idx === activeRoutePlan.alternativeRoute.path.length - 1) return;
          const wpIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
            `,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });
          L.marker([pt.lat, pt.lng], { icon: wpIcon, interactive: false }).addTo(group);
        });

        // Fit map bounds to encompass the full alternative corridor
        if (mapInstanceRef.current && altCoords.length > 0) {
          mapInstanceRef.current.fitBounds(altCoords, { padding: [80, 80], maxZoom: 12 });
        }
      }
    }
  }, [layers, riskZones, roadCorridors, fieldReports, infrastructure, selectedZone, activeRoutePlan]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
