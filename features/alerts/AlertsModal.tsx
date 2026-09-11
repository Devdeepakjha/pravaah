'use client';

import React from 'react';
import { X, ShieldAlert, Clock, ChevronRight, BellRing } from 'lucide-react';
import { Alert } from '@/types/alert';
import { RISK_COLORS } from '@/lib/colors';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
}

export function AlertsModal({ isOpen, onClose, alerts, onSelectAlert }: AlertsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-modal border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Active Civil Defense Advisories</h3>
              <p className="text-[11px] text-slate-500">Live operational alerts across Northeast India</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.map((alert) => {
            const colorMeta = RISK_COLORS[alert.severity];
            return (
              <div
                key={alert.id}
                onClick={() => {
                  onSelectAlert(alert);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${colorMeta.badgeClass}`}
                  >
                    {alert.severity} · {alert.code}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{alert.issuedAt}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{alert.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">{alert.targetRegion}</p>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {alert.recommendedAction}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{alert.issuingAuthority}</span>
                  <span className="text-slate-800 font-medium flex items-center gap-0.5">
                    Focus on map <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
