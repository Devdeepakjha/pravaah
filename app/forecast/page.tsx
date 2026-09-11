'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sliders,
  CloudRain,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Building2,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import { getRiskZones } from '@/services/riskZoneService';
import { simulateScenario } from '@/services/scenarioService';
import { RiskZone } from '@/types/riskZone';

export default function ForecastPage() {
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [simulationPercent, setSimulationPercent] = useState(40);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getRiskZones();
      setRiskZones(data);
      const eastSikkim = data.find((z) => z.id === 'zone-east-sikkim') || data[0];
      if (eastSikkim) {
        setSelectedZone(eastSikkim);
        runSim(eastSikkim.id, 40);
      }
    }
    load();
  }, []);

  const runSim = async (zoneId: string, deltaPct: number) => {
    setIsSimulating(true);
    try {
      const res = await simulateScenario({
        zone_id: zoneId,
        rainfall_delta_percent: deltaPct,
        scenario_type: 'MONSOON_SURGE'
      });
      setSimulationResult(res);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSliderChange = (val: number) => {
    setSimulationPercent(val);
    if (selectedZone) {
      runSim(selectedZone.id, val);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-slate-900 tracking-tight text-sm">PRAVAAH</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                  Simulation Sandbox
                </span>
              </div>
              <span className="text-[10px] text-slate-500">What-If Rainfall Surge & Risk Delta Analysis</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/command-center"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Enter Map Command Center</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Title Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Sliders className="w-6 h-6 text-purple-600" />
              <span>What-If Rainfall Hazard Simulation</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Test how sudden monsoon cloudbursts alter model risk predictions and civilian infrastructure exposure.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
            SCENARIO MODELING · NOT A WEATHER FORECAST
          </div>
        </div>

        {/* Zone Selector */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Select Monitored Sector</label>
          <div className="flex flex-wrap gap-2">
            {riskZones.map((z) => (
              <button
                key={z.id}
                onClick={() => {
                  setSelectedZone(z);
                  runSim(z.id, simulationPercent);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedZone?.id === z.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {z.name}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Hero Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monsoon Precipitation Surge Slider</h3>
              <p className="text-xs text-slate-500">Alter baseline precipitation to evaluate slope pore pressure reaction</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-purple-600">
                {simulationPercent > 0 ? `+${simulationPercent}%` : `${simulationPercent}%`}
              </span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase">Rainfall Delta</span>
            </div>
          </div>

          {/* Slider input */}
          <input
            type="range"
            min="-50"
            max="150"
            step="5"
            value={simulationPercent}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-bold">
            <span className="text-slate-400 text-[11px]">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleSliderChange(0)}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset (0%)</span>
              </button>
              <button
                onClick={() => handleSliderChange(20)}
                className="px-3 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 cursor-pointer"
              >
                +20% Moderate
              </button>
              <button
                onClick={() => handleSliderChange(40)}
                className="px-3 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 cursor-pointer"
              >
                +40% Heavy
              </button>
              <button
                onClick={() => handleSliderChange(60)}
                className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
              >
                +60% Severe
              </button>
              <button
                onClick={() => handleSliderChange(100)}
                className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 cursor-pointer"
              >
                +100% Cloudburst
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Comparison Matrix */}
        {simulationResult && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span>Simulation Impact Analysis — {simulationResult.zone_name}</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Model: {simulationResult.model_version}
              </span>
            </div>

            {/* Score Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Baseline Risk</span>
                <span className="text-2xl font-black text-slate-800 block mt-1">
                  {simulationResult.baseline_risk_score}%
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {simulationResult.baseline_risk_level} · 24h Rain: {simulationResult.baseline_rain_24h}mm
                </span>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wider block">Projected Risk</span>
                <span className="text-2xl font-black text-purple-900 block mt-1">
                  {simulationResult.simulated_risk_score}%
                </span>
                <span className="text-[11px] font-semibold text-purple-700">
                  {simulationResult.simulated_risk_level} · 24h Rain: {simulationResult.simulated_rain_24h}mm
                </span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-amber-700 text-[10px] font-bold uppercase tracking-wider block">Risk Delta</span>
                <span className="text-2xl font-black text-amber-900 block mt-1">
                  {simulationResult.risk_delta > 0 ? `+${simulationResult.risk_delta}%` : `${simulationResult.risk_delta}%`}
                </span>
                <span className="text-[11px] font-semibold text-amber-700">
                  Response: {simulationResult.changed_response_priority?.split('—')[0]?.trim() || 'P1'}
                </span>
              </div>
            </div>

            {/* Operational Mandate Recommendation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                Simulated Civil Defense Advisory
              </span>
              <p className="font-semibold text-slate-800 leading-relaxed">
                {simulationResult.operational_recommendation}
              </p>
            </div>

            {/* Infrastructure Exposure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Impacted Roadways & Lifelines
                </span>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  {simulationResult.affected_infrastructure?.map((infra: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{infra}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Vulnerable Settlement Pockets
                </span>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  {simulationResult.affected_villages?.map((v: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Link
                href={`/command-center?zone=${simulationResult.zone_id}`}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
              >
                <span>Inspect Scenario on Command Center Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Forecast Simulation Footer */}
      <footer className="mt-auto py-8 px-4 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white/60">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="font-semibold text-slate-600">
            PRAVAAH Simulation Sandbox · XGBoost Landslide Risk Inference
          </p>
          <p className="text-[11px] text-slate-400">
            Real-time sensitivity analysis for dynamic pore-pressure and rainfall surges · SIH 2026 / MDoNER
          </p>
        </div>
      </footer>
    </div>
  );
}
