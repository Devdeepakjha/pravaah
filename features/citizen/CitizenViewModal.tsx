'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Compass,
  CheckCircle2,
  PhoneCall,
  MapPin,
  Camera,
  Navigation,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Droplets,
  Mountain,
  Users
} from 'lucide-react';
import { RiskZone } from '@/types/riskZone';
import { RISK_COLORS } from '@/lib/colors';

interface CitizenViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskZones: RiskZone[];
  selectedZone: RiskZone | null;
  onSelectZone: (zone: RiskZone) => void;
  onOpenReportModal: () => void;
  onShowSafeRoute: () => void;
}

export function CitizenViewModal({
  isOpen,
  onClose,
  riskZones,
  selectedZone,
  onSelectZone,
  onOpenReportModal,
  onShowSafeRoute,
}: CitizenViewModalProps) {
  const [activeZoneId, setActiveZoneId] = useState<string>(
    selectedZone?.id || (riskZones[0]?.id ?? 'zone-east-sikkim')
  );
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showHelplines, setShowHelplines] = useState(false);

  if (!isOpen) return null;

  const currentZone = riskZones.find((z) => z.id === activeZoneId) || riskZones[0];
  const colorMeta = currentZone ? RISK_COLORS[currentZone.riskLevel] : RISK_COLORS['MODERATE'];

  const handleZoneChange = (zoneId: string) => {
    setActiveZoneId(zoneId);
    const z = riskZones.find((item) => item.id === zoneId);
    if (z) onSelectZone(z);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-md p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl shadow-floating border border-slate-200 w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Citizen Safety Portal</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  PUBLIC ADVISORY
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Simple, actionable landslide hazard guidance for your family and neighborhood
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-5 text-slate-800">
          {/* Location Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Is my area at risk? Select your location:</span>
            </label>
            <select
              value={activeZoneId}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white font-semibold text-slate-900 text-sm focus:outline-none focus:border-slate-900 transition-colors cursor-pointer"
            >
              {riskZones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.district}, {z.state})
                </option>
              ))}
            </select>
          </div>

          {/* Core Risk Banner */}
          {currentZone && (
            <div className={`p-5 rounded-2xl border-2 space-y-2 transition-all ${colorMeta.borderClass} ${colorMeta.bgClass}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Current Hazard Status
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${colorMeta.badgeClass}`}>
                  {currentZone.riskLevel} RISK · {currentZone.riskScore}%
                </span>
              </div>

              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {currentZone.riskLevel === 'CRITICAL' || currentZone.riskLevel === 'EXTREME'
                  ? 'Severe Hazard Warning Active'
                  : currentZone.riskLevel === 'HIGH' || currentZone.riskLevel === 'VERY_HIGH'
                  ? 'Elevated Hazard Watch'
                  : 'Normal Seasonal Conditions'}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {currentZone.riskScore >= 60
                  ? 'Mountain slopes in your vicinity are experiencing heavy soil saturation. Soil movement or rockfalls may occur near vulnerable road cuttings.'
                  : currentZone.riskScore >= 35
                  ? 'Moderate rainfall detected. Normal precautions are advised when traveling along hillside roads or near stream culverts.'
                  : 'Terrain in this area is stable under current rainfall conditions.'}
              </p>
            </div>
          )}

          {/* Section: WHY is my area at risk? */}
          {currentZone && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                <span>Why is my area at risk?</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span>Heavy 7-Day Rainfall</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>{currentZone.telemetry.rainfall24h} mm</strong> fell in the last 24h, saturating soil to{' '}
                    <strong>{currentZone.telemetry.soilSaturationPercent}%</strong> of capacity.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5 text-amber-500" />
                    <span>Steep Slope Relief</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Terrain steepness is <strong>{currentZone.telemetry.slopeAngleDeg}°</strong>, creating gravitational strain on rock layers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: WHAT SHOULD I DO? */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What should you do right now?</span>
            </h3>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span className="text-emerald-950 font-medium leading-relaxed">
                  <strong>Stay clear of steep slopes:</strong> Avoid standing directly beneath sheer roadside cuttings or near muddy drainage gullies.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span className="text-emerald-950 font-medium leading-relaxed">
                  <strong>Watch for ground warnings:</strong> If doors jam, trees tilt, or new ground cracks appear, move immediately to the nearest designated high-ground shelter.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span className="text-emerald-950 font-medium leading-relaxed">
                  <strong>Avoid night valley transit:</strong> Avoid driving through river valleys during night downpours; use safe alternate ridge bypasses.
                </span>
              </div>
            </div>
          </div>

          {/* 3 Prominent Citizen Action Buttons */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenReportModal();
              }}
              className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-800 text-center flex flex-col items-center gap-1.5 font-bold transition-all cursor-pointer group"
            >
              <Camera className="w-5 h-5 text-rose-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] leading-tight">Report a Hazard</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onShowSafeRoute();
              }}
              className="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl text-sky-800 text-center flex flex-col items-center gap-1.5 font-bold transition-all cursor-pointer group"
            >
              <Navigation className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] leading-tight">Find Safe Route</span>
            </button>

            <button
              onClick={() => setShowHelplines(!showHelplines)}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-800 text-center flex flex-col items-center gap-1.5 font-bold transition-all cursor-pointer group"
            >
              <PhoneCall className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] leading-tight">Emergency Help</span>
            </button>
          </div>

          {/* Emergency Helplines Flyout */}
          {showHelplines && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 text-xs animate-in fade-in duration-150">
              <div className="font-bold text-xs text-emerald-400">Emergency Helplines (24x7):</div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">State Disaster Management Authority (SDMA):</span>
                  <span className="font-mono font-bold text-emerald-300">1070</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">District Emergency Operations Centre:</span>
                  <span className="font-mono font-bold text-emerald-300">1077</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-300">National Disaster Response Force (NDRF):</span>
                  <span className="font-mono font-bold text-emerald-300">03592-202222</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-300">Police & Ambulance Hotline:</span>
                  <span className="font-mono font-bold text-emerald-300">112</span>
                </div>
              </div>
            </div>
          )}

          {/* Progressive Disclosure: Scientific Details */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between text-slate-500 hover:text-slate-800 text-xs font-semibold py-1 cursor-pointer"
            >
              <span>Scientific Data & AI Model Details</span>
              {showTechnicalDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showTechnicalDetails && currentZone && (
              <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>ML Engine Version:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {currentZone.modelVersion || 'pravaah-xgb-v1.0-sikkim-ne'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Data Provenance:</span>
                  <span className="font-semibold text-slate-900">{currentZone.dataSource}</span>
                </div>
                <div className="flex justify-between">
                  <span>Model Confidence:</span>
                  <span className="font-semibold text-slate-900">0.933 ROC-AUC</span>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-1">
                  Calculated from 461 verified observational training records with Copernicus 30m DEM terrain Horn finite-difference derivations and antecedent rainfall archives.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
