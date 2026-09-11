import { RiskZone, RiskLevel } from './riskZone';
import { RoadCorridor } from './roadStatus';
import { FieldReport } from './fieldReport';
import { Infrastructure } from './infrastructure';

export type MonitoredLocationType =
  | 'RISK_ZONE'
  | 'FIELD_REPORT'
  | 'ROAD_BLOCKAGE'
  | 'CRITICAL_INFRASTRUCTURE'
  | 'MONITORED_CORRIDOR';

export interface MonitoredLocation {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: RiskLevel;
  locationType: MonitoredLocationType;
  status: string;
  rainfall: number;
  source: string;
  lastUpdated: string;
  exposure: string;
  relatedRoads: string[];
  relatedInfrastructure: string[];
  rawItem?: RiskZone | RoadCorridor | FieldReport | Infrastructure;
}
