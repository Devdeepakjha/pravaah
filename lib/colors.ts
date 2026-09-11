import { RiskLevel } from '@/types/riskZone';

export const RISK_COLORS: Record<RiskLevel, {
  hex: string;
  fillHex: string;
  fillOpacity: number;
  strokeHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
  dotClass: string;
  label: string;
}> = {
  LOW: {
    hex: '#10B981',
    fillHex: '#10B981',
    fillOpacity: 0.15,
    strokeHex: '#059669',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
    label: 'Low Risk',
  },
  MODERATE: {
    hex: '#F59E0B',
    fillHex: '#F59E0B',
    fillOpacity: 0.18,
    strokeHex: '#D97706',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
    label: 'Moderate Risk',
  },
  HIGH: {
    hex: '#F97316',
    fillHex: '#F97316',
    fillOpacity: 0.22,
    strokeHex: '#EA580C',
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-800',
    borderClass: 'border-orange-200',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    dotClass: 'bg-orange-500',
    label: 'High Risk',
  },
  VERY_HIGH: {
    hex: '#EF4444',
    fillHex: '#EF4444',
    fillOpacity: 0.25,
    strokeHex: '#DC2626',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
    label: 'Very High Risk',
  },
  EXTREME: {
    hex: '#991B1B',
    fillHex: '#991B1B',
    fillOpacity: 0.32,
    strokeHex: '#7F1D1D',
    bgClass: 'bg-rose-100',
    textClass: 'text-rose-900',
    borderClass: 'border-rose-300',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    dotClass: 'bg-rose-700',
    label: 'Extreme Risk',
  },
  CRITICAL: {
    hex: '#EF4444',
    fillHex: '#EF4444',
    fillOpacity: 0.25,
    strokeHex: '#DC2626',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
    label: 'Critical Risk',
  },
};


export const GIS_UI_COLORS = {
  primary: '#0F172A', // Slate-900
  secondary: '#0284C7', // Hydro Blue
  tertiary: '#475569', // Slate-600
  canvas: '#F8FAFC', // Slate-50
  panel: '#FFFFFF',
  border: '#E2E8F0', // Slate-200
  borderDark: '#CBD5E1', // Slate-300
  blockedRoad: '#DC2626',
  bypassRoad: '#10B981',
  normalRoad: '#64748B',
};
