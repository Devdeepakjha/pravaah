import { DataSource } from './riskZone';

export type FieldVerificationStatus = 'VERIFIED' | 'PENDING_REVIEW' | 'FLAGGED';
export type IncidentType = 'SLUMP' | 'ROCKFALL' | 'DEBRIS_FLOW' | 'SUBSIDENCE' | 'TENSION_CRACK';

export interface FieldReport {
  id: string;
  title: string;
  incidentType: IncidentType;
  locationName: string;
  district: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  reporter: {
    name: string;
    role: string; // e.g. "GSI Geologist", "BRO Patrol Unit 12", "Local Ward Warden"
    agency: string;
  };
  status: FieldVerificationStatus;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  observations: string;
  estimatedDebrisVolumeM3?: number;
  affectedCorridor?: string;
  photos?: string[];
  dataSource: DataSource;
}
