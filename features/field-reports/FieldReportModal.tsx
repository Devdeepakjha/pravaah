'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MapPin,
  ShieldAlert,
  Loader2,
  FileText
} from 'lucide-react';
import { FieldReport, IncidentType } from '@/types/fieldReport';
import { RiskZone } from '@/types/riskZone';
import { submitFieldReport } from '@/services/fieldReportService';

interface FieldReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (report: FieldReport) => void;
  activeZone?: RiskZone | null;
}

export function FieldReportModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  activeZone,
}: FieldReportModalProps) {
  const [title, setTitle] = useState(
    activeZone ? `Slope Tension Cracks - ${activeZone.name}` : 'Ground Crack / Slump Observation'
  );
  const [incidentType, setIncidentType] = useState<IncidentType>('SLUMP');
  const [locationName, setLocationName] = useState(
    activeZone ? `${activeZone.name} Upper Ridge` : 'Singtam Sector Km 44'
  );
  const [district, setDistrict] = useState(activeZone ? activeZone.district : 'Gangtok');
  const [lat, setLat] = useState<number>(activeZone ? activeZone.center.lat : 27.2405);
  const [lng, setLng] = useState<number>(activeZone ? activeZone.center.lng : 88.5040);
  const [observations, setObservations] = useState(
    'Fresh transverse tension cracks widening along the upper scarp. Visible surface runoff and loose colluvial gravel.'
  );
  const [reporterName, setReporterName] = useState('Field Officer / Citizen Volunteer');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<FieldReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('incident_type', incidentType);
      formData.append('location_name', locationName);
      formData.append('district', district);
      formData.append('state', 'Sikkim');
      formData.append('latitude', lat.toString());
      formData.append('longitude', lng.toString());
      formData.append('observations', observations);
      formData.append('reporter_name', reporterName);
      formData.append('reporter_role', 'Ward Emergency Warden');
      formData.append('reporter_agency', 'District Disaster Response Force');
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const report = await submitFieldReport(formData);
      setSubmittedReport(report);
      onSubmitSuccess?.(report);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-floating border border-slate-200/80 w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col my-auto">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Submit Ground Hazard Evidence
              </h2>
              <p className="text-[11px] text-slate-500">
                Geo-tagged photo intelligence with AI-assisted preliminary visual screening
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-5 space-y-4 text-xs">
          {submittedReport ? (
            /* Success View with AI Analysis Result */
            <div className="space-y-4 py-2 animate-in zoom-in-95 duration-150">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-emerald-900">
                    Field Intelligence Submitted & Verified
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Report <span className="font-mono font-bold">{submittedReport.id}</span> has been logged to the operational incident stream.
                  </p>
                </div>
              </div>

              {/* AI Vision Analysis Results */}
              {submittedReport.aiAnalysis && (
                <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Visual Evidence Screening</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      SEVERITY: {submittedReport.aiAnalysis.severity}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] text-slate-300 font-semibold">Detected Visual Indicators:</div>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {submittedReport.aiAnalysis.evidence.map((ev, i) => (
                        <li key={i} className="flex items-start gap-2 bg-slate-800/80 p-2 rounded border border-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-rose-900/40 border border-rose-700/60 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-rose-200 font-medium">Operational Priority Impact:</span>
                    <span className="font-bold text-rose-100 bg-rose-800 px-2 py-0.5 rounded">
                      ESCALATED TO {submittedReport.aiAnalysis.operational_priority_influence || 'P1'}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    {submittedReport.aiAnalysis.disclaimer}
                  </p>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Return to Operational Map
              </button>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Photo Upload Zone */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Slope / Failure Photograph</span>
                  <span className="text-[10px] text-slate-400 font-normal">JPEG, PNG, WebP (Max 10MB)</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-300 h-44 bg-slate-100 group">
                    <img
                      src={previewUrl}
                      alt="Field evidence preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-semibold text-xs shadow-md hover:bg-slate-50 cursor-pointer"
                      >
                        Change Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-slate-50/60 hover:bg-slate-100/60 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-500">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <span className="font-semibold text-slate-800">Click to upload slope photo</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">Captures tension cracks, road collapse, or mudflow</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Incident Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Observation Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Failure Mechanism</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs cursor-pointer"
                  >
                    <option value="SLUMP">Rotational / Planar Slump</option>
                    <option value="ROCKFALL">Rockfall / Escarpment Toppling</option>
                    <option value="DEBRIS_FLOW">Debris Flow / Torrent Mudflow</option>
                    <option value="TENSION_CRACK">Crown Tension Fracture</option>
                    <option value="SUBSIDENCE">Roadway / Berm Subsidence</option>
                  </select>
                </div>
              </div>

              {/* Location & GPS Coordinates */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1 col-span-1">
                  <label className="font-semibold text-slate-700">Landmark</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Detailed Observations */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Field Observations</label>
                <textarea
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Describe crack length, seepage, road blocking, or tree tilting..."
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs resize-none"
                />
              </div>

              {/* Scientific Safety Disclaimer */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Operational Rule:</strong> Field reports elevate the sector's operational response priority (P1/P2/P3), but do NOT alter trained geomorphic model weights.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Running CV Analysis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-sky-300" />
                      <span>Submit & Screen Evidence</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
