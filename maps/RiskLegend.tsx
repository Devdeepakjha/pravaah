'use client';

import React from 'react';

interface RiskLegendProps {
  className?: string;
}

export function RiskLegend({ className = '' }: RiskLegendProps) {
  return (
    <div
      className={`flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-floating border border-slate-200/80 text-xs font-medium text-slate-700 pointer-events-auto select-none ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
        <span>Critical (&gt;80%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
        <span>High (50–80%)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
        <span>Moderate (&lt;50%)</span>
      </div>
      <span className="text-slate-300">|</span>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-1 bg-rose-600 rounded"></span>
        <span>Road Blockade</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3.5 h-1 border-b-2 border-emerald-500 border-dashed"></span>
        <span>Bypass Corridor</span>
      </div>
    </div>
  );
}
