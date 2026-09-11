import { RoadCorridor } from '@/types/roadStatus';

export const MOCK_ROAD_CORRIDORS: RoadCorridor[] = [
  {
    id: 'corridor-nh-10',
    code: 'NH-10',
    name: 'Teesta Valley Corridor (Siliguri - Gangtok)',
    status: 'BLOCKED',
    state: 'Sikkim / West Bengal',
    path: [
      { lat: 26.8850, lng: 88.4600 }, // Sevoke
      { lat: 27.0580, lng: 88.4350 }, // Teesta Bazar
      { lat: 27.1760, lng: 88.5280 }, // Rangpo border
      { lat: 27.2345, lng: 88.4980 }, // Km 44 Blockade site
      { lat: 27.2380, lng: 88.5000 }, // Singtam
      { lat: 27.2850, lng: 88.5800 }, // Ranipool
      { lat: 27.3389, lng: 88.6065 }, // Gangtok
    ],
    blockade: {
      segmentId: 'blockade-nh10-km44',
      chainageKm: 'Km 44',
      landmark: 'Singtam - Rangpo stretch (Teesta right bank)',
      debrisFlowLengthMeters: 80,
      passability: 'IMPASSABLE_ALL',
      cause: '80m debris flow with boulder accumulation over 3 lanes',
      estimatedClearanceHours: 14,
      activeMachinery: ['2x JCB Excavators', '1x CAT Wheel Loader', 'BRO Project Swastik'],
    },
    dataSource: 'DEMO_SIMULATION',
  },
  {
    id: 'corridor-reshi-bypass',
    code: 'NH-717A / Bypass',
    name: 'Reshi - Algarah - Rhenock Bypass Corridor',
    status: 'BYPASS_ACTIVE',
    state: 'Sikkim / West Bengal',
    isBypass: true,
    path: [
      { lat: 27.0580, lng: 88.4350 }, // Teesta Bazar
      { lat: 27.0600, lng: 88.4720 }, // Kalimpong
      { lat: 27.1120, lng: 88.5860 }, // Algarah
      { lat: 27.1850, lng: 88.6380 }, // Reshi / Rhenock
      { lat: 27.2450, lng: 88.6150 }, // Pakyong
      { lat: 27.3389, lng: 88.6065 }, // Gangtok
    ],
    dataSource: 'DEMO_SIMULATION',
  },
  {
    id: 'corridor-nh-27-haflong',
    code: 'NH-27',
    name: 'East-West Corridor (Haflong Pass)',
    status: 'RESTRICTED',
    state: 'Assam',
    path: [
      { lat: 25.1000, lng: 92.8500 },
      { lat: 25.1800, lng: 93.0200 },
      { lat: 25.2600, lng: 93.1800 },
    ],
    dataSource: 'DEMO_SIMULATION',
  },
];
