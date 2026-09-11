import { DataSource } from './riskZone';

export type RoadCondition = 'CLEAR' | 'RESTRICTED' | 'BLOCKED' | 'BYPASS_ACTIVE';

export interface BlockadeDetail {
  segmentId: string;
  chainageKm: string; // e.g., "Km 44"
  landmark: string; // e.g., "Between Singtam and Rangpo"
  debrisFlowLengthMeters: number; // e.g., 80
  passability: 'IMPASSABLE_ALL' | 'LIGHT_VEHICLES_ONLY' | 'HEAVY_RESTRICTED';
  cause: string;
  estimatedClearanceHours: number;
  activeMachinery: string[];
}

export interface RoadCorridor {
  id: string;
  code: string; // e.g., "NH-10"
  name: string; // e.g., "Siliguri - Gangtok Corridor"
  status: RoadCondition;
  state: string;
  path: Array<{ lat: number; lng: number }>;
  isBypass?: boolean;
  blockade?: BlockadeDetail;
  dataSource: DataSource;
}
