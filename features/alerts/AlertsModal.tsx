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
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-modal border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">Operational Alert Simulation</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  DEMO / PREVIEW
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Civil defense advisories linked to monitored risk zones</p>
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
        <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3">
          {/* Notification Preview Testing Card */}
          <AlertPreviewSection />

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-1 flex items-center justify-between">
            <span>Current Monitored Bulletins</span>
            <span className="text-[10px] font-normal lowercase text-slate-400">({alerts.length} active advisories)</span>
          </div>

          {alerts.map((alert) => {
            const colorMeta = RISK_COLORS[alert.severity] || RISK_COLORS['HIGH'];
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
                    {alert.severity} · {alert.code || 'ALERT'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{alert.issuedAt || 'Active'}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{alert.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">{alert.targetRegion}</p>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {alert.recommendedAction || alert.actionMandate}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{alert.issuingAuthority || 'State Disaster Management Authority'}</span>
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

function AlertPreviewSection() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [channel, setChannel] = React.useState<'sms' | 'web'>('sms');
  const [previewData, setPreviewData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const handleFetchPreview = async () => {
    setLoading(true);
    try {
      const { previewAlert } = await import('@/services/alertService');
      const data = await previewAlert('zone-east-sikkim', channel);
      setPreviewData(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2.5 border border-slate-800 text-xs">
      {/* Simulation Notice Banner */}
      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
        <span className="font-bold tracking-wide">DEMO / PREVIEW ONLY</span>
        <span className="text-[10px] text-amber-200/80">No external SMS will be transmitted</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-sky-400 text-[11px]">
          <BellRing className="w-3.5 h-3.5" />
          <span>Broadcast Notification Engine (Simulation / Preview)</span>
        </div>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && !previewData) handleFetchPreview();
          }}
          className="text-[10px] text-sky-300 hover:text-white underline cursor-pointer"
        >
          {isOpen ? 'Hide Test Panel' : 'Test Alert Preview'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-2 pt-1 border-t border-slate-800 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target Channel:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setChannel('sms');
                  handleFetchPreview();
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  channel === 'sms' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                SMS Broadcast
              </button>
              <button
                onClick={() => {
                  setChannel('web');
                  handleFetchPreview();
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  channel === 'web' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Web Push
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-3 text-center text-slate-400 text-[11px]">Generating CAP notification payload...</div>
          ) : previewData ? (
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[10px]">
              <div className="flex justify-between text-slate-400 border-b border-slate-900 pb-1">
                <span>Sender: {previewData.payload?.sender_id || 'NDMA-PRAVAH'}</span>
                <span className="text-amber-400">{previewData.carrier_status}</span>
              </div>
              <div className="text-slate-200 leading-relaxed font-sans text-[11px]">
                {previewData.payload?.message_body || previewData.payload?.body}
              </div>
              <div className="text-[9px] text-slate-500 italic pt-0.5">
                {previewData.disclaimer}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
