'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { RiskZone } from '@/types/riskZone';
import { RoadCorridor } from '@/types/roadStatus';
import { FieldReport } from '@/types/fieldReport';
import { Infrastructure } from '@/types/infrastructure';
import { BasemapMode, ActiveLayers } from './MapControls';
import { PRAVAAH_GIS_MAP_STYLE } from './mapStyles';
import { RISK_COLORS } from '@/lib/colors';
import LeafletMapContainer from './LeafletMapContainer';

interface GoogleMapContainerProps {
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
  mapRefCallback?: (instance: any) => void;
  activeRoutePlan?: any;
}

export default function GoogleMapContainer(props: GoogleMapContainerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(false);
  const [useFallback, setUseFallback] = useState<boolean>(!apiKey);

  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Initialize Google Maps if API key is provided
  useEffect(() => {
    if (!apiKey) {
      setUseFallback(true);
      return;
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    loader
      .load()
      .then((google) => {
        if (!containerRef.current) return;

        const map = new google.maps.Map(containerRef.current, {
          center: props.center,
          zoom: props.zoom,
          disableDefaultUI: true,
          styles: PRAVAAH_GIS_MAP_STYLE,
          mapTypeId:
            props.basemap === 'satellite'
              ? 'hybrid'
              : props.basemap === 'terrain'
              ? 'terrain'
              : 'roadmap',
        });

        map.addListener('click', () => {
          props.onMapClick?.();
        });

        mapRef.current = map;
        setGoogleMapsLoaded(true);

        // Bind control hooks
        props.onZoomInRef?.(() => {
          if (mapRef.current) mapRef.current.setZoom((mapRef.current.getZoom() || 11) + 1);
        });
        props.onZoomOutRef?.(() => {
          if (mapRef.current) mapRef.current.setZoom((mapRef.current.getZoom() || 11) - 1);
        });
        props.onRecenterRef?.(() => {
          if (mapRef.current) {
            mapRef.current.setCenter(props.center);
            mapRef.current.setZoom(props.zoom);
          }
        });
      })
      .catch((err) => {
        console.warn('[PRAVAAH Map] Google Maps API load failed. Falling back to Leaflet GIS.', err);
        setUseFallback(true);
      });
  }, [apiKey]);

  // Update Google Maps basemap type
  useEffect(() => {
    if (!mapRef.current || !googleMapsLoaded) return;
    if (props.basemap === 'satellite') {
      mapRef.current.setMapTypeId('hybrid');
    } else if (props.basemap === 'terrain') {
      mapRef.current.setMapTypeId('terrain');
    } else {
      mapRef.current.setMapTypeId('roadmap');
    }
  }, [props.basemap, googleMapsLoaded]);

  // Render Google Maps overlays
  useEffect(() => {
    if (!mapRef.current || !googleMapsLoaded || typeof google === 'undefined') return;
    const map = mapRef.current;

    // Clear previous
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 1. RISK ZONES
    if (props.layers.riskZones) {
      props.riskZones.forEach((zone) => {
        const isSelected = props.selectedZone?.id === zone.id;
        const color = RISK_COLORS[zone.riskLevel];

        const polygon = new google.maps.Polygon({
          paths: zone.polygon,
          strokeColor: isSelected ? '#0F172A' : color.strokeHex,
          strokeOpacity: 0.9,
          strokeWeight: isSelected ? 3 : 2,
          fillColor: color.fillHex,
          fillOpacity: isSelected ? 0.35 : color.fillOpacity,
          map: map,
        });

        polygon.addListener('click', () => {
          props.onSelectZone(zone);
        });

        polygonsRef.current.push(polygon);
      });
    }

    // 2. CORRIDORS
    if (props.layers.roadCorridors) {
      props.roadCorridors.forEach((corridor) => {
        const line = new google.maps.Polyline({
          path: corridor.path,
          strokeColor: corridor.isBypass ? '#10B981' : '#64748B',
          strokeOpacity: 0.8,
          strokeWeight: corridor.isBypass ? 3.5 : 4,
          map: map,
        });
        polylinesRef.current.push(line);

        if (corridor.blockade) {
          const marker = new google.maps.Marker({
            position: { lat: 27.2345, lng: 88.4980 },
            map: map,
            title: `${corridor.code} Km 44 Blocked`,
          });
          marker.addListener('click', () => {
            props.onSelectBlockade?.(corridor);
            const eastSikkim = props.riskZones.find((z) => z.id === 'zone-east-sikkim');
            if (eastSikkim) props.onSelectZone(eastSikkim);
          });
          markersRef.current.push(marker);
        }
      });
    }
  }, [
    googleMapsLoaded,
    props.layers,
    props.riskZones,
    props.roadCorridors,
    props.selectedZone,
  ]);

  // If no Google Maps API key or fallback requested, use the high-performance Leaflet GIS engine
  if (useFallback) {
    return <LeafletMapContainer {...props} />;
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
