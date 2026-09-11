'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Building2,
  Users,
  ShieldCheck,
  FileText,
  Loader2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getFieldReports, submitFieldReport } from '@/services/fieldReportService';
import { FieldReport, IncidentType } from '@/types/fieldReport';

export default function FieldIntelligencePage() {
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [offlineReports, setOfflineReports] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Form states
  const [title, setTitle] = useState('Ground Tension Cracks Observation');
  const [incidentType, setIncidentType] = useState<IncidentType>('TENSION_CRACK');
  const [locationName, setLocationName] = useState('Singtam Sector Km 44');
  const [district, setDistrict] = useState('Gangtok');
  const [state, setState] = useState('Sikkim');
  const [latitude, setLatitude] = useState(27.2385);
  const [longitude, setLongitude] = useState(88.5020);
  const [observations, setObservations] = useState('Fresh transverse tension cracks widening along roadway scarp. Colluvial loose gravel.');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<FieldReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Monitor online/offline network status
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline saved queue from localStorage
    const saved = localStorage.getItem('pravaah_offline_reports');
    if (saved) {
      try {
        setOfflineReports(JSON.parse(saved));
      } catch (e) {}
    }

    // Load reports feed
    async function loadReports() {
      const data = await getFieldReports();
      setReports(data);
    }
    loadReports();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
          setFeedbackToast('GPS coordinates updated from device sensor.');
          setTimeout(() => setFeedbackToast(null), 3500);
        },
        () => {
          setFeedbackToast('GPS permission denied. Using manual coordinates.');
          setTimeout(() => setFeedbackToast(null), 3500);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reportData = {
      title,
      incidentType,
      locationName,
      district,
      state,
      latitude,
      longitude,
      observations,
      reporterName: 'Field Officer Patrol 04',
      reporterRole: 'Geological Field Scout',
      reporterAgency: 'Border Roads Organisation / DDMA',
      file: selectedFile || undefined,
    };

    if (!isOnline) {
      // Save offline to local storage
      const queue = [...offlineReports, { ...reportData, id: `offline-${Date.now()}`, timestamp: new Date().toISOString() }];
      setOfflineReports(queue);
      localStorage.setItem('pravaah_offline_reports', JSON.stringify(queue));
      setIsSubmitting(false);
      setFeedbackToast('Report saved locally in offline queue. Will sync when connection returns.');
      setTimeout(() => setFeedbackToast(null), 5000);
      return;
    }

    try {
      const res = await submitFieldReport(reportData);
      setLastSubmitted(res);
      setReports((prev) => [res, ...prev]);
      setFeedbackToast(`Field evidence submitted successfully. Assigned Priority: ${res.aiAnalysis?.operational_priority_influence || 'P1'}`);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      // Fallback save offline
      const queue = [...offlineReports, { ...reportData, id: `offline-${Date.now()}`, timestamp: new Date().toISOString() }];
      setOfflineReports(queue);
      localStorage.setItem('pravaah_offline_reports', JSON.stringify(queue));
      setFeedbackToast('Backend unreachable — report saved securely to offline queue.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedbackToast(null), 5000);
    }
  };

  const handleSyncOffline = async () => {
    if (offlineReports.length === 0) return;
    setIsSyncing(true);
    let successCount = 0;
    const remaining: any[] = [];

    for (const item of offlineReports) {
      try {
        const res = await submitFieldReport(item);
        setReports((prev) => [res, ...prev]);
        successCount++;
      } catch (err) {
        remaining.push(item);
      }
    }

    setOfflineReports(remaining);
    localStorage.setItem('pravaah_offline_reports', JSON.stringify(remaining));
    setIsSyncing(false);
    setFeedbackToast(`Synced ${successCount} offline reports to command center.`);
    setTimeout(() => setFeedbackToast(null), 4000);
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
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Field Officer Portal
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Ground Evidence & Rapid Vision Triage</span>
            </div>
          </Link>

          {/* Network State & Quick Switchers */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online Gateway' : 'Offline Mode'}</span>
            </div>

            <Link
              href="/command-center"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Command Center</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Offline Queue Notification Banner */}
        {offlineReports.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-xs sm:text-sm">
                  {offlineReports.length} pending report{offlineReports.length > 1 ? 's' : ''} saved locally.
                </span>
                <p className="text-[11px] text-amber-700">
                  Reports will persist in device storage until synchronized with district command center.
                </p>
              </div>
            </div>
            <button
              onClick={handleSyncOffline}
              disabled={isSyncing || !isOnline}
              className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        )}

        {/* Feedback Toast */}
        {feedbackToast && (
          <div className="p-3 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Evidence Submission Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Submit Geo-Referenced Ground Hazard</span>
              </h2>
              <p className="text-xs text-slate-500">
                Upload photographs of active tension cracks, debris spill, or slope scarp for computer-vision screening.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observation Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hazard Mechanism</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-800 bg-white"
                  >
                    <option value="TENSION_CRACK">Tension Crack (Crown)</option>
                    <option value="SLUMP">Rotational Slump</option>
                    <option value="DEBRIS_FLOW">Debris Flow Spill</option>
                    <option value="ROCKFALL">Rockfall / Talus</option>
                    <option value="SUBSIDENCE">Roadway Subsidence</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Highway / Landmark Chainage</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              {/* Coordinates & GPS */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">GPS Coordinates</label>
                  <button
                    type="button"
                    onClick={handleUseGPS}
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Autofill Device GPS</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    placeholder="Latitude"
                  />
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    placeholder="Longitude"
                  />
                </div>
              </div>

              {/* Photo Upload Dropzone */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Slope / Crack Photograph</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center">
                    <img src={previewUrl} alt="Slope preview" className="w-full h-full object-cover max-h-48" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[10px] font-semibold hover:bg-slate-900"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
                  >
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <span className="font-bold text-slate-700 block text-xs">Click or tap to capture / upload evidence</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">JPEG, PNG, or WebP (Max 10 MB)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Field Observations</label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Image & Submitting...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Submit to District Emergency Command</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: AI Screening Output & Recent Reports Feed */}
          <div className="lg:col-span-5 space-y-4">
            {/* AI Screening Result (if submitted) */}
            {lastSubmitted?.aiAnalysis && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-200 space-y-2.5 text-xs animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Computer Vision Preliminary Screening</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {lastSubmitted.aiAnalysis.severity} SEVERITY
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-semibold text-slate-800">Operational Priority Influence:</div>
                  <div className="text-amber-700 font-bold">{lastSubmitted.aiAnalysis.operational_priority_influence} — Elevate transit watch</div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Visual Signals Identified</span>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {lastSubmitted.aiAnalysis.evidence?.map((ev, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                  {lastSubmitted.aiAnalysis.disclaimer}
                </p>
              </div>
            )}

            {/* Operational Principle Card */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-950 text-xs space-y-1.5 leading-relaxed">
              <span className="font-bold flex items-center gap-1.5 text-blue-900">
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                Operational Integration Rule
              </span>
              <p className="text-[11px] text-blue-900/90">
                Field evidence elevates operational response priority (P1/P2/P3 ranking) and triggers road diversion protocols, but does not alter the underlying trained XGBoost geomorphic model weights.
              </p>
            </div>

            {/* Recent Ground Reports Feed */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs">Recent Verified Ground Reports</h3>
                <span className="text-[10px] text-slate-400 font-mono">{reports.length} total</span>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {reports.slice(0, 5).map((rep) => (
                  <div key={rep.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[170px]">{rep.title}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {rep.incidentType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{rep.observations}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{rep.district}, {rep.state}</span>
                      <span className="font-semibold text-amber-700">{rep.severity || 'HIGH'} SEVERITY</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
