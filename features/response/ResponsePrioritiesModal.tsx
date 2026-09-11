'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Compass,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ExternalLink,
  Navigation,
  Loader2
} from 'lucide-react';
import { getResponsePriorities, IncidentPriorityItem } from '@/services/responseService';
import { calculateAlternativeRoute } from '@/services/roadStatusService';

interface ResponsePrioritiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectZoneId?: (zoneId: string) => void;
  onShowRoutePlan?: (routePlan: any) => void;
}

export function ResponsePrioritiesModal({
  isOpen,
  onClose,
  onSelectZoneId,
  onShowRoutePlan,
}: ResponsePrioritiesModalProps) {
  const [incidents, setIncidents] = useState<IncidentPriorityItem[]>([]);
  const [summary, setSummary] = useState<{ p1_count: number; p2_count: number; p3_count: number }>({
    p1_count: 0,
    p2_count: 0,
    p3_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'P1' | 'P2' | 'P3'>('ALL');
  const [computingRoute, setComputingRoute] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    async function loadPriorities() {
      setLoading(true);
      try {
        const data = await getResponsePriorities();
        setIncidents(data.incidents || []);
        setSummary(data.summary || { p1_count: 0, p2_count: 0, p3_count: 0 });
      } finally {
        setLoading(false);
      }
    }
    loadPriorities();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredIncidents = incidents.filter((inc) => {
    if (activeFilter === 'ALL') return true;
    return inc.priority === activeFilter;
  });

  const handleInspectRoute = async (incident: IncidentPriorityItem) => {
    setComputingRoute(incident.id);
    try {
      const plan = await calculateAlternativeRoute('sevoke', 'gangtok');
      onShowRoutePlan?.(plan);
      onSelectZoneId?.(incident.zoneId);
      onClose();
    } finally {
      setComputingRoute(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200/80 w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Operational Incident Response Prioritization
              </h2>
              <p className="text-[11px] text-slate-500">
                Multi-criteria decision support ranking (Risk + Exposure + Lifelines + Field Evidence)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Filter Bar */}
        <div className="px-5 py-2.5 bg-slate-100/60 border-b border-slate-200/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({incidents.length})
            </button>
            <button
              onClick={() => setActiveFilter('P1')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'P1'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              P1 Immediate ({summary.p1_count})
            </button>
            <button
              onClick={() => setActiveFilter('P2')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'P2'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              P2 High ({summary.p2_count})
            </button>
            <button
              onClick={() => setActiveFilter('P3')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'P3'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 bg-slate-200/60 hover:bg-slate-200'
              }`}
            >
              P3 Monitor ({summary.p3_count})
            </button>
          </div>
          <span className="text-[11px] text-slate-400">
            Decision support, not autonomous dispatch
          </span>
        </div>

        {/* Modal Body: Ranked Incidents */}
        <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-3.5 text-xs">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              <span>Evaluating multi-criteria response matrix...</span>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No incidents matching priority filter '{activeFilter}'.
            </div>
          ) : (
            filteredIncidents.map((incident) => {
              const isP1 = incident.priority === 'P1';
              const isP2 = incident.priority === 'P2';

              return (
                <div
                  key={incident.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isP1
                      ? 'border-rose-200 bg-rose-50/30'
                      : isP2
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${
                            isP1
                              ? 'bg-rose-600 text-white'
                              : isP2
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          {incident.priorityLabel}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          {incident.zoneName}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {incident.district}, {incident.state} · {incident.basin}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900">
                        {incident.riskScore}%
                      </div>
                      <div className="text-[10px] font-semibold text-rose-600">
                        {incident.riskLevel} RISK
                      </div>
                    </div>
                  </div>

                  {/* Why this priority was assigned */}
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-700">
                      Why this priority was assigned:
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {incident.reasons.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-slate-400 mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Action Mandate */}
                  <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-[11px]">Recommended Operational Action: </span>
                      <span className="text-slate-700 text-[11px] leading-relaxed">
                        {incident.recommendedAction}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        onSelectZoneId?.(incident.zoneId);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>Focus on Map</span>
                    </button>

                    <button
                      onClick={() => handleInspectRoute(incident)}
                      disabled={computingRoute === incident.id}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {computingRoute === incident.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Routing...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3 h-3 text-emerald-400" />
                          <span>Show Alternative Route</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
