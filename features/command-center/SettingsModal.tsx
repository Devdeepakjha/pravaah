'use client';

import React, { useState } from 'react';
import { X, Key, Server, Database, CheckCircle2, Globe, Cpu, CloudRain, ShieldCheck, Layers } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'system' | 'gis' | 'model'>('system');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-modal border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">PRAVAAH System Status & Settings</h3>
              <p className="text-[11px] text-slate-500">Service configurations, data provenance & GIS keys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 px-5 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('system')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'system'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Data Provenance & System
          </button>
          <button
            onClick={() => setActiveTab('gis')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'gis'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            GIS & Map Engine
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`pb-2.5 transition-colors cursor-pointer ${
              activeTab === 'model'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            ML Model & Audit
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-5 space-y-4 text-xs max-h-[60vh] overflow-y-auto">
          {activeTab === 'system' && (
            <div className="space-y-3">
              {/* Provenance Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-slate-700" />
                    <span>Runtime Data Mode</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    CALIBRATED REPLAY / DEMO
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Operating with calibrated historical monsoon precipitation archive from IMD and verified ground inventories. Live IMD Grid gateway activates automatically when <code className="bg-slate-200/70 px-1 py-0.5 rounded font-mono text-[10px]">IMD_API_KEY</code> is present.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px]">Backend Service:</span>
                    <span className="font-semibold text-slate-800">{API_BASE_URL}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px]">Weather Cache TTL:</span>
                    <span className="font-semibold text-slate-800">600s (10 mins)</span>
                  </div>
                </div>
              </div>

              {/* Truthful Telemetry Sources */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                  <span>Verified Environmental Sources</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Precipitation:</strong> India Meteorological Department (IMD) daily gridded reanalysis (0.25° resolution).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Terrain & Topography:</strong> 30m SRTM / Copernicus Digital Elevation Model (Horn finite-difference slope & curvature).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Ground Failures:</strong> Geological Survey of India (GSI Bhusanket) & NRSC/ISRO Landslide Atlas.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'gis' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-700" />
                    <span>Primary GIS Engine</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    LEAFLET GIS (ZERO-KEY ACTIVE)
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  High-performance Leaflet engine rendering Esri World Topo Map, Esri Satellite, and OpenStreetMap basemaps with zero watermark and zero API key requirement.
                </p>
              </div>

              {/* Google Maps JavaScript API Key Config */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                <label className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>Optional Google Maps JavaScript API Key</span>
                </label>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  If you prefer Google Maps raster imagery, enter your key below. It will be stored in your browser session:
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
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
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
          )}

          {activeTab === 'model' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-600" />
                    <span>Production Model Architecture</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    XGBOOST v2.0.0
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px]">Spatial Holdout ROC-AUC:</span>
                    <span className="font-bold text-emerald-700">0.933</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px]">Observational Samples:</span>
                    <span className="font-bold text-slate-800">461 verified records</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px]">Model Version:</span>
                    <span className="font-mono text-slate-800 text-[10px]">pravaah-xgb-v1.0-sikkim-ne</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/60">
                    <span className="text-slate-400 block text-[10px]">Explainability:</span>
                    <span className="font-semibold text-slate-800">TreeSHAP Local & Global</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1 leading-relaxed">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Scientific & Operational Integrity Mandate
                </span>
                <p>
                  PRAVAAH outputs represent statistical geomorphic failure probabilities based on terrain gradients and rainfall saturation. Field photo screening is for rapid preliminary triage and does not replace certified geotechnical drilling or official NDMA directives.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Smart India Hackathon 2026 · MDoNER</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
