'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [currentZoom, setCurrentZoom] = useState<number>(zoom || 11);

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

    // Listen to zoom changes for zoom-dependent detail rendering
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;
    mapRefCallback?.(map);

    const featureGroup = L.featureGroup().addTo(map);
    featureGroupRef.current = featureGroup;

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
    setCurrentZoom(zoom);
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
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
      attribution = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, USGS';
    } else if (basemap === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN';
    } else {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
    }

    const tileLayer = L.tileLayer(url, {
      maxZoom,
      attribution,
      subdomains: 'abc',
    }).addTo(mapInstanceRef.current);

    tileLayer.on('tileerror', () => {
      if (tileLayerRef.current && mapInstanceRef.current) {
        tileLayerRef.current.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
      }
    });

    tileLayerRef.current = tileLayer;
  }, [basemap]);

  // Render Polygons, Corridors, and Markers with Spatial Hierarchy & Collision Handling
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = featureGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. MODELLED RISK ZONE POLYGONS (High Priority Ground Truth)
    if (layers.riskZones) {
      riskZones.forEach((zone) => {
        const isSelected = selectedZone?.id === zone.id;
        const colorMeta = RISK_COLORS[zone.riskLevel] || RISK_COLORS.HIGH;
        const latLngs = zone.polygon.map((p) => [p.lat, p.lng] as [number, number]);

        const polygon = L.polygon(latLngs, {
          color: isSelected ? '#0F172A' : colorMeta.strokeHex,
          weight: isSelected ? 3.5 : 2,
          opacity: isSelected ? 1 : 0.85,
          fillColor: colorMeta.fillHex,
          fillOpacity: isSelected ? 0.45 : colorMeta.fillOpacity,
          interactive: true,
          className: 'cursor-pointer transition-all',
        });

        // ONE CLICK = ONE PRIMARY CONTEXT
        polygon.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stop(e);
          onSelectZone(zone);
        });

        polygon.bindTooltip(
          `<div class="font-sans px-2.5 py-1 text-xs font-semibold text-slate-900 leading-tight">
            <span class="inline-block w-2 h-2 rounded-full ${colorMeta.dotClass} mr-1.5"></span>
            ${zone.name} • ${zone.riskScore}% ${zone.riskLevel.replace('_', ' ')}
          </div>`,
          { sticky: true, className: 'pravaah-map-tooltip' }
        );

        polygon.addTo(group);

        // Centroid Pill Badge (Compact, non-overlapping label)
        const shortName = zone.name.split(' - ')[1] || zone.name;
        const zoneBadgeIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="cursor-pointer select-none hover:scale-105 transition-transform">
              <div class="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md border ${
                isSelected ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-slate-200/90'
              }">
                <span class="w-2 h-2 rounded-full ${colorMeta.dotClass}"></span>
                <span class="text-xs font-bold text-slate-800 whitespace-nowrap">${shortName}</span>
                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded border ${colorMeta.badgeClass}">
                  ${zone.riskScore}%
                </span>
              </div>
            </div>
          `,
          iconSize: [170, 28],
          iconAnchor: [85, 14],
        });

        const centroidMarker = L.marker([zone.center.lat, zone.center.lng], {
          icon: zoneBadgeIcon,
          interactive: true,
        });

        centroidMarker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stop(e);
          onSelectZone(zone);
        });

        centroidMarker.addTo(group);
      });
    }

    // 2. ROAD CORRIDORS & HIGHWAY BLOCKADES
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
            `<div class="font-sans px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Operational Bypass: ${corridor.name}</div>`,
            { sticky: true, className: 'pravaah-map-tooltip' }
          );
          polyline.addTo(group);
        } else {
          // Main corridor line
          const polyline = L.polyline(coords, {
            color: '#64748B',
            weight: 3.5,
            opacity: 0.75,
            interactive: true,
          });
          polyline.bindTooltip(
            `<div class="font-sans px-2 py-0.5 text-[11px] font-semibold text-slate-800">${corridor.name}</div>`,
            { sticky: true, className: 'pravaah-map-tooltip' }
          );
          polyline.addTo(group);
        }

        // Highlight Blockade if present (High Priority Incident: NH-10 Km 44)
        if (corridor.blockade) {
          const blockadeSite = [27.2345, 88.4980] as [number, number];

          const blockadeIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="cursor-pointer select-none hover:scale-105 transition-transform">
                <div class="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-md border-2 border-rose-500">
                  <span class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                  </span>
                  <span class="text-xs font-black text-rose-700 whitespace-nowrap">
                    ${corridor.code} · ${corridor.blockade.chainageKm} Blocked
                  </span>
                </div>
              </div>
            `,
            iconSize: [180, 30],
            iconAnchor: [90, 15],
          });

          const blockadeMarker = L.marker(blockadeSite, { icon: blockadeIcon, interactive: true });
          blockadeMarker.bindTooltip(
            `<div class="font-sans p-1 text-xs">
              <div class="font-bold text-rose-700">${corridor.code} · ${corridor.blockade.chainageKm} Blockade</div>
              <div class="text-slate-600 text-[11px]">${corridor.blockade.cause}</div>
              <div class="text-slate-500 text-[10px]">Estimated clearance: ${corridor.blockade.estimatedClearanceHours}h</div>
            </div>`,
            { sticky: true, className: 'pravaah-map-tooltip' }
          );

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

    // 3. FIELD REPORT EVIDENCE (Zoom-Aware & Clean Circular Iconography)
    // Filter out internal QA/PyTest development artifacts
    if (layers.fieldReports) {
      const cleanReports = fieldReports.filter((r) => {
        const title = (r.title || '').toLowerCase();
        const reporter = (r.reporter?.name || '').toLowerCase();
        return !title.includes('pytest') && !title.includes('test tension') && !reporter.includes('qa engineer');
      });

      // At zoom < 10.5, suppress detailed evidence markers to prevent regional clutter
      if (currentZoom >= 10.5) {
        cleanReports.forEach((report) => {
          const isHighUrgency = report.urgency === 'HIGH' || report.severity === 'CRITICAL';
          const humanType = report.incidentType
            ? report.incidentType.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
            : 'Hazard Observation';
          const cleanTitle = report.title.replace(/^PyTest\s+/i, '').replace(/^Test\s+/i, '');

          // Compact 26px circular pin: camera icon + urgency dot
          const reportIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="cursor-pointer select-none hover:scale-115 transition-transform">
                <div class="w-6.5 h-6.5 rounded-full bg-white shadow-md border-2 ${
                  isHighUrgency ? 'border-amber-500 text-amber-600' : 'border-sky-500 text-sky-600'
                } flex items-center justify-center">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                    <circle cx="12" cy="13" r="3"/>
                  </svg>
                </div>
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          const marker = L.marker([report.coordinates.lat, report.coordinates.lng], {
            icon: reportIcon,
            interactive: true,
          });

          marker.bindTooltip(
            `<div class="font-sans p-1 text-xs">
              <div class="font-bold text-slate-900 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${isHighUrgency ? 'bg-amber-500' : 'bg-sky-500'}"></span>
                Field Evidence · ${humanType}
              </div>
              <div class="text-slate-600 text-[11px] mt-0.5">${cleanTitle}</div>
              <div class="text-slate-400 text-[10px]">${report.locationName || report.district}</div>
            </div>`,
            { direction: 'top', offset: [0, -12], className: 'pravaah-map-tooltip' }
          );

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
    }

    // 4. CRITICAL INFRASTRUCTURE (Zoom-Aware & Dedicated Facility Icons)
    if (layers.infrastructure) {
      // At zoom < 11, suppress infrastructure pins to keep regional view clean
      if (currentZoom >= 11) {
        infrastructure.forEach((infra) => {
          const isAlert = infra.operationalStatus === 'STANDBY_ALERT';

          const infraIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="cursor-pointer select-none hover:scale-115 transition-transform">
                <div class="w-6 h-6 rounded-full bg-white shadow-sm border-2 ${
                  isAlert ? 'border-amber-500 text-amber-600' : 'border-sky-500 text-sky-600'
                } flex items-center justify-center">
                  ${
                    infra.type === 'HOSPITAL'
                      ? '<span class="text-xs font-black text-rose-600 leading-none">+</span>'
                      : infra.type === 'HYDRO_DAM'
                      ? '<svg class="w-3 h-3 text-sky-600" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
                      : '<svg class="w-3 h-3 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19h16M4 15h16M4 11h16M4 7h16"/></svg>'
                  }
                </div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const marker = L.marker([infra.coordinates.lat, infra.coordinates.lng], {
            icon: infraIcon,
            interactive: true,
          });

          marker.bindTooltip(
            `<div class="font-sans p-1 text-xs">
              <div class="font-bold text-slate-900">${infra.name}</div>
              <div class="text-slate-500 text-[11px]">${infra.operationalStatus.replace('_', ' ')} · ${infra.notes}</div>
            </div>`,
            { direction: 'top', offset: [0, -12], className: 'pravaah-map-tooltip' }
          );

          marker.addTo(group);
        });
      }
    }

    // 5. ACTIVE ROUTE / DETOUR OVERLAYS (When safeRoutes enabled)
    if (activeRoutePlan && layers.safeRoutes !== false) {
      // 5a. Primary blocked path (dashed rose/red line)
      if (activeRoutePlan.primaryRoute?.path && activeRoutePlan.primaryRoute.path.length > 1) {
        const primCoords = activeRoutePlan.primaryRoute.path.map((p: any) => [p.lat, p.lng] as [number, number]);
        const primLine = L.polyline(primCoords, {
          color: '#EF4444',
          weight: 4,
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
  }, [
    layers,
    riskZones,
    roadCorridors,
    fieldReports,
    infrastructure,
    selectedZone,
    activeRoutePlan,
    currentZoom,
  ]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
