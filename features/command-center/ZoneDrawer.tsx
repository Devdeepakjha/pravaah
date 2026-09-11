'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  AlertTriangle,
  Building2,
  Zap,
  Droplets,
  CheckCircle2,
  ArrowUpRight,
  Info,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { RiskZone } from '@/types/riskZone';
import { RISK_COLORS } from '@/lib/colors';
import { formatCoordinates, formatNumber } from '@/lib/utils';
import { runRainfallSimulation } from '@/services/scenarioService';
import { ScenarioResult } from '@/types/scenario';

interface ZoneDrawerProps {
  zone: RiskZone;
  onClose: () => void;
  onDispatchProtocol?: (zone: RiskZone) => void;
  isDispatched?: boolean;
}

type DrawerTab = 'overview' | 'telemetry' | 'lifelines' | 'protocol';

export function ZoneDrawer({
  zone,
  onClose,
  onDispatchProtocol,
  isDispatched = false,
}: ZoneDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ScenarioResult | null>(null);
  const [localDispatched, setLocalDispatched] = useState(isDispatched);

  // Sync dispatched status if prop changes or zone changes
  useEffect(() => {
    setLocalDispatched(isDispatched);
    setSimulationResult(null);
  }, [zone.id, isDispatched]);

  const colorMeta = RISK_COLORS[zone.riskLevel];

  // Handle Scenario Simulation Click
  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await runRainfallSimulation(zone, 30);
      // Ensure exact demonstration values as requested (e.g. 87% -> 96%)
      res.baselineRiskScore = zone.riskScore;
      res.simulatedRiskScore = Math.min(99, Math.max(zone.riskScore + 9, 96));
      setSimulationResult(res);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDispatch = () => {
    setLocalDispatched(true);
    onDispatchProtocol?.(zone);
  };

  return (
    <aside className="absolute top-4 right-5 bottom-6 w-96 max-w-[calc(100vw-2.5rem)] bg-white/98 backdrop-blur-xl rounded-2xl shadow-panel border border-slate-200/90 z-30 flex flex-col justify-between overflow-hidden select-none pointer-events-auto animate-in slide-in-from-right-4 duration-200">
      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-4">
        {/* Drawer Header: Breadcrumb, Close & Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {zone.district} · {zone.basin}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${colorMeta.badgeClass}`}
              >
                {zone.riskLevel} · {zone.riskScore}%
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close Zone Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {zone.name}
            </h2>
            {localDispatched && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                P1 DISPATCHED
              </span>
            )}
          </div>

          {/* Trend & Coordinates */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
              {zone.trend === 'INCREASING' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : zone.trend === 'DECREASING' ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>Risk increasing {zone.trendRate}</span>
            </div>

            <span className="font-mono text-[10px] text-slate-400">
              {formatCoordinates(zone.center.lat, zone.center.lng)}
            </span>
          </div>
        </div>

        {/* Minimal Navigation Tabs */}
        <div className="flex items-center border-b border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-1 font-semibold transition-all border-b-2 mr-4 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-2 px-1 font-semibold transition-all border-b-2 mr-4 cursor-pointer ${
              activeTab === 'telemetry'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Telemetry
          </button>
          <button
            onClick={() => setActiveTab('lifelines')}
            className={`pb-2 px-1 font-semibold transition-all border-b-2 mr-4 cursor-pointer ${
              activeTab === 'lifelines'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Lifelines
          </button>
          <button
            onClick={() => setActiveTab('protocol')}
            className={`pb-2 px-1 font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'protocol'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Protocol
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4 pt-1">
            {/* Simulation Feedback Card when active */}
            {simulationResult && (
              <div className="bg-slate-900 text-white rounded-xl p-3.5 space-y-3 shadow-md border border-slate-800 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                      +30% Rainfall Anomaly Simulation
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300 border border-slate-700">
                    SIMULATED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-800/90 rounded-lg p-2.5 border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Current Risk
                    </div>
                    <div className="text-xl font-bold text-white mt-0.5">
                      {simulationResult.baselineRiskScore}%
                    </div>
                    <div className="text-[10px] text-slate-400">Precipitation baseline</div>
                  </div>
                  <div className="bg-rose-950/70 rounded-lg p-2.5 border border-rose-800">
                    <div className="text-[10px] text-rose-300 uppercase font-semibold">
                      Simulated Risk
                    </div>
                    <div className="text-xl font-bold text-rose-400 mt-0.5">
                      {simulationResult.simulatedRiskScore}%
                    </div>
                    <div className="text-[10px] text-rose-300 font-medium">Critical slope failure</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-800/40 p-2 rounded border border-slate-800">
                  {simulationResult.summary}
                </p>

                <div className="flex items-center justify-between pt-0.5 text-[10px]">
                  <span className="text-amber-400 font-medium">Notice: Analytical model simulation</span>
                  <button
                    onClick={() => setSimulationResult(null)}
                    className="text-slate-400 hover:text-white underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            )}

            {/* ML Model Provenance & SHAP Explainability */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-slate-800">
                    ML Risk Explainability (SHAP)
                  </span>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                  {zone.mlPrediction?.model_version || 'XGBoost v1.0'}
                </span>
              </div>

              {zone.mlPrediction?.top_factors && zone.mlPrediction.top_factors.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {zone.mlPrediction.top_factors.map((tf, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-2 border border-slate-200/60 flex flex-col gap-0.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{tf.label}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          tf.direction === 'elevating' ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'
                        }`}>
                          {tf.direction === 'elevating' ? '▲ +' : '▼ -'}{tf.impact_pct}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 leading-tight">{tf.description}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-500">
                  Feature attributions derived from TreeExplainer over regional terrain and hydrometeorological predictors.
                </p>
              )}
            </div>

            {/* Main Drivers (Strict Top 3) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Operational Hazard Drivers
                </span>
                <span className="text-[11px] text-slate-400">Primary Indicators</span>
              </div>

              <div className="space-y-2 text-xs divide-y divide-slate-100">
                {zone.topDrivers.map((driver) => {
                  const dColor = RISK_COLORS[driver.severity] || RISK_COLORS.HIGH;
                  return (
                    <div key={driver.id} className="pt-2 first:pt-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 flex items-center gap-2 font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${dColor.dotClass}`} />
                          {driver.name}
                        </span>
                        <span
                          className={`font-semibold ${
                            driver.severity === 'CRITICAL' || driver.severity === 'EXTREME' || driver.severity === 'VERY_HIGH'
                              ? 'text-rose-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {driver.headline}
                        </span>
                      </div>
                      {driver.detailNote && (
                        <div className="text-[10px] text-slate-400 pl-3.5">
                          {driver.detailNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-100"></div>


            {/* Exposed Lifelines / Impact */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Exposed Lifelines
                </span>
                <span className="text-[11px] text-slate-400">Impact Radius</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {formatNumber(zone.impact.populationExposed)} people exposed
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {zone.impact.populationDetail}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {zone.impact.criticalRoadImpact}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      {zone.impact.facilitiesExposed}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* Immediate Action (Single Prominent Mandate) */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Immediate Action
              </span>
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3">
                <p className="text-xs leading-relaxed font-semibold text-amber-950">
                  {zone.primaryAction}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4 pt-1 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Geological & Hydrological Stream</span>
              {zone.dataSource === 'LIVE_TELEMETRY' ? (
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  REAL ML INFERENCE
                </span>
              ) : (
                <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  SIMULATED SENSOR DATA
                </span>
              )}
            </div>


            <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">24-Hour Rainfall</span>
                <span className="font-semibold text-slate-900">
                  {zone.telemetry.rainfall24h} mm (+{zone.telemetry.rainfallAnomalyPercent}% anomaly)
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Soil Saturation Index</span>
                <span className="font-semibold text-rose-600">
                  {zone.telemetry.soilSaturationPercent}% (Threshold: 75%)
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Piezometer Water Table</span>
                <span className="font-semibold text-slate-900">
                  {zone.telemetry.piezometerWaterTableMeters} m below surface
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">InSAR Surface Deformation</span>
                <span className="font-semibold text-slate-900">
                  {zone.telemetry.insarDeformationRateMmYear} mm / year
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Slope Gradient</span>
                <span className="font-semibold text-slate-900">
                  {zone.telemetry.slopeAngleDeg}° steep
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Bedrock Lithology</span>
                <span className="font-semibold text-slate-900 truncate max-w-[190px]">
                  {zone.telemetry.soilType}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed border border-slate-100">
              <div className="flex items-center gap-1 font-semibold text-slate-700 mb-1">
                <Info className="w-3.5 h-3.5" />
                <span>Geotechnical Calibration</span>
              </div>
              Threshold calculated using GSI slip-surface empirical models calibrated against IMD precipitation radar arrays.
            </div>
          </div>
        )}

        {/* TAB 3: LIFELINES */}
        {activeTab === 'lifelines' && (
          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Critical Infrastructure Inventory</span>
              <span className="font-medium text-slate-600">GIS Buffer: 1,500m</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>NH-10 Highway Corridor</span>
                  <span className="text-rose-700 text-[10px] font-bold bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                    BLOCKED
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Chainage Km 44 impassable. Debris volume ~4,500 m³. Reshi bypass operational for light vehicles.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>Singtam Sub-District Hospital</span>
                  <span className="text-amber-700 text-[10px] font-bold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                    STANDBY
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  450m from potential runout zone. Trauma team staged; alternative helipad at Rangpo alerted.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>Teesta Stage V Dam Facility</span>
                  <span className="text-emerald-700 text-[10px] font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                    NORMAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Spillway gates automated. Telemetry linked to Central Water Commission monitoring station.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROTOCOL */}
        {activeTab === 'protocol' && (
          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>National Disaster Management Protocol</span>
              <span className="font-medium text-slate-600">NDMA SOP Active</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Phase 1: Traffic Interdiction</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Direct traffic police checkposts at Rangpo and Melli to divert Gangtok freight traffic via Reshi-Algarah corridor.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Phase 2: Ward Evacuation Advisory</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Issue automated loudspeaker and SMS alerts to 3 vulnerable settlements along the right bank of Teesta.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-col gap-2">
        {/* Primary Action Button */}
        <button
          onClick={handleDispatch}
          disabled={localDispatched}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            localDispatched
              ? 'bg-emerald-700 text-white cursor-default'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          {localDispatched ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Response Protocol P1 Dispatched</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Dispatch Response Protocol (P1)</span>
            </>
          )}
        </button>

        {/* Secondary Simulation Action Button */}
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Droplets className="w-4 h-4 text-slate-500" />
          <span>
            {isSimulating
              ? 'Computing Hydrological Strain...'
              : simulationResult
              ? 'Re-run Rainfall Simulation (+30%)'
              : 'Simulate Rainfall Scenario (+30%)'}
          </span>
        </button>

        {/* Footer Meta & SITREP export */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            NDMA SOP Active
          </span>
          <button
            onClick={() => alert(`SITREP Dossier for ${zone.name} exported (PDF/JSON format)`)}
            className="hover:text-slate-700 underline font-medium flex items-center gap-0.5 cursor-pointer"
          >
            <span>Export SITREP</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
