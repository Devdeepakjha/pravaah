import { fetchWithFallback } from './api';

export interface IncidentPriorityItem {
  id: string;
  zoneId: string;
  zoneName: string;
  district: string;
  state: string;
  basin: string;
  priority: 'P1' | 'P2' | 'P3';
  priorityLabel: string;
  priorityClass: string;
  riskScore: number;
  riskLevel: string;
  center: { lat: number; lng: number };
  reasons: string[];
  fieldReportsCount: number;
  activeBlockades: number;
  populationExposed: number;
  recommendedAction: string;
  primaryAction: string;
}

export interface ResponsePrioritiesPayload {
  count: number;
  incidents: IncidentPriorityItem[];
  summary: {
    p1_count: number;
    p2_count: number;
    p3_count: number;
  };
}

export async function getResponsePriorities(): Promise<ResponsePrioritiesPayload> {
  const fallbackData: ResponsePrioritiesPayload = {
    count: 5,
    incidents: [
      {
        id: 'resp-zone-east-sikkim',
        zoneId: 'zone-east-sikkim',
        zoneName: 'East Sikkim - Singtam / Dikchu Corridor',
        district: 'Gangtok',
        state: 'Sikkim',
        basin: 'Teesta Basin / NH-10',
        priority: 'P1',
        priorityLabel: 'P1 — Immediate Attention',
        priorityClass: 'CRITICAL',
        riskScore: 68.0,
        riskLevel: 'HIGH',
        center: { lat: 27.2400, lng: 88.5100 },
        reasons: [
          'Estimated Landslide Risk: 68.0% (HIGH)',
          'Village Exposure: 18,450 residents in Singtam & Dikchu settlements',
          'Critical Lifeline: NH-10 Lifeline & Dikchu-Gangtok bypass (3 active blockades)',
          'Facilities at Risk: Singtam District Hospital, 2 Power Stations, 4 Schools',
          'Field Evidence Verified: Singtam Slump & Tension Cracks (widening at 4mm/hr)'
        ],
        fieldReportsCount: 2,
        activeBlockades: 3,
        populationExposed: 18450,
        recommendedAction: 'Inspect slope immediately, divert transit to bypass corridor, and prepare pre-emptive evacuation for lower terraces.',
        primaryAction: 'Immediate Traffic Diversion & Pre-emptive Evacuation along Lower Terraces'
      }
    ],
    summary: { p1_count: 2, p2_count: 1, p3_count: 2 }
  };

  const res = await fetchWithFallback<ResponsePrioritiesPayload>('/api/v1/response/priorities', fallbackData);
  return res.data;
}
