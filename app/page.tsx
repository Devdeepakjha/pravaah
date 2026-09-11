'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowRight,
  Compass,
  MapPin,
  CloudRain,
  Mountain,
  FileText,
  Sliders,
  Users,
  Building2,
  Camera,
  Activity,
  CheckCircle2,
  Layers,
  ChevronRight,
  Sparkles,
  HelpCircle,
  PhoneCall,
  ExternalLink,
  Lock
} from 'lucide-react';

export default function LandingPage() {
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  // Close modal on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRoleModalOpen(false);
    };
    if (roleModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [roleModalOpen]);

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-emerald-500 selection:text-slate-950 antialiased overflow-x-hidden">
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
              P
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-base text-white">PRAVAAH</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  NER AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                Landslide Risk Intelligence
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#problem" className="hover:text-white transition-colors">The Challenge</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#roles" className="hover:text-white transition-colors">Role Experiences</a>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setRoleModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Demo Roles
            </button>
            <Link
              href="/command-center"
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span>Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle animated topographic contour underlay */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="contour-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M 0 40 Q 60 10 120 40 T 240 40" fill="none" stroke="#10b981" strokeWidth="0.75" />
                <path d="M 0 80 Q 60 50 120 80 T 240 80" fill="none" stroke="#34d399" strokeWidth="0.5" />
                <path d="M 0 120 Q 60 90 120 120 T 240 120" fill="none" stroke="#6ee7b7" strokeWidth="0.4" strokeDasharray="3,3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contour-pattern)" />
          </svg>
          <div className="absolute inset-0 bg-radial from-emerald-950/30 via-slate-900/80 to-slate-900"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Hackathon Header Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-semibold text-slate-300 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Smart India Hackathon 2026 · Ministry of Development of North Eastern Region (MDoNER)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            See the risk before the road disappears.
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            AI-powered landslide risk intelligence for the Northeast.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl mx-auto leading-relaxed">
            PRAVAAH combines rainfall, terrain, historical landslide evidence, geospatial intelligence and field observations to help authorities understand risk earlier and act faster.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/command-center"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/20"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Risk Map</span>
            </Link>

            <Link
              href="/citizen"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Check My Area (Citizen)</span>
            </Link>

            <a
              href="#problem"
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 transition-colors"
            >
              How PRAVAAH Works ↓
            </a>
          </div>
        </div>
      </section>

      {/* 3. SCIENTIFIC CREDIBILITY STRIP */}
      <section className="bg-slate-950 border-y border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Verified Scientific Data Provenance
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Landslide Archive</span>
              <span className="text-xs font-bold text-slate-200">ISRO / NRSC Atlas</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Precipitation</span>
              <span className="text-xs font-bold text-slate-200">IMD Gridded Data</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Topography</span>
              <span className="text-xs font-bold text-slate-200">30m SRTM / DEM</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Predictive Engine</span>
              <span className="text-xs font-bold text-slate-200">XGBoost Classifier</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Explainability</span>
              <span className="text-xs font-bold text-slate-200">TreeSHAP Attribution</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Field Evidence</span>
              <span className="text-xs font-bold text-slate-200">Vision Triage Screener</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE PROBLEM SECTION */}
      <section id="problem" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            The Fundamental Gap
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Disaster signals are fragmented.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            In the mountainous terrain of the Northeast, rainfall, terrain steepness, historical scars, road blockades, and field reports exist in separate administrative silos.
          </p>
        </div>

        {/* Visual Fragmentation vs PRAVAAH Synthesis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Fragmented Signals */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
              Traditional Fragmented Reality
            </span>
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>🌧️ IMD Rainfall Forecast</span>
                <span className="text-[10px] text-slate-500">Isolated Weather Bureau</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>⛰️ DEM Topographic Slope</span>
                <span className="text-[10px] text-slate-500">Static GIS Archive</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>🚧 Highway Blockades (NH-10)</span>
                <span className="text-[10px] text-slate-500">Border Roads Patrol Radio</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>📷 Village Ground Observations</span>
                <span className="text-[10px] text-slate-500">Local WhatsApp Photos</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 italic">
              Result: Authorities react after roads collapse; citizens receive generalized regional alerts too late.
            </p>
          </div>

          {/* PRAVAAH Unified Intelligence */}
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                The PRAVAAH Solution
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300">
                Unified Intelligence
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-center space-y-2">
              <div className="text-xs font-bold text-emerald-400 tracking-wider">
                RAW SIGNALS → ML RISK → EXPLANATION → SIMULATION → ACTION
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connects dynamic rainfall with real terrain physics to predict sector failure probabilities, reveal SHAP drivers, simulate surges, and compute safe detours.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Spatial Holdout</span>
                <span className="font-bold text-emerald-400">ROC-AUC: 0.933</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Safe Detour</span>
                <span className="font-bold text-emerald-400">NH-717A Bypass</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOUR CORE CAPABILITIES */}
      <section id="capabilities" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              System Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              What PRAVAAH Actually Does
            </h2>
            <p className="text-sm text-slate-400">
              Four scientifically grounded capabilities bridging machine learning and civil defense.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 01 PREDICT */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <span className="text-2xl font-black text-emerald-400 font-mono">01</span>
              <h3 className="text-lg font-bold text-white tracking-tight">PREDICT</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estimate landslide risk from environmental and terrain conditions using calibrated XGBoost inference.
              </p>
            </div>

            {/* 02 EXPLAIN */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <span className="text-2xl font-black text-emerald-400 font-mono">02</span>
              <h3 className="text-lg font-bold text-white tracking-tight">EXPLAIN</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                See which factors are driving the model's risk estimate via TreeSHAP feature contributions and local physics.
              </p>
            </div>

            {/* 03 SIMULATE */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <span className="text-2xl font-black text-purple-400 font-mono">03</span>
              <h3 className="text-lg font-bold text-white tracking-tight">SIMULATE</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test how changing rainfall conditions (+20%, +40%, +100%) alter hazard scores and civil mandates.
              </p>
            </div>

            {/* 04 RESPOND */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3">
              <span className="text-2xl font-black text-blue-400 font-mono">04</span>
              <h3 className="text-lg font-bold text-white tracking-tight">RESPOND</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prioritize roads, settlements and critical infrastructure via multi-criteria ranking and safe detour routing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ROLE EXPERIENCES (CLEAR SEPARATION) */}
      <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            Tailored Perspectives
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Role-Aware Disaster Intelligence
          </h2>
          <p className="text-sm text-slate-400">
            Citizens receive simple, actionable guidance. Authorities access full geospatial command tools. Field scouts capture verifiable evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Government & Response */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-900/60 text-blue-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Disaster Management Command</h3>
                <p className="text-xs text-slate-400 mt-1">For District Collectors, DDMA, and BRO Highway Engineers</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Full-bleed regional GIS risk map</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Interactive What-If rainfall slider</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>P1/P2/P3 response prioritization matrix</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dijkstra bypass route calculator</span>
                </li>
              </ul>
            </div>
            <Link
              href="/command-center"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Enter Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Field Officer */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-900/60 text-amber-400 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Field Officer Portal</h3>
                <p className="text-xs text-slate-400 mt-1">For Geological Field Scouts, Ward Wardens & Volunteers</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Camera photo & GPS capture</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Computer-vision tension crack screening</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offline report queue with local storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Automatic sync when network restores</span>
                </li>
              </ul>
            </div>
            <Link
              href="/field-intelligence"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Open Field Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Citizen / Public Safety */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Citizen Safety Portal</h3>
                <p className="text-xs text-slate-400 mt-1">For Local Residents, Highway Commuters & Tourists</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Check area risk with village search or GPS</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Plain-language "Why" explanations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Actionable safety checklists</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>24/7 disaster helpline cards (1070 / 112)</span>
                </li>
              </ul>
            </div>
            <Link
              href="/citizen"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Check My Area</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER & DISCLAIMER */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
              P
            </div>
            <span className="font-bold text-slate-300 text-sm">PRAVAAH (प्रवाह)</span>
            <span className="text-slate-600">·</span>
            <span>SIH 2026 Prototype</span>
          </div>

          <p className="text-center md:text-right max-w-xl text-[11px] text-slate-500">
            Scientific Decision Support Prototype. PRAVAAH generates statistical landslide probabilities based on environmental inputs. Always adhere to official advisories issued by District Administration and State Disaster Management Authorities.
          </p>
        </div>
      </footer>

      {/* DEMO ROLE SELECTION MODAL */}
      {roleModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setRoleModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Select Demo Experience</h3>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              For Smart India Hackathon evaluators: Choose a perspective to explore PRAVAAH.
            </p>

            <div className="space-y-2.5 pt-1">
              <Link
                href="/command-center"
                onClick={() => setRoleModalOpen(false)}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 flex items-center gap-3 transition-colors block"
              >
                <Building2 className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-xs">Disaster Management Official</div>
                  <div className="text-[11px] text-slate-400">Full GIS map, What-If simulation & response ranking</div>
                </div>
              </Link>

              <Link
                href="/field-intelligence"
                onClick={() => setRoleModalOpen(false)}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 flex items-center gap-3 transition-colors block"
              >
                <Camera className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-xs">Field Officer</div>
                  <div className="text-[11px] text-slate-400">Hazard photo submission & offline local storage queue</div>
                </div>
              </Link>

              <Link
                href="/citizen"
                onClick={() => setRoleModalOpen(false)}
                className="p-3.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 flex items-center gap-3 transition-colors block"
              >
                <Users className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-xs">Citizen Safety</div>
                  <div className="text-[11px] text-slate-400">Plain-language risk, helplines & detour routing</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
