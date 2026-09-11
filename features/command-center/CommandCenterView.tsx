'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import { Map } from '@/maps/Map';
import { Header } from '@/components/layout/Header';
import { NavigationDock, NavigationTab } from '@/components/layout/NavigationDock';
import { MapControls, BasemapMode, ActiveLayers } from '@/maps/MapControls';
import { RiskLegend } from '@/maps/RiskLegend';
import { ZoneDrawer } from './ZoneDrawer';
import { AlertsModal } from '@/features/alerts/AlertsModal';
import { SettingsModal } from './SettingsModal';
import { CitizenViewModal } from '@/features/citizen/CitizenViewModal';
import { ResponsePrioritiesModal } from '@/features/response/ResponsePrioritiesModal';
import { FieldReportModal } from '@/features/field-reports/FieldReportModal';

import { RiskZone } from '@/types/riskZone';
import { RoadCorridor } from '@/types/roadStatus';
import { FieldReport } from '@/types/fieldReport';
import { Infrastructure } from '@/types/infrastructure';
import { Alert, SituationOverview } from '@/types/alert';

import { getRiskZones } from '@/services/riskZoneService';
import { getRoadCorridors, calculateAlternativeRoute } from '@/services/roadStatusService';
import { getFieldReports } from '@/services/fieldReportService';
import { getInfrastructure } from '@/services/infrastructureService';
import { getActiveAlerts, getSituationOverview } from '@/services/alertService';
import { deriveMonitoredLocations, getCriticalLocations, getAttentionLocations } from '@/services/monitoredLocationService';
import { OperationalTriageModal } from '@/components/layout/OperationalTriageModal';
import { MonitoredLocation } from '@/types/monitoredLocation';
import { SIKKIM_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/geo';
import { CheckCircle2, ShieldAlert, X, Navigation } from 'lucide-react';

export function CommandCenterView() {
  // Data states
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [roadCorridors, setRoadCorridors] = useState<RoadCorridor[]>([]);
  const [fieldReports, setFieldReports] = useState<FieldReport[]>([]);
  const [infrastructure, setInfrastructure] = useState<Infrastructure[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [situation, setSituation] = useState<SituationOverview | null>(null);

  // Interaction states
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<NavigationTab>('map');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [triageMode, setTriageMode] = useState<'critical' | 'attention' | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCitizenModeOpen, setIsCitizenModeOpen] = useState(false);
  const [isPrioritiesOpen, setIsPrioritiesOpen] = useState(false);
  const [isFieldReportOpen, setIsFieldReportOpen] = useState(false);
  const [activeRoutePlan, setActiveRoutePlan] = useState<any | null>(null);

  // Derive canonical monitored locations & triage sets
  const monitoredLocations = React.useMemo(() => {
    return deriveMonitoredLocations(riskZones, roadCorridors, fieldReports, infrastructure);
  }, [riskZones, roadCorridors, fieldReports, infrastructure]);

  const criticalLocations = React.useMemo(() => {
    return getCriticalLocations(monitoredLocations);
  }, [monitoredLocations]);

  const attentionLocations = React.useMemo(() => {
    return getAttentionLocations(monitoredLocations);
  }, [monitoredLocations]);

  // Dispatched protocols tracking
  const [dispatchedProtocols, setDispatchedProtocols] = useState<Record<string, boolean>>({});
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);

  // Map reference & controls states
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [basemap, setBasemap] = useState<BasemapMode>('terrain');
  const [center, setCenter] = useState<{ lat: number; lng: number }>(SIKKIM_CENTER);
  const [zoom, setZoom] = useState<number>(DEFAULT_MAP_ZOOM);
  const [layers, setLayers] = useState<ActiveLayers>({
    riskZones: true,
    roadCorridors: true,
    infrastructure: true,
    fieldReports: true,
  });

  // Load initial data
  useEffect(() => {
    async function loadData() {
      const [zonesData, roadsData, reportsData, infraData, alertsData, sitData] =
        await Promise.all([
          getRiskZones(),
          getRoadCorridors(),
          getFieldReports(),
          getInfrastructure(),
          getActiveAlerts(),
          getSituationOverview(),
        ]);

      setRiskZones(zonesData);
      setRoadCorridors(roadsData);
      setFieldReports(reportsData);
      setInfrastructure(infraData);
      setAlerts(alertsData);
      setSituation(sitData);

      // Focus on East Sikkim / Teesta Basin on initial load
      const defaultZone = zonesData.find((z) => z.id === 'zone-east-sikkim') || zonesData[0];
      if (defaultZone) {
        setSelectedZone(defaultZone);
        setCenter({ lat: 27.2600, lng: 88.5400 });
      }
    }
    loadData();
  }, []);

  // Handlers
  const handleSelectZone = useCallback((zone: RiskZone) => {
    setSelectedZone(zone);
    setCenter(zone.center);
    setZoom(11.5);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([zone.center.lat, zone.center.lng], 11.5, { duration: 0.8 });
    }
  }, []);

  const handleDeselectZone = useCallback(() => {
    setSelectedZone(null);
  }, []);

  const handleToggleLayer = useCallback((layerKey: keyof ActiveLayers) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    } else {
      setZoom((prev) => Math.min(prev + 1, 18));
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    } else {
      setZoom((prev) => Math.max(prev - 1, 6));
    }
  }, []);

  const handleRecenter = useCallback(() => {
    const target = { lat: 27.2600, lng: 88.5400 };
    setCenter(target);
    setZoom(DEFAULT_MAP_ZOOM);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], DEFAULT_MAP_ZOOM, { duration: 0.8 });
    }
  }, []);

  const handleSelectLocation = useCallback(
    (coords: { lat: number; lng: number }) => {
      setCenter(coords);
      setZoom(12);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([coords.lat, coords.lng], 12, { duration: 0.8 });
      }
    },
    []
  );

  const handleDispatchProtocol = useCallback((zone: RiskZone) => {
    setDispatchedProtocols((prev) => ({ ...prev, [zone.id]: true }));
    setDispatchToast(
      `Response Protocol P1 dispatched for ${zone.name}. Diversions active on NH-10 via Reshi bypass.`
    );
    setTimeout(() => {
      setDispatchToast(null);
    }, 6000);
  }, []);

  const handleNavTabChange = (tab: NavigationTab) => {
    setActiveNavTab(tab);
    if (tab === 'alerts') {
      setIsAlertsOpen(true);
    } else if (tab === 'field-reports') {
      setIsFieldReportOpen(true);
    } else if (tab === 'scenarios' || tab === 'forecast') {
      const eastSikkim = riskZones.find((z) => z.id === 'zone-east-sikkim') || riskZones[0];
      if (eastSikkim) {
        handleSelectZone(eastSikkim);
      }
    } else if (tab === 'analytics') {
      setIsPrioritiesOpen(true);
    } else if (tab === 'settings') {
      setIsSettingsOpen(true);
    }
  };

  const handleSelectMonitoredLocation = useCallback(
    (loc: MonitoredLocation) => {
      setCenter({ lat: loc.latitude, lng: loc.longitude });
      setZoom(12);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 12, { duration: 0.8 });
      }
      // If linked to a risk zone, select it to focus drawer
      const matchedZone = riskZones.find(
        (z) =>
          z.id === loc.id ||
          loc.id.includes(z.id) ||
          (loc.district && z.district.toLowerCase().includes(loc.district.toLowerCase()))
      );
      if (matchedZone) {
        setSelectedZone(matchedZone);
      }
      setDispatchToast(`Focused sector: ${loc.name} (${loc.district || loc.state})`);
      setTimeout(() => setDispatchToast(null), 4000);
    },
    [riskZones]
  );

  const handleSelectAlert = (alertItem: Alert) => {
    if (alertItem.coordinates) {
      setCenter(alertItem.coordinates);
      setZoom(12);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([alertItem.coordinates.lat, alertItem.coordinates.lng], 12, {
          duration: 0.8,
        });
      }
    }
    const matchedZone = riskZones.find(
      (z) =>
        z.id === alertItem.zoneId ||
        alertItem.targetRegion.toLowerCase().includes(z.district.toLowerCase())
    );
    if (matchedZone) {
      setSelectedZone(matchedZone);
    }
    setDispatchToast(`Focused alert sector: ${alertItem.title} (${alertItem.targetRegion})`);
    setTimeout(() => setDispatchToast(null), 5000);
  };

  return (
    <div className="relative w-full h-screen max-h-screen md:h-[100dvh] overflow-hidden bg-slate-100 text-slate-800 antialiased select-none">
      {/* 1. FULL-BLEED 100vw x 100vh GIS MAP ENGINE UNDERLAY */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Map
          center={center}
          zoom={zoom}
          basemap={basemap}
          layers={layers}
          riskZones={riskZones}
          roadCorridors={roadCorridors}
          fieldReports={fieldReports}
          infrastructure={infrastructure}
          selectedZone={selectedZone}
          activeRoutePlan={activeRoutePlan}
          onSelectZone={handleSelectZone}
          onMapClick={handleDeselectZone}
          mapRefCallback={(instance) => {
            mapInstanceRef.current = instance;
          }}
        />
      </div>

      {/* Floating Active Detour Banner */}
      {activeRoutePlan && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-floating border border-emerald-500/60 text-xs flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-emerald-400">Detour Active:</span>
            <span className="font-medium text-slate-100">
              {activeRoutePlan.alternativeRoute?.name || 'NH-717A Reshi Bypass'}
            </span>
            <span className="text-emerald-300 text-[11px] font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
              +{activeRoutePlan.alternativeRoute?.distanceDeltaKm || 43} km · +{activeRoutePlan.alternativeRoute?.timeDeltaMins || 80} min
            </span>
            <span className="text-slate-400 text-[11px] hidden md:inline">
              (NH-10 blocked at Km 44)
            </span>
          </div>
          <button
            onClick={() => setActiveRoutePlan(null)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 cursor-pointer ml-2 transition-colors"
          >
            Clear Detour
          </button>
        </div>
      )}

      {/* Floating Dispatch / Alert Confirmation Toast */}
      {dispatchToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-panel border border-slate-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{dispatchToast}</span>
          <button
            onClick={() => setDispatchToast(null)}
            className="text-slate-400 hover:text-white p-0.5 cursor-pointer ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. FLOATING MINIMAL HEADER */}
      {situation && (
        <Header
          situation={situation}
          riskZones={riskZones}
          criticalCount={criticalLocations.length}
          attentionCount={attentionLocations.length}
          onSelectZone={handleSelectZone}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          onOpenCriticalAreas={() => setTriageMode('critical')}
          onOpenAttentionAreas={() => setTriageMode('attention')}
          onSelectLocation={handleSelectLocation}
          onOpenCitizenMode={() => setIsCitizenModeOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* 3. FLOATING MINIMAL NAVIGATION DOCK (LEFT EDGE) */}
      <NavigationDock
        activeTab={activeNavTab}
        onTabChange={handleNavTabChange}
        unreadAlertsCount={alerts.length}
      />

      {/* 4. FLOATING BOTTOM-LEFT CONTROLS & SEVERITY LEGEND */}
      <div className="absolute bottom-6 left-5 z-20 flex items-center gap-3 select-none pointer-events-auto">
        <RiskLegend />
        <MapControls
          basemap={basemap}
          onBasemapChange={setBasemap}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRecenter={handleRecenter}
          layers={layers}
          onToggleLayer={handleToggleLayer}
        />
      </div>

      {/* 5. CONTEXTUAL RIGHT DRAWER ONLY WHEN A ZONE IS SELECTED */}
      {selectedZone && (
        <ZoneDrawer
          zone={selectedZone}
          onClose={handleDeselectZone}
          onViewResponsePlan={() => setIsPrioritiesOpen(true)}
          onDispatchProtocol={handleDispatchProtocol}
          isDispatched={Boolean(dispatchedProtocols[selectedZone.id])}
        />
      )}

      {/* 6. MODALS & FLYOUTS */}
      <CitizenViewModal
        isOpen={isCitizenModeOpen}
        onClose={() => setIsCitizenModeOpen(false)}
        riskZones={riskZones}
        selectedZone={selectedZone}
        onSelectZone={handleSelectZone}
        onOpenReportModal={() => {
          setIsCitizenModeOpen(false);
          setIsFieldReportOpen(true);
        }}
        onShowSafeRoute={async () => {
          const plan = await calculateAlternativeRoute('sevoke', 'gangtok');
          setActiveRoutePlan(plan);
          setIsCitizenModeOpen(false);
          setDispatchToast('Activated safe detour corridor via NH-717A Reshi-Algarah bypass.');
        }}
      />

      <ResponsePrioritiesModal
        isOpen={isPrioritiesOpen}
        onClose={() => {
          setIsPrioritiesOpen(false);
          setActiveNavTab('map');
        }}
        onSelectZoneId={(zid) => {
          const z = riskZones.find((item) => item.id === zid);
          if (z) handleSelectZone(z);
        }}
        onShowRoutePlan={(plan) => {
          setActiveRoutePlan(plan);
          setIsPrioritiesOpen(false);
          setDispatchToast('Activated alternative route corridor via NH-717A bypass.');
        }}
      />

      <FieldReportModal
        isOpen={isFieldReportOpen}
        onClose={() => {
          setIsFieldReportOpen(false);
          setActiveNavTab('map');
        }}
        activeZone={selectedZone}
        onSubmitSuccess={(newReport) => {
          setFieldReports((prev) => [newReport, ...prev]);
          setDispatchToast(
            `Field evidence submitted for ${newReport.district}. Screened: ${newReport.visionAnalysis?.assessment || 'Recorded'}`
          );
        }}
      />

      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => {
          setIsAlertsOpen(false);
          setActiveNavTab('map');
        }}
        alerts={alerts}
        onSelectAlert={handleSelectAlert}
      />

      <OperationalTriageModal
        isOpen={triageMode !== null}
        mode={triageMode || 'critical'}
        onClose={() => setTriageMode(null)}
        criticalLocations={criticalLocations}
        attentionLocations={attentionLocations}
        onSelectLocation={handleSelectMonitoredLocation}
        onSwitchMode={(newMode) => setTriageMode(newMode)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          setActiveNavTab('map');
        }}
      />
    </div>
  );
}
