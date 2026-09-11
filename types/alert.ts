import { DataSource, RiskLevel } from './riskZone';

export interface Alert {
  id: string;
  code: string; // e.g., "NDMA-SK-2026-04"
  severity: RiskLevel;
  title: string;
  targetRegion: string;
  issuedAt: string;
  expiresAt: string;
  issuingAuthority: string; // e.g. "State Disaster Management Authority (SSDMA)"
  summary: string;
  recommendedAction: string;
  actionMandate?: string;
  message?: string;
  channels?: string[];
  isBroadcasting: boolean;
  dataSource: DataSource;
}

export interface SituationOverview {
  criticalZonesCount: number;
  attentionZonesCount: number;
  totalMonitoredZones: number;
  sensorsOnlinePercentage: number;
  activeBlockadesCount: number;
  lastUpdated: string;
  dataSource: DataSource;
}
