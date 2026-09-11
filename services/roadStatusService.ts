import { RoadCorridor } from '@/types/roadStatus';
import { MOCK_ROAD_CORRIDORS } from '@/data/mockRoads';
import { fetchWithFallback, API_BASE_URL, IS_LIVE_API_ENABLED } from './api';

export async function getRoadCorridors(): Promise<RoadCorridor[]> {
  const result = await fetchWithFallback<any>('/api/v1/roads/status', { corridors: MOCK_ROAD_CORRIDORS });
  if (result.isLive && result.data?.corridors) {
    // Merge live blockade status with full geometry from mock corridors
    return MOCK_ROAD_CORRIDORS.map((m) => {
      const live = result.data.corridors.find((c: any) => c.id === m.id);
      return live ? { ...m, ...live, path: m.path } : m;
    });
  }
  return MOCK_ROAD_CORRIDORS;
}

export async function calculateAlternativeRoute(origin: string = 'sevoke', destination: string = 'gangtok'): Promise<any> {
  if (IS_LIVE_API_ENABLED) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/roads/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[PRAVAAH API] Route planning live endpoint failed, falling back to local simulation:', err);
    }
  }

  // Local fallback simulation
  return {
    origin: { name: 'Sevoke (Siliguri Plain Entry)', coordinates: { lat: 26.8850, lng: 88.4600 } },
    destination: { name: 'Gangtok (State Capital / STNM Hospital)', coordinates: { lat: 27.3389, lng: 88.6065 } },
    primaryRoute: {
      name: 'NH-10 Teesta Valley Lifeline',
      status: 'IMPASSABLE_BLOCKADE',
      distanceKm: 75.0,
      estimatedTimeMins: 115,
      path: [
        { lat: 26.8850, lng: 88.4600 },
        { lat: 27.0580, lng: 88.4350 },
        { lat: 27.1760, lng: 88.5280 },
        { lat: 27.2345, lng: 88.4980 },
        { lat: 27.2380, lng: 88.5000 },
        { lat: 27.2850, lng: 88.5800 },
        { lat: 27.3389, lng: 88.6065 }
      ],
      blockade: {
        landmark: 'Km 44 Singtam - Rangpo Stretch',
        cause: '80m debris flow with boulder accumulation over 3 lanes',
      },
    },
    alternativeRoute: {
      name: 'NH-717A Reshi - Algarah - Pakyong Bypass Corridor',
      status: 'ACTIVE_SAFE_BYPASS',
      distanceKm: 118.0,
      estimatedTimeMins: 195,
      distanceDeltaKm: 43.0,
      timeDeltaMins: 80,
      path: [
        { lat: 26.8850, lng: 88.4600 },
        { lat: 27.0580, lng: 88.4350 },
        { lat: 27.0600, lng: 88.4720 },
        { lat: 27.1120, lng: 88.5860 },
        { lat: 27.1850, lng: 88.6380 },
        { lat: 27.2450, lng: 88.6150 },
        { lat: 27.2850, lng: 88.5800 },
        { lat: 27.3389, lng: 88.6065 }
      ],
    },
    advisory: 'ALERT: NH-10 is impassable at Km 44 due to active slope collapse. All emergency transit must divert via NH-717A Reshi-Algarah bypass.',
  };
}
