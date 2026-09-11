'use client';

import React, { useEffect } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Compass,
  Building2,
  Droplets,
} from 'lucide-react';
import { MonitoredLocation } from '@/types/monitoredLocation';
import { RISK_COLORS } from '@/lib/colors';

interface OperationalTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'critical' | 'attention';
  criticalLocations: MonitoredLocation[];
  attentionLocations: MonitoredLocation[];
  onSelectLocation: (loc: MonitoredLocation) => void;
  onSwitchMode: (mode: 'critical' | 'attention') => void;
}

export function OperationalTriageModal({
  isOpen,
  onClose,
  mode,
  criticalLocations,
  attentionLocations,
  onSelectLocation,
  onSwitchMode,
}: OperationalTriageModalProps) {
  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentList = mode === 'critical' ? criticalLocations : attentionLocations;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-modal border border-slate-200/90 w-full max-w-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                mode === 'critical'
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-amber-50 border-amber-200 text-amber-600'
              }`}
            >
              {mode === 'critical' ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {mode === 'critical' ? 'Critical Risk Sectors' : 'Areas Requiring Attention'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    mode === 'critical'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {mode === 'critical' ? `${criticalLocations.length} Critical` : `${attentionLocations.length} Attention`}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {mode === 'critical'
                  ? 'Priority-1 geomorphic hazard zones and impassable arterial blockades'
                  : `Showing ${attentionLocations.length} of ${attentionLocations.length} monitored locations requiring active surveillance`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-3 text-xs">
          <button
            onClick={() => onSwitchMode('critical')}
            className={`pb-2.5 font-semibold transition-all border-b-2 cursor-pointer ${
              mode === 'critical'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Critical Areas ({criticalLocations.length})
          </button>
          <button
            onClick={() => onSwitchMode('attention')}
            className={`pb-2.5 font-semibold transition-all border-b-2 cursor-pointer ${
              mode === 'attention'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            All Attention Areas ({attentionLocations.length})
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto custom-scroll p-4 sm:p-5 space-y-3">
          {currentList.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-semibold text-slate-800 text-sm">
                No {mode === 'critical' ? 'critical' : 'attention'} areas currently identified.
              </p>
              <p className="text-xs text-slate-500">
                All monitored slopes and transit corridors are within nominal thresholds.
              </p>
            </div>
          ) : mode === 'critical' ? (
            /* CRITICAL AREAS VIEW (Detailed Visual Cards) */
            <div className="space-y-3">
              {currentList.map((loc, idx) => {
                const colorMeta = RISK_COLORS[loc.riskLevel] || RISK_COLORS.HIGH;

                return (
                  <div
                    key={loc.id}
                    className="p-4 rounded-xl border border-rose-200/90 bg-rose-50/20 hover:bg-rose-50/40 hover:border-rose-300 transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm tracking-tight">{loc.name}</h4>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${colorMeta.badgeClass}`}
                            >
                              {loc.riskScore}% · {loc.riskLevel.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {loc.district}, {loc.state} · {loc.status}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onSelectLocation(loc);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>Focus on map</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="pl-9 space-y-1 text-xs text-slate-700">
                      <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed font-medium">
                        {loc.exposure || 'Elevated geomorphic failure probability under active rainfall surge.'}
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5 flex-wrap">
                        {loc.rainfall > 0 && (
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Droplets className="w-3.5 h-3.5 text-sky-500" />
                            Rainfall: {loc.rainfall} mm
                          </span>
                        )}
                        <span>Source: {loc.source}</span>
                        <span>Updated: {loc.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ATTENTION AREAS VIEW (Structured Compact Matrix) */
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <span className="col-span-4">Location / Sector</span>
                <span className="col-span-2 text-center">Risk Score</span>
                <span className="col-span-4">Hazard Indicator / Issue</span>
                <span className="col-span-2 text-right">Action</span>
              </div>

              {currentList.map((loc, idx) => {
                const colorMeta = RISK_COLORS[loc.riskLevel] || RISK_COLORS.MODERATE;
                const priority =
                  loc.riskScore >= 70 || loc.status.includes('BLOCKED')
                    ? 'P1'
                    : loc.riskScore >= 40
                    ? 'P2'
                    : 'P3';

                return (
                  <div
                    key={loc.id}
                    className="p-3 sm:py-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 transition-all flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center text-xs"
                  >
                    {/* Location Name & District */}
                    <div className="sm:col-span-4 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 w-4">{idx + 1}.</span>
                      <div className="truncate">
                        <div className="font-bold text-slate-900 truncate">{loc.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {loc.district} · {loc.locationType.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Risk Score */}
                    <div className="sm:col-span-2 flex sm:justify-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${colorMeta.badgeClass}`}
                      >
                        {loc.riskScore}% {priority}
                      </span>
                    </div>

                    {/* Hazard Note */}
                    <div className="sm:col-span-4 text-slate-600 text-[11px] truncate">
                      {loc.exposure || loc.status}
                    </div>

                    {/* Focus Button */}
                    <div className="sm:col-span-2 flex justify-end">
                      <button
                        onClick={() => {
                          onSelectLocation(loc);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Focus</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Official Operational Surveillance Record</span>
          <span className="font-mono text-slate-600">
            Showing {currentList.length} of {currentList.length} records
          </span>
        </div>
      </div>
    </div>
  );
}
