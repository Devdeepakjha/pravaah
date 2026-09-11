import { Infrastructure } from '@/types/infrastructure';

export const MOCK_INFRASTRUCTURE: Infrastructure[] = [
  {
    id: 'infra-singtam-hospital',
    name: 'Singtam District Sub-Hospital',
    type: 'HOSPITAL',
    coordinates: {
      lat: 27.2360,
      lng: 88.5020,
    },
    operationalStatus: 'STANDBY_ALERT',
    bufferZoneMeters: 450,
    associatedDistrict: 'East Sikkim',
    notes: 'In 450m peripheral buffer zone. Generator fuel topped to 96h; emergency trauma triage standby.',
    dataSource: 'DEMO_SIMULATION',
  },
  {
    id: 'infra-teesta-v-dam',
    name: 'Teesta Stage V Hydro Dam (NHPC)',
    type: 'HYDRO_DAM',
    coordinates: {
      lat: 27.2020,
      lng: 88.5150,
    },
    operationalStatus: 'OPERATIONAL',
    bufferZoneMeters: 1200,
    associatedDistrict: 'East Sikkim',
    notes: 'Sluice discharge regulated. Siltation sensors monitoring upstream debris surge.',
    dataSource: 'DEMO_SIMULATION',
  },
  {
    id: 'infra-rangpo-bridge',
    name: 'Rangpo Inter-State Transit Bridge',
    type: 'BRIDGE',
    coordinates: {
      lat: 27.1770,
      lng: 88.5300,
    },
    operationalStatus: 'OPERATIONAL',
    bufferZoneMeters: 200,
    associatedDistrict: 'Pakyoung / East Sikkim',
    notes: 'Main lifeline intake point for medical and food provisions into Sikkim.',
    dataSource: 'DEMO_SIMULATION',
  },
];
