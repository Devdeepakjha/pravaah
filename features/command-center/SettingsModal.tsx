'use client';

import React, { useState } from 'react';
import { X, Key, Server, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { IS_LIVE_API_ENABLED, API_BASE_URL } from '@/services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('pravaah_google_maps_key') || '' : ''
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pravaah_google_maps_key', apiKeyInput.trim());
      setSavedKey(apiKeyInput.trim());
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl shadow-modal border border-slate-200/90 w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">GIS Engine & API Settings</h3>
              <p className="text-[11px] text-slate-500">Service configurations & credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Data Environment Status */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-slate-600" />
                <span>Backend Telemetry Stream</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                {IS_LIVE_API_ENABLED ? 'LIVE API' : 'SIMULATION MODE'}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Currently running isolated Northeast India geohazard simulation data. Ready to connect to FastAPI endpoint via <code className="bg-slate-200/60 px-1 py-0.5 rounded font-mono text-[10px]">NEXT_PUBLIC_API_URL</code>.
            </p>
          </div>

          {/* Google Maps JavaScript API Key Config */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>Google Maps JavaScript API Key</span>
            </label>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Google Maps architecture is active. You can enter an API key below or set <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">.env.local</code>.
            </p>
            <div className="flex gap-2 pt-1">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={savedKey ? '••••••••••••••••••••' : 'AIzaSy...'}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
              />
              <button
                onClick={handleSaveKey}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Save
              </button>
            </div>
            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px] pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Key saved. Reloading GIS engine...</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
