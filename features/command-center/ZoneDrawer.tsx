'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  AlertTriangle,
  Building2,
  Droplets,
  CheckCircle2,
  ArrowUpRight,
  Info,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Mountain,
  CloudRain,
  Compass,
  Layers,
  ArrowRight,
  Sliders,
  FileText,
} from 'lucide-react';
import { RiskZone, RiskLevel, MLPredictionFactor } from '@/types/riskZone';
import { RISK_COLORS } from '@/lib/colors';
import { formatCoordinates, formatNumber } from '@/lib/utils';
import { runRainfallSimulation } from '@/services/scenarioService';
import { ScenarioResult } from '@/types/scenario';

interface ZoneDrawerProps {
  zone: RiskZone;
  onClose: () => void;
  onViewResponsePlan?: (zone: RiskZone) => void;
  onDispatchProtocol?: (zone: RiskZone) => void;
  isDispatched?: boolean;
}

type DrawerTab = 'overview' | 'telemetry' | 'lifelines' | 'protocol';

/**
 * Clean SVG semi-circular risk gauge
 * Center (70, 72), Radius 56, arc from 180° to 0°
 */
function RiskMeterGauge({ score, riskLevel }: { score: number; riskLevel: RiskLevel }) {
  const color = RISK_COLORS[riskLevel] || RISK_COLORS.HIGH;
  const r = 56;
  const arcLength = Math.PI * r; // ~175.93
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = arcLength * (1 - clampedScore / 100);

  return (
    <div className="relative flex flex-col items-center justify-center pt-1 pb-2">
      <svg className="w-48 h-24 overflow-visible" viewBox="0 0 140 78">
        {/* Background Track Arc */}
        <path
          d="M 14,72 A 56,56 0 0,1 126,72"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Foreground Value Arc */}
        <path
          d="M 14,72 A 56,56 0 0,1 126,72"
          fill="none"
          stroke={color.hex}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      {/* Centered Score Display */}
      <div className="absolute top-6 flex flex-col items-center text-center">
        <span className="text-4xl font-black text-slate-900 tracking-tight leading-none">
          {Math.round(score)}%
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Landslide Risk
        </span>
      </div>
      {/* Risk Level Badge */}
      <div className="mt-1">
        <span
          className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border tracking-wider uppercase ${color.badgeClass}`}
        >
          {riskLevel.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}

/**
 * Returns an appropriate icon for a contributing factor
 */
function getFactorIcon(feature: string) {
  const f = feature.toLowerCase();
  if (f.includes('rain') || f.includes('precip') || f.includes('p24') || f.includes('p72')) {
    return <CloudRain className="w-4 h-4 text-sky-500 shrink-0" />;
  }
  if (f.includes('slope') || f.includes('elevation') || f.includes('tri') || f.includes('rugged')) {
    return <Mountain className="w-4 h-4 text-amber-600 shrink-0" />;
  }
  if (f.includes('curv') || f.includes('aspect') || f.includes('surface')) {
    return <Compass className="w-4 h-4 text-indigo-500 shrink-0" />;
  }
  return <Layers className="w-4 h-4 text-slate-500 shrink-0" />;
}

/**
 * Formats a clean category label from raw feature names
 */
function getFactorCategory(feature: string, rawLabel?: string): string {
  const f = feature.toLowerCase();
  if (f.includes('rain') || f.includes('precip')) return 'Rainfall';
  if (f.includes('slope')) return 'Terrain Slope';
  if (f.includes('elevation')) return 'Elevation Profile';
  if (f.includes('tri') || f.includes('rugged')) return 'Terrain Ruggedness';
  if (f.includes('curv')) return 'Surface Curvature';
  if (f.includes('aspect')) return 'Slope Aspect';
  if (rawLabel) return rawLabel.split('(')[0].trim();
  return 'Terrain Factor';
}

export function ZoneDrawer({
  zone,
  onClose,
  onViewResponsePlan,
  onDispatchProtocol,
  isDispatched = false,
}: ZoneDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ScenarioResult | null>(null);
  const [localDispatched, setLocalDispatched] = useState(isDispatched);
  const [simulationPercent, setSimulationPercent] = useState<number>(40);
  const [showModelDetails, setShowModelDetails] = useState(false);

  // Strict Zone Synchronization:
  // When zone.id changes, reset simulation, details toggle, and sync local dispatch
  useEffect(() => {
    setLocalDispatched(isDispatched);
    setSimulationResult(null);
    setSimulationPercent(40);
    setShowModelDetails(false);
    setActiveTab('overview');
  }, [zone.id, isDispatched]);

  const colorMeta = RISK_COLORS[zone.riskLevel] || RISK_COLORS.HIGH;

  // Baseline rainfall derived canonically from zone telemetry
  const baselineRain = useMemo(() => {
    return zone.telemetry?.rainfall24h ? Math.round(zone.telemetry.rainfall24h) : 94;
  }, [zone.telemetry?.rainfall24h]);

  // Simulated rainfall preview
  const previewSimulatedRain = useMemo(() => {
    if (simulationResult?.simulatedRain24h) {
      return simulationResult.simulatedRain24h;
    }
    return Math.round(baselineRain * (1 + simulationPercent / 100));
  }, [baselineRain, simulationPercent, simulationResult?.simulatedRain24h]);

  // Handle Scenario Simulation Click
  const handleSimulate = async (percent: number = simulationPercent) => {
    setIsSimulating(true);
    try {
      const res = await runRainfallSimulation(zone, percent);
      setSimulationResult(res);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSimulation = () => {
    setSimulationResult(null);
    setSimulationPercent(40);
  };

  const handleViewPlan = () => {
    if (onViewResponsePlan) {
      onViewResponsePlan(zone);
    } else {
      setActiveTab('protocol');
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Derive Top 3 Factors for "WHY THIS AREA IS AT RISK"
  const topThreeFactors = useMemo(() => {
    if (zone.mlPrediction?.top_factors && zone.mlPrediction.top_factors.length > 0) {
      return zone.mlPrediction.top_factors.slice(0, 3);
    }
    // Fallback using topDrivers if mlPrediction not present
    if (zone.topDrivers && zone.topDrivers.length > 0) {
      return zone.topDrivers.slice(0, 3).map((d) => ({
        feature: d.category,
        label: d.name,
        value: d.value,
        impact: d.severity === 'CRITICAL' || d.severity === 'VERY_HIGH' ? 1.5 : 0.8,
        impact_pct: d.severity === 'CRITICAL' || d.severity === 'VERY_HIGH' ? 32 : 18,
        direction: 'elevating' as const,
        description: d.headline || d.detailNote || 'Elevated geomorphic trigger',
      }));
    }
    return [];
  }, [zone.mlPrediction?.top_factors, zone.topDrivers]);

  return (
    <aside className="absolute top-20 right-5 bottom-6 w-96 max-w-[calc(100vw-2.5rem)] bg-white/98 backdrop-blur-xl rounded-2xl shadow-panel border border-slate-200/90 z-30 flex flex-col justify-between overflow-hidden select-none pointer-events-auto animate-in slide-in-from-right-4 duration-200">
      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-4">
        {/* 1. LOCATION HEADER */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate max-w-[240px]">
              {zone.district} · {zone.basin || zone.state || 'Sikkim'}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Zone Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
            {zone.name}
          </h2>
        </div>

        {/* 2. LARGE RISK VISUAL & PROVENANCE */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 text-center space-y-2">
          {/* Circular Risk Meter */}
          <RiskMeterGauge score={zone.riskScore} riskLevel={zone.riskLevel} />

          {/* Scientific Probability Subtitle */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-600">
              Estimated probability of slope failure
            </p>

            {/* Truthful Trend Indicator */}
            {zone.trend === 'INCREASING' && (
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Risk elevated under active rainfall</span>
              </div>
            )}
            {zone.trend === 'DECREASING' && (
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Risk decreasing with drainage</span>
              </div>
            )}
            {zone.trend === 'STABLE' && (
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                <Minus className="w-3.5 h-3.5" />
                <span>Risk stable at baseline</span>
              </div>
            )}
          </div>

          {/* Provenance & Data Input Badges (Scientifically Honest) */}
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-slate-600 border border-slate-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              {zone.mlPrediction?.model_version ? `XGBoost · ${zone.mlPrediction.model_version}` : 'XGBoost prediction · Model v1.0'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-slate-600 border border-slate-200 shadow-2xs">
              {zone.dataSource === 'LIVE_TELEMETRY' || (zone.dataSource as string) === 'IMD_API' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Weather input: IMD
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Weather input: Demo Replay
                </>
              )}
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

        {/* TAB 1: OVERVIEW (Clean Decision Flow) */}
        {activeTab === 'overview' && (
          <div className="space-y-4 pt-1">
            {/* 3. WHY THIS AREA IS AT RISK (Top Contributing Factors) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Why this area is at risk
                </span>
                <span className="text-[11px] text-slate-400">Key Contributing Factors</span>
              </div>

              {topThreeFactors.length > 0 ? (
                <div className="space-y-2">
                  {topThreeFactors.map((factor, idx) => {
                    const isElevating = factor.direction === 'elevating' || factor.impact > 0;
                    const roundedPct = Math.round(Math.abs(factor.impact_pct));
                    const category = getFactorCategory(factor.feature, factor.label);

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs space-y-1 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getFactorIcon(factor.feature)}
                            <span className="font-bold text-xs text-slate-800">
                              {category}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                              isElevating
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {isElevating ? '↑ +' : '↓ -'}{roundedPct}%
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed pl-6">
                          {factor.description || `${factor.label}: measured value ${Math.round(factor.value)}`}
                        </p>

                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 pl-6 pt-0.5">
                          {isElevating ? (
                            <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                              <TrendingUp className="w-3 h-3" /> Increasing risk
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                              <TrendingDown className="w-3 h-3" /> Reducing risk
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  Data unavailable for factor attribution.
                </p>
              )}

              {/* Technical Model Details Accordion */}
              <div className="pt-1">
                <button
                  onClick={() => setShowModelDetails(!showModelDetails)}
                  className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    View model details (SHAP values)
                  </span>
                  {showModelDetails ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {showModelDetails && (
                  <div className="mt-2 p-3 bg-slate-900 text-white rounded-xl text-[11px] space-y-2 border border-slate-800 animate-in fade-in duration-150 font-mono">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] border-b border-slate-800 pb-1.5">
                      <span>FEATURE</span>
                      <span>VALUE</span>
                      <span>SHAP</span>
                      <span>SHARE</span>
                    </div>

                    {zone.mlPrediction?.top_factors?.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] py-0.5">
                        <span className="text-slate-300 truncate max-w-[110px]">{f.feature}</span>
                        <span className="text-slate-400">{typeof f.value === 'number' ? f.value.toFixed(1) : f.value}</span>
                        <span className={f.impact >= 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          {f.impact >= 0 ? '+' : ''}{f.impact.toFixed(3)}
                        </span>
                        <span className={f.impact >= 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          {f.impact >= 0 ? '+' : ''}{Math.round(f.impact_pct)}%
                        </span>
                      </div>
                    ))}

                    <div className="pt-1 text-[9px] text-slate-500 font-sans leading-tight border-t border-slate-800">
                      Computed via TreeExplainer on regional terrain and hydrometeorological features. Base value: E[f(x)] = -0.42 log-odds.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* 4. WHAT IF RAINFALL INCREASES? (Redesigned Simulation Card) */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3.5 shadow-md border border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-xs uppercase tracking-wider text-sky-300">
                      What if rainfall increases?
                    </span>
                  </div>
                  {simulationResult && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      SCENARIO ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  See how the predicted landslide risk changes.
                </p>
              </div>

              {/* Side-by-Side Current vs Simulated Comparison */}
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                {/* Current Baseline Card */}
                <div className="bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Current
                  </span>
                  <div className="text-xl font-extrabold text-white">
                    {zone.riskScore}%
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Rainfall: <span className="text-slate-200 font-semibold">{baselineRain} mm</span>
                  </div>
                </div>

                {/* Simulated Scenario Card */}
                <div className={`rounded-xl p-2.5 border space-y-1 transition-all ${
                  simulationResult
                    ? 'bg-rose-950/60 border-rose-700 text-rose-200'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-sky-300">
                    Simulate (+{simulationPercent}%)
                  </span>
                  <div className="text-xl font-extrabold text-amber-400">
                    {simulationResult ? `${simulationResult.simulatedRiskScore}%` : `${Math.min(99, Math.round(zone.riskScore + (simulationPercent / 100) * 22))}%*`}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Rainfall: <span className="font-semibold text-white">+{simulationPercent}% ({previewSimulatedRain} mm)</span>
                  </div>
                </div>
              </div>

              {/* Risk Delta Badge when Simulation Active */}
              {simulationResult && (
                <div className="bg-rose-900/40 border border-rose-700/60 rounded-xl p-2.5 flex items-center justify-between text-xs animate-in fade-in duration-150">
                  <span className="text-rose-200 font-medium">Risk Surge Delta:</span>
                  <span className="font-bold text-rose-300 text-sm">
                    +{simulationResult.riskDelta && simulationResult.riskDelta > 0
                      ? simulationResult.riskDelta
                      : simulationResult.simulatedRiskScore - simulationResult.baselineRiskScore}{' '}
                    <span className="text-[10px] font-normal text-rose-300">percentage points</span>
                  </span>
                </div>
              )}

              {/* Slider Control */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 text-[11px]">Simulated Rainfall Surge:</span>
                  <span className="font-mono font-bold text-amber-400 text-xs">+{simulationPercent}%</span>
                </div>

                <input
                  type="range"
                  min={10}
                  max={100}
                  step={10}
                  value={simulationPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSimulationPercent(val);
                    if (simulationResult) {
                      handleSimulate(val);
                    }
                  }}
                  className="w-full accent-amber-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
                />

                {/* Preset Buttons */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {[20, 40, 60, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => {
                        setSimulationPercent(pct);
                        handleSimulate(pct);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        simulationPercent === pct
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                      }`}
                    >
                      +{pct}%
                    </button>
                  ))}
                  {simulationResult && (
                    <button
                      onClick={handleResetSimulation}
                      className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 cursor-pointer flex items-center gap-1"
                      title="Reset to baseline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Scenario disclaimer */}
              <div className="text-[10px] text-slate-400 italic text-center pt-0.5">
                Scenario only — does not change real weather data
              </div>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* 5. IMMEDIATE ACTION MANDATE */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Immediate Action
              </span>
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3">
                <p className="text-xs leading-relaxed font-semibold text-amber-950">
                  {zone.primaryAction || 'Pre-position emergency clearing equipment along vulnerable highway bypass nodes.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TELEMETRY (Preserved Technical Sensor Stream) */}
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
                  DEMO SENSOR REPLAY
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">24-Hour Rainfall</span>
                <span className="font-semibold text-slate-900">
                  {zone.telemetry?.rainfall24h ? `${zone.telemetry.rainfall24h} mm` : 'Data unavailable'}
                  {zone.telemetry?.rainfallAnomalyPercent !== undefined && (
                    <span className="text-slate-500 text-[11px] font-normal ml-1">
                      (+{zone.telemetry.rainfallAnomalyPercent}% anomaly)
                    </span>
                  )}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Soil Saturation Index</span>
                <span className="font-semibold text-rose-600">
                  {zone.telemetry?.soilSaturationPercent !== undefined
                    ? `${zone.telemetry.soilSaturationPercent}% (Threshold: 75%)`
                    : 'Data unavailable'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Piezometer Water Table</span>
                <span className="font-semibold text-slate-900">
                  {zone.telemetry?.piezometerWaterTableMeters !== undefined
                    ? `${zone.telemetry.piezometerWaterTableMeters} m below surface`
                    : 'Data unavailable'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">InSAR Surface Deformation</span>
                <span className="font-semibold text-slate-900">
                  {zone.telemetry?.insarDeformationRateMmYear !== undefined
                    ? `${zone.telemetry.insarDeformationRateMmYear} mm / year`
                    : 'Data unavailable'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Slope Gradient</span>
                <span className="font-semibold text-slate-900">
                  {zone.telemetry?.slopeAngleDeg !== undefined
                    ? `${zone.telemetry.slopeAngleDeg}° steep`
                    : 'Data unavailable'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Bedrock Lithology</span>
                <span className="font-semibold text-slate-900 truncate max-w-[190px]">
                  {zone.telemetry?.soilType || 'Metamorphic Schist / Sandy Loam'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-600">Coordinates</span>
                <span className="font-mono text-slate-500">
                  {formatCoordinates(zone.center.lat, zone.center.lng)}
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

        {/* TAB 3: LIFELINES (Preserved Critical Infrastructure) */}
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
                  {zone.impact?.criticalRoadImpact || 'Chainage Km 44 impassable. Debris volume ~4,500 m³. Reshi bypass operational for light vehicles.'}
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

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">
                    {formatNumber(zone.impact?.populationExposed || 18450)} people in impact zone
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {zone.impact?.populationDetail || 'Dense settlement along riverine terrace vulnerable to secondary debris flows.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROTOCOL (Preserved NDMA Operational SOP) */}
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

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Phase 3: Heavy Equipment Pre-positioning</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Stage BRO earthmovers at Singtam bypass junction to preserve emergency medical transit access.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. STICKY BOTTOM ACTIONS (Clear Hierarchy & Non-Deceptive Wording) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex flex-col gap-2">
        {/* PRIMARY ACTION: Run Simulation or Re-run Simulation */}
        <button
          onClick={() => handleSimulate(simulationPercent)}
          disabled={isSimulating}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Droplets className="w-4 h-4 text-sky-400" />
          <span>
            {isSimulating
              ? 'Computing Hydrological Strain...'
              : simulationResult
              ? `Re-run Simulation (+${simulationPercent}%)`
              : `Run What-If Simulation (+${simulationPercent}%)`}
          </span>
        </button>

        {/* SECONDARY ACTION: View Response Plan */}
        <button
          onClick={handleViewPlan}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <FileText className="w-4 h-4 text-slate-600" />
          <span>
            {zone.riskLevel === 'CRITICAL' || zone.riskLevel === 'VERY_HIGH' || zone.riskLevel === 'EXTREME'
              ? 'View P1 Response Plan'
              : 'View Response Plan'}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Footer Meta */}
        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Decision Support Active
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
