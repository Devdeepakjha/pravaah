import { DataSource } from './riskZone';

export type InfrastructureType = 
  | 'HOSPITAL' 
  | 'HYDRO_DAM' 
  | 'BRIDGE' 
  | 'TELECOM_TOWER' 
  | 'EVACUATION_SHELTER' 
  | 'MONITORING_PIEZOMETER';

export interface Infrastructure {
  id: string;
  name: string;
  type: InfrastructureType;
  coordinates: {
    lat: number;
    lng: number;
  };
  operationalStatus: 'OPERATIONAL' | 'STANDBY_ALERT' | 'DISRUPTED';
  bufferZoneMeters: number;
  associatedDistrict: string;
  notes: string;
  dataSource: DataSource;
}
