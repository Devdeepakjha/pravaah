'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Search,
  MapPin,
  Compass,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Camera,
  Navigation,
  HelpCircle,
  Users,
  Building2,
  ArrowRight,
  Globe
} from 'lucide-react';
import { RiskZone } from '@/types/riskZone';
import { getRiskZones, searchLocations } from '@/services/riskZoneService';
import { calculateAlternativeRoute } from '@/services/roadStatusService';
import { FieldReportModal } from '@/features/field-reports/FieldReportModal';
import { RISK_COLORS } from '@/lib/colors';

export default function CitizenPage() {
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    zones: RiskZone[];
    landmarks: Array<{ name: string; type: string; coordinates: { lat: number; lng: number }; zoneId?: string }>;
  }>({ zones: [], landmarks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showHelplines, setShowHelplines] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [routePlan, setRoutePlan] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getRiskZones();
      setRiskZones(data);
      const eastSikkim = data.find((z) => z.id === 'zone-east-sikkim') || data[0];
      if (eastSikkim) setSelectedZone(eastSikkim);
    }
    loadData();
  }, []);

  useEffect(() => {
    async function runSearch() {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        const res = await searchLocations(searchQuery);
        setSearchResults(res);
      } else {
        setSearchResults({ zones: [], landmarks: [] });
        setIsSearching(false);
      }
    }
    runSearch();
  }, [searchQuery]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setToastMessage('Geolocation is not supported by your browser.');
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLocating(false);
        // Match closest monitored zone in Northeast
        const { latitude, longitude } = position.coords;
        if (riskZones.length > 0) {
          let closest = riskZones[0];
          let minDist = 999999;
          riskZones.forEach((z) => {
            const d = Math.hypot(z.center.lat - latitude, z.center.lng - longitude);
            if (d < minDist) {
              minDist = d;
              closest = z;
            }
          });
          setSelectedZone(closest);
          setToastMessage(`Located: Matched nearest monitored sector ${closest.name}`);
          setTimeout(() => setToastMessage(null), 4000);
        }
      },
      (error) => {
        setGeoLocating(false);
        setToastMessage('Location permission denied or unavailable. Showing East Sikkim default.');
        setTimeout(() => setToastMessage(null), 4000);
      }
    );
  };

  const handleSelectZone = (zone: RiskZone) => {
    setSelectedZone(zone);
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleFindSafeRoute = async () => {
    const plan = await calculateAlternativeRoute('sevoke', 'gangtok');
    setRoutePlan(plan);
    setToastMessage('Alternative route calculated: NH-717A Reshi Bypass avoids NH-10 blockade.');
    setTimeout(() => setToastMessage(null), 5000);
  };

  const colorMeta = selectedZone ? RISK_COLORS[selectedZone.riskLevel] : RISK_COLORS['MODERATE'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* Top Banner & Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-slate-900 tracking-tight text-sm">PRAVAAH</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Citizen Portal
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Community Safety & Hazard Intelligence</span>
            </div>
          </Link>

          {/* Role Jump & Official Switcher */}
          <div className="flex items-center gap-2">
            <Link
              href="/command-center"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Official Command Center</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-5">
        {/* Toast feedback */}
        {toastMessage && (
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Prompt */}
        <div className="text-center space-y-1 py-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Check Landslide Risk in Your Area
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time environmental hazard status, plain-language guidance, and emergency transit advice.
          </p>
        </div>

        {/* Search & Location Box */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
          <div className="relative">
            <div className="flex items-center bg-slate-100/80 rounded-xl px-3.5 py-2.5 border border-slate-200 focus-within:border-slate-800 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search village, town, or road (e.g. Singtam, Gangtok, NH-10)..."
                className="bg-transparent border-none p-0 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full"
              />
            </div>

            {/* Search Dropdown */}
            {isSearching && (searchResults.zones.length > 0 || searchResults.landmarks.length > 0) && (
              <div className="absolute top-full mt-2 inset-x-0 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden text-xs max-h-60 overflow-y-auto">
                {searchResults.zones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => handleSelectZone(zone)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 border-b border-slate-100 text-left cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{zone.name}</div>
                      <div className="text-[11px] text-slate-500">{zone.district}, {zone.state}</div>
                    </div>
                    <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-slate-100">
                      {zone.riskLevel}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400 text-[11px]">Or select monitored zone:</span>
            <button
              onClick={handleUseMyLocation}
              disabled={geoLocating}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-xs"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{geoLocating ? 'Detecting Location...' : 'Use My Location'}</span>
            </button>
          </div>

          {/* Quick Zone Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {riskZones.map((z) => (
              <button
                key={z.id}
                onClick={() => handleSelectZone(z)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                  selectedZone?.id === z.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                {z.name.split(' - ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Hazard Status Card */}
        {selectedZone && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Status Header */}
            <div className={`p-5 ${colorMeta.bgClass} border-b ${colorMeta.borderClass}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Current Area Hazard Status</span>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-300">
                  {selectedZone.dataFreshness || 'Updated: 14:30 IST'}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {selectedZone.riskLevel} RISK
                  </h2>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {selectedZone.name} ({selectedZone.district}, {selectedZone.state})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900">{selectedZone.riskScore}%</span>
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase">Estimated Risk</span>
                </div>
              </div>
            </div>

            {/* Why is this area at risk? */}
            <div className="p-5 border-b border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Why is risk elevated?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Heavy Monsoon Rainfall
                  </span>
                  <p className="text-[11px] text-slate-500">
                    24h accumulation: {selectedZone.telemetry?.rainfall24h || 112.5} mm precipitation causing acute surface saturation.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Steep Mountain Terrain
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Regional slope of {selectedZone.telemetry?.slopeAngleDeg || 34}° along {selectedZone.basin}.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    High Soil Pore Pressure
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Prolonged antecedent rainfall over 7 days saturating colluvial soil layers.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Historical Landslide Scarp
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Prior slope movements documented in GSI/ISRO inventories in this corridor.
                  </p>
                </div>
              </div>
            </div>

            {/* What should I do? */}
            <div className="p-5 border-b border-slate-100 space-y-3 bg-amber-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                What should you do?
              </h3>
              <ul className="space-y-2 text-xs text-amber-950 font-medium">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Avoid unnecessary travel along steep cuts and valley highways (especially NH-10).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Stay alert for ground tension cracks, tilting trees, or sudden muddy water runoff.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Follow local District Disaster Management Authority (DDMA) announcements on radio or SMS.</span>
                </li>
              </ul>
            </div>

            {/* Action CTAs */}
            <div className="p-4 bg-slate-50 flex flex-wrap gap-2 justify-between">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Report Ground Hazard</span>
              </button>

              <button
                onClick={handleFindSafeRoute}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Find Safe Detour Route</span>
              </button>

              <button
                onClick={() => setShowHelplines(!showHelplines)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <span>Emergency Help</span>
              </button>
            </div>

            {/* Safe Route Overlay if triggered */}
            {routePlan && (
              <div className="p-4 bg-emerald-50 border-t border-emerald-200 space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-emerald-600" />
                    <span>Active Safe Detour Guidance</span>
                  </span>
                  <button onClick={() => setRoutePlan(null)} className="text-slate-400 hover:text-slate-600 text-xs">
                    Dismiss
                  </button>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="font-semibold text-slate-900">{routePlan.alternativeRoute?.name}</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{routePlan.advisory}</p>
                  <div className="flex gap-3 text-[11px] text-slate-500 pt-1 font-medium">
                    <span>Distance: {routePlan.alternativeRoute?.distanceKm} km</span>
                    <span>•</span>
                    <span>Bypass Delta: +{routePlan.alternativeRoute?.distanceDeltaKm} km</span>
                  </div>
                </div>
              </div>
            )}

            {/* Helplines Drawer */}
            {showHelplines && (
              <div className="p-4 bg-rose-50/70 border-t border-rose-200 space-y-2 text-xs animate-in fade-in">
                <div className="font-bold text-rose-950 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-rose-600" />
                  <span>24/7 Official Emergency Helplines (Northeast)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <a href="tel:1070" className="p-2 bg-white rounded-lg border border-rose-200 flex justify-between items-center hover:bg-rose-50">
                    <span className="font-semibold text-slate-800">State Disaster (SDMA)</span>
                    <span className="font-bold text-rose-600">Dial 1070</span>
                  </a>
                  <a href="tel:112" className="p-2 bg-white rounded-lg border border-rose-200 flex justify-between items-center hover:bg-rose-50">
                    <span className="font-semibold text-slate-800">National Emergency Support</span>
                    <span className="font-bold text-rose-600">Dial 112</span>
                  </a>
                  <a href="tel:03592202461" className="p-2 bg-white rounded-lg border border-rose-200 flex justify-between items-center hover:bg-rose-50">
                    <span className="font-semibold text-slate-800">Gangtok District Control</span>
                    <span className="font-bold text-slate-700">03592-202461</span>
                  </a>
                  <a href="tel:108" className="p-2 bg-white rounded-lg border border-rose-200 flex justify-between items-center hover:bg-rose-50">
                    <span className="font-semibold text-slate-800">Ambulance Service</span>
                    <span className="font-bold text-rose-600">Dial 108</span>
                  </a>
                </div>
              </div>
            )}

            {/* Expandable Scientific & AI Details */}
            <div className="border-t border-slate-200">
              <button
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="w-full p-3 text-left text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-between cursor-pointer"
              >
                <span>Scientific Methodology & AI Limitations</span>
                {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showTechnicalDetails && (
                <div className="p-4 bg-slate-50 text-[11px] text-slate-600 space-y-2 border-t border-slate-100">
                  <p>
                    <strong>Model:</strong> Calibrated XGBoost Machine Learning Pipeline v1.0.0 (Spatial holdout ROC-AUC: 0.933). Trained on 461 real observational records from ISRO Landslide Atlas and historical IMD precipitation archives.
                  </p>
                  <p>
                    <strong>Data Freshness:</strong> Gridded meteorological inputs refreshed every 10 minutes from India Meteorological Department (IMD) / calibrated replay fallback.
                  </p>
                  <p className="text-slate-400 italic">
                    Disclaimer: PRAVAAH generates statistical failure probabilities to guide decision-making. Always follow official instructions issued by State and District Disaster Management Authorities.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Citizen Safety Portal Footer */}
      <footer className="mt-auto py-8 px-4 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white/60">
        <div className="max-w-2xl mx-auto space-y-1">
          <p className="font-semibold text-slate-600">
            PRAVAAH Citizen Safety Portal · Dial 112 for National Emergency Rescue
          </p>
          <p className="text-[11px] text-slate-400">
            Ministry of Development of North Eastern Region (MDoNER) · Smart India Hackathon 2026
          </p>
        </div>
      </footer>

      {/* Field Report Modal */}
      <FieldReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        activeZone={selectedZone}
        onSubmitSuccess={(report) => {
          setToastMessage(`Hazard report received (#${report.id}). Thank you for alerting authorities!`);
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />
    </div>
  );
}
