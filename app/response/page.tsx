'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Navigation,
  MapPin,
  CheckCircle2,
  Users,
  Activity,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { getResponsePriorities, IncidentPriorityItem } from '@/services/responseService';
import { calculateAlternativeRoute } from '@/services/roadStatusService';

export default function ResponsePage() {
  const [incidents, setIncidents] = useState<IncidentPriorityItem[]>([]);
  const [summary, setSummary] = useState({ p1_count: 0, p2_count: 0, p3_count: 0 });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'P1' | 'P2' | 'P3'>('ALL');
  const [routePlan, setRoutePlan] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getResponsePriorities();
        setIncidents(data.incidents || []);
        setSummary(data.summary || { p1_count: 0, p2_count: 0, p3_count: 0 });
        const plan = await calculateAlternativeRoute('sevoke', 'gangtok');
        setRoutePlan(plan);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = incidents.filter((inc) => {
    if (activeFilter === 'ALL') return true;
    return inc.priority === activeFilter;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-slate-900 tracking-tight text-sm">PRAVAAH</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Response Engine
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Incident Prioritization & Lifeline Routing</span>
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
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-emerald-600" />
              <span>Operational Incident Response Prioritization</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Multi-criteria decision support ranking: <strong>Risk Score + Population Exposure + Critical Lifelines + Field Ground Evidence</strong>
            </p>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              All Incidents ({incidents.length})
            </button>
            <button
              onClick={() => setActiveFilter('P1')}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                activeFilter === 'P1'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
              }`}
            >
              P1 Immediate ({summary.p1_count})
            </button>
            <button
              onClick={() => setActiveFilter('P2')}
              className={`px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                activeFilter === 'P2'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
              }`}
            >
              P2 High ({summary.p2_count})
            </button>
          </div>
        </div>

        {/* Lifeline Highway Choke Point & Detour Card */}
        {routePlan && (
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Navigation className="w-4 h-4" />
                <span>Active Lifeline Highway Choke Point & Detour Solver</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Dijkstra Shortest-Path Avoidance
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Compromised Corridor */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-rose-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-rose-400">
                    {routePlan.primaryRoute?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                    IMPASSABLE BLOCKADE
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {routePlan.primaryRoute?.blockade?.landmark}: {routePlan.primaryRoute?.blockade?.cause}
                </p>
                <div className="text-[11px] text-slate-400">
                  Standard Transit: {routePlan.primaryRoute?.distanceKm} km ({routePlan.primaryRoute?.estimatedTimeMins} mins)
                </div>
              </div>

              {/* Safe Alternative Detour */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-emerald-400">
                    {routePlan.alternativeRoute?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    ACTIVE SAFE BYPASS
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Diverts transit through Kalimpong, Algarah, Reshi Border Gate, and Pakyong Strategic Interchange.
                </p>
                <div className="text-[11px] text-emerald-300 font-semibold flex gap-3">
                  <span>Distance: {routePlan.alternativeRoute?.distanceKm} km (+{routePlan.alternativeRoute?.distanceDeltaKm} km)</span>
                  <span>•</span>
                  <span>Time: {routePlan.alternativeRoute?.estimatedTimeMins} mins (+{routePlan.alternativeRoute?.timeDeltaMins} mins)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-slate-400">{routePlan.advisory}</span>
              <Link
                href="/command-center"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>View on GIS Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Prioritized Incidents Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Prioritized Emergency Sectors ({filtered.length})
            </h2>
            <span className="text-xs text-slate-500">Autonomous decision support queue</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filtered.map((inc) => (
              <div
                key={inc.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                        inc.priority === 'P1'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : inc.priority === 'P2'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {inc.priority} — {inc.priorityLabel.split('—')[1]?.trim() || inc.priority}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{inc.zoneName}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 font-medium">{inc.district}, {inc.state}</span>
                    <span className="font-black text-slate-900 text-sm">{inc.riskScore}% Risk</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1.5">
                      Multi-Factor Decision Drivers
                    </span>
                    <ul className="space-y-1 text-slate-600">
                      {inc.reasons?.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                        Recommended Operational Mandate
                      </span>
                      <p className="font-semibold text-slate-900 text-xs leading-relaxed">
                        {inc.primaryAction || inc.recommendedAction}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        Exposed Pop: <strong>{inc.populationExposed?.toLocaleString()}</strong> · Active Blockades: <strong>{inc.activeBlockades}</strong>
                      </span>
                      <Link
                        href={`/command-center?zone=${inc.zoneId}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>Focus Zone on Map</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
