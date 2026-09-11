export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'EXTREME' | 'CRITICAL';
export type RiskTrend = 'INCREASING' | 'STABLE' | 'DECREASING';
export type DataSource = 'DEMO_SIMULATION' | 'LIVE_TELEMETRY';

export interface MLPredictionFactor {
  feature: string;
  label: string;
  value: number;
  impact: number;
  impact_pct: number;
  direction: 'elevating' | 'suppressing';
  description: string;
}

export interface MLPredictionDetail {
  grid_id: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_level: string;
  rain_24h: number;
  rain_72h: number;
  rain_7d: number;
  slope: number;
  elevation: number;
  model_version: string;
  prediction_time: string;
  top_factors: MLPredictionFactor[];
}

export interface HazardDriver {
  id: string;
  name: string;
  severity: RiskLevel;
  headline: string; // e.g., "Extreme (+46% anomaly)"
  value: number;
  unit: string;
  category: 'rainfall' | 'soil_saturation' | 'slope' | 'seismic' | 'insar';
  detailNote?: string;
}

export interface ExposedLifelines {
  populationExposed: number;
  populationDetail: string;
  criticalRoadImpact: string;
  facilitiesExposed: string;
  activeBlockadesCount: number;
}

export interface ZoneTelemetry {
  rainfall24h: number; // mm
  rainfallAnomalyPercent: number; // %
  soilSaturationPercent: number; // %
  piezometerWaterTableMeters: number; // m
  insarDeformationRateMmYear: number; // mm/yr
  slopeAngleDeg: number; // degrees
  soilType: string;
}

export interface RiskZone {
  id: string;
  name: string;
  district: string;
  state: string;
  basin: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  trend: RiskTrend;
  trendRate: string; // e.g., "↑ 14% in 24h"
  center: {
    lat: number;
    lng: number;
  };
  polygon: Array<{ lat: number; lng: number }>;
  topDrivers: [HazardDriver, HazardDriver, HazardDriver]; // Strictly top 3 drivers for overview
  impact: ExposedLifelines;
  primaryAction: string; // Single clear operational mandate
  telemetry: ZoneTelemetry;
  dataSource: DataSource;
  updatedAt: string;
  mlPrediction?: MLPredictionDetail;
}

